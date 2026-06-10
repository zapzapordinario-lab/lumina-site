import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tv,
  Smartphone,
  Apple,
  Box,
  Radio,
  MonitorPlay,
  Loader2,
  Lock,
  User as UserIcon,
  ShieldAlert,
  PlayCircle,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";
import { validateInstructionLogin } from "@/lib/instructions.functions";

export const Route = createFileRoute("/instrucoes")({
  ssr: false,
  component: InstructionsPage,
});

interface DeviceTut {
  id: string;
  label: string;
  icon: any;
  color: string;
  copy: string;
  videoId: string;
  bonus?: { title: string; copy: string; videoId: string };
}

const DEVICES: DeviceTut[] = [
  {
    id: "samsung",
    label: "Samsung (Tizen)",
    icon: Tv,
    color: "var(--magenta)",
    copy: "Na sua Samsung, abra a Smart Hub e procure por um app como 'Smart IPTV', 'IBO Player' ou 'IPTV Smarters'. Instale, anote o MAC do aparelho se solicitado e faça login usando os dados de acesso (Xtream Codes) que você recebeu.",
    videoId: "8bMYXr9H4Qw",
  },
  {
    id: "lg",
    label: "LG (webOS)",
    icon: Tv,
    color: "var(--cyan)",
    copy: "Na sua LG, abra a LG Content Store e busque por 'IBO Player', 'Smart IPTV' ou 'IPTV Smarters Pro'. Instale o app e faça login com Xtream Codes API usando seu usuário, senha e URL do servidor.",
    videoId: "RT7hN8c9o0E",
  },
  {
    id: "roku",
    label: "Roku TV (AOC/TCL/Semp)",
    icon: Radio,
    color: "var(--lime)",
    copy: "Na sua Roku, acesse a loja de canais (Streaming Channels) e pesquise por um app parceiro compatível com Xtream Codes. Adicione o canal e informe seu usuário, senha e a URL do servidor para carregar a lista.",
    videoId: "n5sHvgY5wWk",
  },
  {
    id: "androidtv",
    label: "Android TV / Google TV",
    icon: MonitorPlay,
    color: "var(--cyan)",
    copy: "Em TVs Sony, TCL, Philips ou no Chromecast com Google TV, instale o 'IPTV Smarters Pro' pela Play Store. Abra o app, escolha 'Login com Xtream Codes API' e digite seu usuário, senha e a URL do servidor.",
    videoId: "Q8Tj6Z2pH2s",
    bonus: {
      title: "Bônus: desativar o Play Protect",
      copy: "Antes de instalar apps externos, abra a Play Store > toque na sua foto/perfil > Play Protect > Configurações (engrenagem) e DESATIVE 'Verificar apps com o Play Protect'. Isso evita que o sistema bloqueie o aplicativo.",
      videoId: "9wTcL9F0aQk",
    },
  },
  {
    id: "tvbox",
    label: "TV Box (Inova/MXQ/Aquário)",
    icon: Box,
    color: "var(--lime)",
    copy: "Na sua TV Box, instale o app 'Downloader' pela Play Store (ou use o navegador). Digite o link do APK do IPTV Smarters Pro, baixe e instale. Depois abra o app e faça login com Xtream Codes API.",
    videoId: "1pXh7m9Yc1U",
  },
  {
    id: "android",
    label: "Celular / Tablet Android",
    icon: Smartphone,
    color: "var(--magenta)",
    copy: "No seu Android, instale o 'IPTV Smarters Pro' pela Play Store. Abra o app, selecione 'Login com Xtream Codes API' e preencha usuário, senha e a URL do servidor recebidos.",
    videoId: "f3iJ7m6q9bA",
    bonus: {
      title: "Bônus: Play Protect e fontes desconhecidas",
      copy: "Para instalar APKs externos: vá em Configurações > Segurança e ative 'Fontes desconhecidas' (ou permita para o navegador/Downloader). Depois abra a Play Store > perfil > Play Protect e desative a verificação de apps.",
      videoId: "rXxLp8nQ2vE",
    },
  },
  {
    id: "ios",
    label: "iPhone / iPad (iOS)",
    icon: Apple,
    color: "var(--cyan)",
    copy: "No seu iPhone ou iPad, abra a App Store e instale 'Smarters Player Lite' ou 'IPTV Player.io'. Abra o app, escolha o login por Xtream Codes API e informe usuário, senha e a URL do servidor.",
    videoId: "kqW6cI4xU2s",
  },
  {
    id: "firetv",
    label: "Fire TV Stick (Amazon)",
    icon: MonitorPlay,
    color: "var(--lime)",
    copy: "No Fire TV Stick, vá em Configurações > Meu Fire TV > Opções de desenvolvedor e ative 'Apps de fontes desconhecidas'. Instale o app 'Downloader', digite o link do APK do IPTV Smarters Pro, instale e faça login com Xtream Codes API.",
    videoId: "6Yq4z7Qx0bE",
  },
];

