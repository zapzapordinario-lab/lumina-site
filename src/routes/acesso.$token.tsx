import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tv,
  Smartphone,
  Monitor,
  Apple,
  MonitorPlay,
  Box,
  Radio,
  Copy,
  X,
  Loader2,
  MessageCircle,
  Send,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { getIptvAccessByToken } from "@/lib/iptv.functions";
import { waLink } from "@/lib/db";

export const Route = createFileRoute("/acesso/$token")({
  ssr: false,
  component: AccessPage,
});

interface DeviceTut {
  id: string;
  label: string;
  icon: any;
  color: string;
  steps: string[];
}

const DEVICES: DeviceTut[] = [
  {
    id: "android",
    label: "Android",
    icon: Smartphone,
    color: "var(--lime)",
    steps: [
      "Abra a Play Store e instale o app 'IPTV Smarters Pro' (ou use o Downloader com o código 5219138).",
      "Abra o app e escolha 'Login with Xtream Codes API'.",
      "Preencha Username, Password e a URL do Servidor exibidos acima.",
      "Toque em Add User e aguarde o carregamento da lista de canais.",
    ],
  },
  {
    id: "windows",
    label: "Windows",
    icon: Monitor,
    color: "var(--cyan)",
    steps: [
      "Acesse o Webplayer ou baixe o 'IPTV Smarters Pro' para Windows.",
      "Selecione 'Login with Xtream Codes API'.",
      "Insira Username, Password e a URL do Servidor.",
      "Clique em Add User para carregar o conteúdo.",
    ],
  },
  {
    id: "ios",
    label: "iOS / iPhone",
    icon: Apple,
    color: "var(--magenta)",
    steps: [
      "Na App Store instale 'Smarters Player Lite', 'IPTV Player.io' ou 'VIZZION PLAY'.",
      "Escolha o login via Xtream Codes API.",
      "Digite Username, Password e a URL do Servidor.",
      "Confirme e aguarde o carregamento dos canais.",
    ],
  },
  {
    id: "lg",
    label: "Smart TV LG",
    icon: Tv,
    color: "var(--cyan)",
    steps: [
      "Abra a Content Store da LG e instale 'IPTV Smarters Player'.",
      "Inicie o app e selecione Xtream Codes API.",
      "Informe Username, Password e a URL do Servidor.",
      "Adicione o usuário e aproveite.",
    ],
  },
  {
    id: "samsung",
    label: "Smart TV Samsung",
    icon: Tv,
    color: "var(--magenta)",
    steps: [
      "Na loja Samsung instale '4K IPTV' ou 'Playsim'.",
      "Abra o app e escolha login por Xtream Codes API.",
      "Preencha Username, Password e a URL do Servidor.",
      "Salve e carregue a lista de canais.",
    ],
  },
  {
    id: "tvbox",
    label: "TV Box",
    icon: Box,
    color: "var(--lime)",
    steps: [
      "Baixe o APK do IPTV Smarters Pro diretamente (Downloader/navegador).",
      "Instale e abra o aplicativo na sua TV Box.",
      "Escolha Xtream Codes API e insira seus dados.",
      "Confirme para carregar todo o conteúdo.",
    ],
  },
  {
    id: "roku",
    label: "Roku / Outros",
    icon: Radio,
    color: "var(--cyan)",
    steps: [
      "No Roku procure por um app compatível com Xtream Codes.",
      "Abra o app e selecione o login Xtream Codes API.",
      "Informe Username, Password e a URL do Servidor.",
      "Adicione e comece a assistir.",
    ],
  },
];

