import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Save,
  Copy,
  Upload,
  Download,
  Send,
  Loader2,
  FileJson,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { db, type AppSettings, type AutomationFlow } from "@/lib/db";

export const Route = createFileRoute("/admin/automation")({
  ssr: false,
  component: AutomationPage,
});

function AutomationPage() {
  const qc = useQueryClient();
  const [cfg, setCfg] = useState({
    chatbot_webhook: "",
    chatbot_token: "",
    chatbot_base_url: "",
  });
  const [contract, setContract] = useState({ to: "", message: "" });
  const [sending, setSending] = useState(false);

  const { data: settings } = useQuery<AppSettings>({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await db.from("app_settings").select("*").eq("id", "global").maybeSingle();
      return data;
    },
  });
  const { data: flows = [] } = useQuery<AutomationFlow[]>({
    queryKey: ["flows"],
    queryFn: async () => {
      const { data } = await db
        .from("automation_flows")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  useEffect(() => {
    if (settings)
      setCfg({
        chatbot_webhook: settings.chatbot_webhook ?? "",
        chatbot_token: settings.chatbot_token ?? "",
        chatbot_base_url: settings.chatbot_base_url ?? "",
      });
  }, [settings]);

  const saveCfg = async () => {
    const { error } = await db.from("app_settings").update(cfg).eq("id", "global");
    if (error) return toast.error(error.message);
    toast.success("Integração salva");
    qc.invalidateQueries({ queryKey: ["settings"] });
  };

  const sendContract = async () => {
    if (!cfg.chatbot_webhook) return toast.error("Configure o Webhook primeiro");
    if (!contract.to || !contract.message) return toast.error("Preencha destino e mensagem");
    setSending(true);
    try {
      const res = await fetch(cfg.chatbot_webhook, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(cfg.chatbot_token ? { Authorization: `Bearer ${cfg.chatbot_token}` } : {}),
        },
        body: JSON.stringify({ to: contract.to, message: contract.message }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success("Mensagem disparada via chatbot");
    } catch (e: any) {
      toast.error("Falha ao disparar: " + (e.message ?? "erro"));
    } finally {
      setSending(false);
    }
  };

  const copyFlow = (f: AutomationFlow) => {
    navigator.clipboard.writeText(JSON.stringify(f.content, null, 2));
    toast.success("Fluxo copiado para a área de transferência");
  };

  const exportFlow = (f: AutomationFlow) => {
    const blob = new Blob([JSON.stringify(f.content, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fluxo-${f.title.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFlow = async (file: File) => {
    try {
      const text = await file.text();
      const content = JSON.parse(text);
      const { error } = await db.from("automation_flows").insert({
        title: file.name.replace(/\.json$/i, ""),
        category: "importado",
        content,
        is_template: false,
      });
      if (error) throw error;
      toast.success("Fluxo importado");
      qc.invalidateQueries({ queryKey: ["flows"] });
    } catch (e: any) {
      toast.error("JSON inválido: " + (e.message ?? ""));
    }
  };

  const removeFlow = async (id: string) => {
    if (!confirm("Remover fluxo?")) return;
    await db.from("automation_flows").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["flows"] });
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-black">Automação & Chatbot</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Integração de API de WhatsApp, disparo de contratos e biblioteca de fluxos.
      </p>

      {/* Integration config */}
      <div className="mt-6 rounded-xl border border-cyan/40 bg-card/40 p-5 backdrop-blur">
        <div className="mb-4 flex items-center gap-2">
          <Bot className="h-5 w-5 text-cyan" />
          <h2 className="font-display text-lg font-bold uppercase tracking-wide">
            Integração de API
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Lbl>Webhook URL</Lbl>
            <input
              value={cfg.chatbot_webhook}
              onChange={(e) => setCfg({ ...cfg, chatbot_webhook: e.target.value })}
              className="inp"
              placeholder="https://api.seu-bot.com/send"
            />
          </div>
          <div>
            <Lbl>Token / API Key</Lbl>
            <input
              value={cfg.chatbot_token}
              onChange={(e) => setCfg({ ...cfg, chatbot_token: e.target.value })}
              className="inp"
              type="password"
            />
          </div>
          <div>
            <Lbl>URL Base</Lbl>
            <input
              value={cfg.chatbot_base_url}
              onChange={(e) => setCfg({ ...cfg, chatbot_base_url: e.target.value })}
              className="inp"
              placeholder="https://api.seu-bot.com"
            />
          </div>
        </div>
        <button
          onClick={saveCfg}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-cyan bg-cyan/10 px-4 py-2.5 font-display text-xs font-bold uppercase tracking-wide text-cyan hover:bg-cyan/20"
        >
          <Save className="h-4 w-4" /> Salvar integração
        </button>
      </div>

      {/* Contract / message dispatch */}
      <div className="mt-6 rounded-xl border border-magenta/40 bg-card/40 p-5 backdrop-blur">
        <div className="mb-4 flex items-center gap-2">
          <Send className="h-5 w-5 text-magenta" />
          <h2 className="font-display text-lg font-bold uppercase tracking-wide">
            Contrato / Disparo de mensagem
          </h2>
        </div>
        <div className="grid gap-3">
          <div>
            <Lbl>Destino (número)</Lbl>
            <input
              value={contract.to}
              onChange={(e) => setContract({ ...contract, to: e.target.value })}
              className="inp"
              placeholder="5588999999999"
            />
          </div>
          <div>
            <Lbl>Mensagem</Lbl>
            <textarea
              value={contract.message}
              onChange={(e) => setContract({ ...contract, message: e.target.value })}
              className="inp min-h-[90px]"
              placeholder="Olá! Segue seu contrato / cobrança…"
            />
          </div>
        </div>
        <button
          onClick={sendContract}
          disabled={sending}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-magenta bg-magenta/10 px-4 py-2.5 font-display text-xs font-bold uppercase tracking-wide text-magenta hover:bg-magenta/20 disabled:opacity-50"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Disparar pelo chatbot
        </button>
      </div>

      {/* Flow library */}
      <div className="mt-6 rounded-xl border border-border bg-card/40 p-5 backdrop-blur">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileJson className="h-5 w-5 text-lime" />
            <h2 className="font-display text-lg font-bold uppercase tracking-wide">
              Biblioteca de Fluxos ({flows.length})
            </h2>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-lime/60 bg-lime/10 px-4 py-2 font-display text-xs font-bold uppercase tracking-wide text-lime hover:bg-lime/20">
            <Upload className="h-4 w-4" /> Importar JSON
            <input
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && importFlow(e.target.files[0])}
            />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {flows.map((f) => (
            <motion.div
              key={f.id}
              whileHover={{ y: -3 }}
              className="rounded-lg border border-border bg-background/40 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-display text-sm font-bold">{f.title}</p>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {f.category}
                    {f.is_template && " · modelo"}
                  </span>
                </div>
                <button
                  onClick={() => removeFlow(f.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <pre className="mt-3 max-h-24 overflow-auto rounded bg-black/30 p-2 text-[10px] text-muted-foreground">
                {JSON.stringify(f.content, null, 1)}
              </pre>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => copyFlow(f)}
                  className="inline-flex items-center gap-1 rounded border border-border px-2.5 py-1.5 text-[10px] font-bold uppercase text-muted-foreground hover:text-cyan"
                >
                  <Copy className="h-3 w-3" /> Copiar
                </button>
                <button
                  onClick={() => exportFlow(f)}
                  className="inline-flex items-center gap-1 rounded border border-border px-2.5 py-1.5 text-[10px] font-bold uppercase text-muted-foreground hover:text-lime"
                >
                  <Download className="h-3 w-3" /> Exportar
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Lbl({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block font-display text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
      {children}
    </label>
  );
}
