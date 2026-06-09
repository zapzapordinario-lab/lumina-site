import { createServerFn } from "@tanstack/react-start";

interface PixInput {
  amount: number;
  description: string;
  payer_email?: string;
  kind: "client_payment" | "reseller_topup";
  reseller_id?: string | null;
  client_id?: string | null;
  plan_id?: string | null;
}

/**
 * Creates a Mercado Pago PIX charge and records a pending entry so the webhook
 * can confirm it later. Returns the QR code data for display.
 * If MERCADOPAGO_ACCESS_TOKEN is not configured, returns a friendly error.
 */
export const createPixCharge = createServerFn({ method: "POST" })
  .inputValidator((d: PixInput) => {
    if (!d || typeof d.amount !== "number" || d.amount <= 0) {
      throw new Error("Valor inválido");
    }
    if (d.kind !== "client_payment" && d.kind !== "reseller_topup") {
      throw new Error("Tipo inválido");
    }
    return d;
  })
  .handler(async ({ data }) => {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) {
      return {
        ok: false as const,
        error:
          "Pagamento via PIX ainda não configurado. Adicione o Access Token do Mercado Pago.",
      };
    }

    const idempotencyKey = crypto.randomUUID();
    const body = {
      transaction_amount: Number(data.amount.toFixed(2)),
      description: data.description,
      payment_method_id: "pix",
      payer: { email: data.payer_email || "comprador@email.com" },
    };

    const res = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(body),
    });

    const mp = await res.json();
    if (!res.ok) {
      return { ok: false as const, error: mp?.message ?? "Falha ao gerar PIX" };
    }

    const reference = String(mp.id);
    const tx = mp.point_of_interaction?.transaction_data ?? {};

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.kind === "client_payment") {
      await supabaseAdmin.from("payments").insert({
        client_id: data.client_id ?? null,
        plan_id: data.plan_id ?? null,
        reseller_id: data.reseller_id ?? null,
        amount: data.amount,
        method: "pix",
        status: "pending",
        reference,
        description: data.description,
      });
    } else {
      if (!data.reseller_id) {
        return { ok: false as const, error: "Revendedor não identificado" };
      }
      await supabaseAdmin.from("reseller_transactions").insert({
        reseller_id: data.reseller_id,
        type: "credit_purchase",
        amount: data.amount,
        status: "pending",
        reference,
        description: data.description,
      });
    }

    return {
      ok: true as const,
      id: reference,
      qr_code: tx.qr_code ?? null,
      qr_code_base64: tx.qr_code_base64 ?? null,
      ticket_url: tx.ticket_url ?? null,
    };
  });