function CopyField({ label, value }: { label: string; value: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-2.5">
      <div className="flex-1 overflow-hidden">
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="truncate font-display text-sm">{value || "—"}</p>
      </div>
      <button
        onClick={() => {
          navigator.clipboard.writeText(value);
          setDone(true);
          toast.success(`${label} copiado`);
          setTimeout(() => setDone(false), 1500);
        }}
        className="rounded-lg border border-cyan/50 p-2 text-cyan hover:bg-cyan/10"
      >
        {done ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

function AccessPage() {
  const { token } = useParams({ from: "/acesso/$token" });
  const [modal, setModal] = useState<DeviceTut | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["access", token],
    queryFn: () => getIptvAccessByToken({ data: { token } }),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-cyan" />
      </div>
    );
  }

  if (!data?.found) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
        <MonitorPlay className="h-12 w-12 text-magenta" />
        <h1 className="font-display text-2xl font-bold">Link inválido</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Este link de acesso não existe ou foi removido. Entre em contato com o
          suporte.
        </p>
      </div>
    );
  }

  const a = data.access;

  return (
    <div className="relative min-h-screen bg-background px-4 py-10">
      <div
        className="pointer-events-none fixed inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "46px 46px",
          maskImage: "radial-gradient(circle at top, black, transparent 80%)",
        }}
      />
      <div className="relative mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-cyan/80">
            // DezPila
          </p>
          <h1 className="mt-2 font-display text-3xl font-black md:text-4xl">
            Dashboard — Como acessar a{" "}
            <span className="text-glow-magenta">plataforma!</span>
          </h1>
          {a.client_name && (
            <p className="mt-2 text-sm text-muted-foreground">Olá, {a.client_name}! 👋</p>
          )}
        </motion.div>

        {/* Access card */}
        <div className="corner-frame mt-8 rounded-2xl border border-cyan/40 bg-card/50 p-5 backdrop-blur glow-cyan">
          <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-cyan">
            Seus dados de acesso
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <CopyField label="Username" value={a.username} />
            <CopyField label="Password" value={a.password} />
            <CopyField label="Servidor Principal" value={a.server_primary ?? ""} />
            <CopyField label="Servidor Secundário" value={a.server_secondary ?? ""} />
          </div>
        </div>

        {/* Device grid */}
        <h2 className="mt-10 text-center font-display text-lg font-bold uppercase tracking-wide">
          Escolha seu dispositivo
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {DEVICES.map((d) => (
            <motion.button
              key={d.id}
              whileHover={{ scale: 1.04, y: -3 }}
              onClick={() => setModal(d)}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card/40 px-3 py-6 backdrop-blur transition-all hover:border-cyan/60"
            >
              <d.icon className="h-8 w-8" style={{ color: d.color }} />
              <span className="font-display text-xs font-bold uppercase tracking-wide">
                {d.label}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Support footer */}
        <div className="mt-12 rounded-2xl border border-lime/40 bg-card/40 p-6 text-center backdrop-blur">
          <p className="text-sm text-muted-foreground">
            Não encontrou seu dispositivo ou está com dificuldades? Entre em
            contato com nosso atendimento.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {a.support_whatsapp && (
              <a
                href={waLink(a.support_whatsapp, "Olá! Preciso de ajuda com meu acesso IPTV.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-lime/60 bg-lime/10 px-5 py-3 font-display text-sm font-bold uppercase tracking-wide text-lime hover:bg-lime/20"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            )}
            {a.support_telegram && (
              <a
                href={`https://t.me/${a.support_telegram.replace(/^@/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-cyan/60 bg-cyan/10 px-5 py-3 font-display text-sm font-bold uppercase tracking-wide text-cyan hover:bg-cyan/20"
              >
                <Send className="h-4 w-4" /> Telegram
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tutorial modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-cyan/40 bg-card p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <modal.icon className="h-6 w-6" style={{ color: modal.color }} />
                  <h2 className="font-display text-lg font-bold uppercase tracking-wide">
                    {modal.label}
                  </h2>
                </div>
                <button onClick={() => setModal(null)}>
                  <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                </button>
              </div>

              <div className="space-y-3">
                {modal.steps.map((s, i) => (
                  <div key={i} className="flex gap-3">
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-xs font-bold"
                      style={{
                        color: modal.color,
                        background: `color-mix(in oklab, ${modal.color} 18%, transparent)`,
                      }}
                    >
                      {i + 1}
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{s}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-lg border border-border bg-background/50 p-3">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-cyan">
                  Seus dados
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <span className="text-muted-foreground">User:</span>
                  <span className="font-bold">{a.username}</span>
                  <span className="text-muted-foreground">Senha:</span>
                  <span className="font-bold">{a.password}</span>
                  <span className="text-muted-foreground">Servidor:</span>
                  <span className="truncate font-bold">{a.server_primary}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
