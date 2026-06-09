import { createFileRoute } from "@tanstack/react-router";

/**
 * Mercado Pago payment webhook. Confirms pending PIX charges:
 * - client_payment rows in `payments` are marked paid
 * - reseller_topup rows in `reseller_transactions` are marked paid and the
 *   reseller balance is credited.
 */
export const Route = createFileRoute("/api/public/mercadopago")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
        if (!token) return new Response("not configured", { status: 200 });

        let payload: any = {};
        try {
          payload = await request.json();
        } catch {
          return new Response("bad request", { status: 400 });
        }

        const paymentId =
          payload?.data?.id ?? payload?.resource ?? payload?.id ?? null;
        const type = payload?.type ?? payload?.topic ?? "";
        if (!paymentId || (type && !String(type).includes("payment"))) {
          return new Response("ignored", { status: 200 });
        }

        // verify the payment status directly with Mercado Pago
        const res = await fetch(
          `https://api.mercadopago.com/v1/payments/${paymentId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!res.ok) return new Response("lookup failed", { status: 200 });
        const mp = await res.json();
        const reference = String(mp.id);
        const approved = mp.status === "approved";
        if (!approved) return new Response("pending", { status: 200 });

        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );

        // client payment?
        const { data: pay } = await supabaseAdmin
          .from("payments")
          .select("*")
          .eq("reference", reference)
          .eq("status", "pending")
          .maybeSingle();
        if (pay) {
          await supabaseAdmin
            .from("payments")
            .update({ status: "paid", paid_at: new Date().toISOString() })
            .eq("id", pay.id);
          return new Response("ok", { status: 200 });
        }

        // reseller top-up?
        const { data: tx } = await supabaseAdmin
          .from("reseller_transactions")
          .select("*")
          .eq("reference", reference)
          .eq("status", "pending")
          .maybeSingle();
        if (tx) {
          const { data: reseller } = await supabaseAdmin
            .from("resellers")
            .select("balance")
            .eq("id", tx.reseller_id)
            .single();
          const newBalance = Number(reseller?.balance ?? 0) + Number(tx.amount);
          await supabaseAdmin
            .from("resellers")
            .update({ balance: newBalance })
            .eq("id", tx.reseller_id);
          await supabaseAdmin
            .from("reseller_transactions")
            .update({ status: "paid", balance_after: newBalance })
            .eq("id", tx.id);
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});