function GridBg() {
  return (
    <div
      className="pointer-events-none fixed inset-0 opacity-30"
      style={{
        backgroundImage:
          "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
        backgroundSize: "46px 46px",
        maskImage: "radial-gradient(circle at top, black, transparent 80%)",
      }}
    />
  );
}

function VideoEmbed({ id, title }: { id: string; title: string }) {
  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-cyan/30 bg-black" style={{ paddingTop: "56.25%" }}>
      <iframe
        className="absolute inset-0 h-full w-full"
        src={`https://www.youtube.com/embed/${id}`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}

function InstructionsPage() {
  const [authed, setAuthed] = useState(false);
  const [clientName, setClientName] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<DeviceTut | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim())
      return toast.error("Informe usuário e senha");
    setLoading(true);
    try {
      const res = await validateInstructionLogin({
        data: { username: username.trim(), password: password.trim() },
      });
      if (res.ok) {
        setAuthed(true);
        setClientName(res.client_name ?? null);
        toast.success("Acesso liberado!");
      } else {
        toast.error("Usuário ou senha inválidos");
      }
    } catch {
      toast.error("Não foi possível validar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!authed) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10">
        <GridBg />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full max-w-sm"
        >
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-magenta/50 bg-magenta/10 glow-magenta">
              <Tv className="h-7 w-7 text-magenta" />
            </div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-cyan/80">
              // Instruções
            </p>
            <h1 className="mt-2 font-display text-2xl font-black">
              Acesse seus <span className="text-glow-magenta">tutoriais</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Entre com o usuário e senha enviados pelo suporte.
            </p>
          </div>

          <form
            onSubmit={submit}
            className="corner-frame space-y-3 rounded-2xl border border-cyan/40 bg-card/60 p-5 backdrop-blur glow-cyan"
          >
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background/50 px-3">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Usuário"
                autoCapitalize="none"
                className="w-full bg-transparent py-3 text-sm outline-none"
              />
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background/50 px-3">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                className="w-full bg-transparent py-3 text-sm outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-magenta bg-magenta/10 px-4 py-3 font-display text-sm font-bold uppercase tracking-wide text-magenta hover:bg-magenta/20 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              Entrar
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background px-4 py-10">
      <GridBg />
      <div className="relative mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-magenta/50 bg-magenta/10 glow-magenta">
            <Tv className="h-8 w-8 text-magenta" />
          </div>
          <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-cyan/80">
            // DezPila
          </p>
          <h1 className="mt-2 font-display text-3xl font-black md:text-4xl">
            Como instalar e{" "}
            <span className="text-glow-magenta">assistir!</span>
          </h1>
          {clientName && (
            <p className="mt-2 text-sm text-muted-foreground">
              Olá, {clientName}! 👋 Escolha seu dispositivo abaixo.
            </p>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {!selected ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3"
            >
              {DEVICES.map((d) => (
                <motion.button
                  key={d.id}
                  whileHover={{ scale: 1.04, y: -3 }}
                  onClick={() => setSelected(d)}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card/40 px-3 py-6 text-center backdrop-blur transition-all hover:border-cyan/60"
                >
                  <d.icon className="h-8 w-8" style={{ color: d.color }} />
                  <span className="font-display text-xs font-bold uppercase tracking-wide leading-tight">
                    {d.label}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8"
            >
              <button
                onClick={() => setSelected(null)}
                className="mb-4 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 font-display text-xs font-bold uppercase tracking-wide text-muted-foreground hover:text-cyan"
              >
                <ChevronLeft className="h-4 w-4" /> Voltar
              </button>

              <div className="rounded-2xl border border-cyan/40 bg-card/50 p-5 backdrop-blur">
                <div className="mb-3 flex items-center gap-2">
                  <selected.icon
                    className="h-6 w-6"
                    style={{ color: selected.color }}
                  />
                  <h2 className="font-display text-lg font-bold uppercase tracking-wide">
                    {selected.label}
                  </h2>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  {selected.copy}
                </p>
                <VideoEmbed id={selected.videoId} title={selected.label} />

                {selected.bonus && (
                  <div className="mt-6 rounded-xl border border-lime/40 bg-lime/5 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <ShieldAlert className="h-5 w-5 text-lime" />
                      <h3 className="font-display text-sm font-bold uppercase tracking-wide text-lime">
                        {selected.bonus.title}
                      </h3>
                    </div>
                    <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                      {selected.bonus.copy}
                    </p>
                    <VideoEmbed
                      id={selected.bonus.videoId}
                      title={selected.bonus.title}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!selected && (
          <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
            <PlayCircle className="h-4 w-4 text-cyan" />
            Toque em um dispositivo para ver o passo a passo em vídeo.
          </p>
        )}
      </div>
    </div>
  );
}
