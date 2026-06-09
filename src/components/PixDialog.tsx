import { useState } from "react";
import { motion } from "framer-motion";
import { X, Loader2, Copy, QrCode } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { createPixCharge } from "@/lib/payments.functions";
import { brl } from "@/lib/db";

interface Props {
  open: boolean;
  onClose: () => void;
  defaultAmount?: number;
  description: string;
  kind: "client_payment" | "reseller_topup";
  reseller_id?: string | null;
  client_id?: string | null;
  plan_id?: string | null;
  payer_email?: string;
}

export function PixDialog({
  open,
  onClose,
  defaultAmount = 0,
  description,
  kind,
  reseller_id = null,
  client_id = null,
  plan_id = null,
  payer_email,
}: Props) {
  const charge = useServerFn(createPixCharge);
  const [amount, setAmount] = useState(String(defaultAmount || ""));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    qr_code: string | null;
    qr_code_base64: string | null;
    ticket_url: string | null;
  } | null>(null);

  if (!open) return null;

  const generate = async () => {
    const val = Number(amount);
    if (!val || val <= 0) return toast.error("Informe um valor válido");
    setLoading(true);
    try {
      const res = await charge({
        data: { amount: val, description, kind, reseller_id, client_id, plan_id, payer_email },
      });
      if (!res.ok) {
        toast.error(res.error);
      } else {
        setResult({
          qr_code: res.qr_code,
          qr_code_base64: res.qr_code_base64,
          ticket_url: res.ticket_url,
        });
        toast.success("PIX gerado! Aguardando pagamento.");
      }
    } catch (e: any) {
      toast.error(e.message ?? "Falha ao gerar PIX");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    if (result?.qr_code) {
      navigator.clipboard.writeText(result.qr_code);
      toast.success("Código PIX copiado");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-lime/40 bg-card p-6"
        style={{ boxShadow: "0 0 40px -12px var(--lime)" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold uppercase tracking-wide text-lime">
            <QrCode className="h-5 w-5" /> Pagamento PIX
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>

        <p className="mb-4 text-xs text-muted-foreground">{description}</p>

        {!result ? (
          <>
            <label className="mb-1 block font-display text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-lime"
            />
            <button
              onClick={generate}
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-lime bg-lime/10 px-4 py-3 font-display text-sm font-bold uppercase tracking-wide text-lime transition-all hover:bg-lime/20 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Gerar PIX {amount ? brl(Number(amount)) : ""}
            </button>
          </>
        ) : (
          <div className="text-center">
            {result.qr_code_base64 && (
              <img
                src={`data:image/png;base64,${result.qr_code_base64}`}
                alt="QR Code PIX"
                className="mx-auto h-52 w-52 rounded-lg border border-border bg-white p-2"
              />
            )}
            {result.qr_code && (
              <button onClick={copy} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-cyan/60 bg-cyan/10 px-4 py-2 text-xs font-bold uppercase text-cyan hover:bg-cyan/20">
                <Copy className="h-4 w-4" /> Copiar código PIX
              </button>
            )}
            {result.ticket_url && (
              <a href={result.ticket_url} target="_blank" rel="noopener noreferrer" className="mt-2 block text-xs text-muted-foreground underline">
                Abrir comprovante
              </a>
            )}
            <p className="mt-4 text-[11px] text-muted-foreground">
              O saldo/pagamento é confirmado automaticamente após a quitação.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
