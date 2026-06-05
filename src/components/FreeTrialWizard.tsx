import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "./Reveal";
import {
  Tv,
  Smartphone,
  MonitorPlay,
  Tablet,
  Laptop,
  Box,
  ArrowRight,
  ArrowLeft,
  Check,
  MessageCircle,
} from "lucide-react";

const PRIMARY_WA = "5588998044487";

const devices = [
  { id: "smart-tv", label: "Smart TV", desc: "Samsung, LG, Android TV", icon: Tv, color: "var(--cyan)" },
  { id: "tv-box", label: "TV Box", desc: "Android Box, MXQ, etc.", icon: Box, color: "var(--cyan)" },
  { id: "celular", label: "Celular", desc: "Android ou iPhone", icon: Smartphone, color: "var(--magenta)" },
  { id: "fire-stick", label: "Fire Stick", desc: "Amazon Fire TV", icon: MonitorPlay, color: "var(--magenta)" },
  { id: "tablet", label: "Tablet", desc: "Android ou iPad", icon: Tablet, color: "var(--lime)" },
  { id: "computador", label: "PC / Mac", desc: "Windows, macOS, Linux", icon: Laptop, color: "var(--lime)" },
];

const steps = ["Dispositivo", "Seus dados", "Finalizar"];

export function FreeTrialWizard() {
  const [step, setStep] = useState(0);
  const [device, setDevice] = useState<string | null>(null);
  const [name, setName] = useState("");

  const selectedDevice = devices.find((d) => d.id === device);

  const buildWaLink = () => {
    const deviceLabel = selectedDevice?.label ?? "não informado";
    const msg = `Olá! Quero ativar meu *TESTE GRÁTIS* da DezPila 🎬\n\n👤 Nome: ${name || "—"}\n📺 Dispositivo: ${deviceLabel}\n\nPode me ajudar a começar?`;
    return `https://wa.me/${PRIMARY_WA}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <section id="teste-gratis" className="px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <Reveal className="text-center">
          <p className="mb-3 font-display text-xs font-bold uppercase tracking-[0.35em] text-cyan/80">
            // Teste Grátis
          </p>
          <h2 className="text-4xl font-black md:text-5xl">
            Ative em <span className="text-glow-magenta">3 passos.</span>
          </h2>
          <p className="mt-4 text-sm uppercase tracking-wider text-muted-foreground">
            1 hora completa · Sem cartão · Sem compromisso
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="corner-frame mt-12 overflow-hidden rounded-3xl border border-cyan/40 bg-card/40 p-6 backdrop-blur glow-cyan sm:p-9">
            {/* STEP INDICATOR */}
            <div className="mb-9 flex items-center justify-center gap-2 sm:gap-4">
              {steps.map((label, i) => (
                <div key={label} className="flex items-center gap-2 sm:gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full border font-display text-sm font-bold transition-all ${
                        i < step
                          ? "border-lime bg-lime/15 text-lime"
                          : i === step
                            ? "border-cyan bg-cyan/15 text-cyan glow-cyan"
                            : "border-border text-muted-foreground"
                      }`}
                    >
                      {i < step ? <Check className="h-4 w-4" /> : i + 1}
                    </div>
                    <span
                      className={`hidden font-display text-[10px] font-bold uppercase tracking-wider sm:block ${
                        i === step ? "text-cyan" : "text-muted-foreground"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`h-px w-8 sm:w-16 ${i < step ? "bg-lime" : "bg-border"}`} />
                  )}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* STEP 1 — DEVICE */}
              {step === 0 && (
                <motion.div
                  key="step-device"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25 }}
                >
                  <h3 className="text-center font-display text-lg font-bold uppercase tracking-wide">
                    Onde você vai assistir?
                  </h3>
                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {devices.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setDevice(d.id)}
                        className={`flex flex-col items-center gap-2 rounded-xl border bg-card/40 px-3 py-5 text-center transition-all ${
                          device === d.id
                            ? "border-cyan glow-cyan"
                            : "border-border hover:border-cyan/50"
                        }`}
                      >
                        <d.icon className="h-7 w-7" style={{ color: d.color }} />
                        <span className="font-display text-xs font-bold uppercase tracking-wide">{d.label}</span>
                        <span className="text-[10px] leading-tight text-muted-foreground">{d.desc}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-8 flex justify-end">
                    <button
                      disabled={!device}
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-2 rounded-xl border border-cyan bg-cyan/10 px-7 py-3.5 font-display text-sm font-bold uppercase tracking-wide text-cyan transition-all hover:bg-cyan/20 hover:glow-cyan disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Continuar <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2 — NAME */}
              {step === 1 && (
                <motion.div
                  key="step-name"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25 }}
                >
                  <h3 className="text-center font-display text-lg font-bold uppercase tracking-wide">
                    Como podemos te chamar?
                  </h3>
                  <div className="mx-auto mt-6 max-w-sm">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome ou apelido"
                      className="w-full rounded-xl border border-border bg-card/60 px-4 py-3.5 text-center font-display text-sm tracking-wide text-foreground outline-none transition-all focus:border-cyan focus:glow-cyan"
                    />
                    <p className="mt-3 text-center text-xs text-muted-foreground">
                      Dispositivo escolhido:{" "}
                      <span className="font-bold text-cyan">{selectedDevice?.label}</span>
                    </p>
                  </div>
                  <div className="mt-8 flex justify-between gap-3">
                    <button
                      onClick={() => setStep(0)}
                      className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3.5 font-display text-sm font-bold uppercase tracking-wide text-muted-foreground transition-all hover:text-foreground"
                    >
                      <ArrowLeft className="h-4 w-4" /> Voltar
                    </button>
                    <button
                      disabled={!name.trim()}
                      onClick={() => setStep(2)}
                      className="inline-flex items-center gap-2 rounded-xl border border-cyan bg-cyan/10 px-7 py-3.5 font-display text-sm font-bold uppercase tracking-wide text-cyan transition-all hover:bg-cyan/20 hover:glow-cyan disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Continuar <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3 — FINISH */}
              {step === 2 && (
                <motion.div
                  key="step-finish"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25 }}
                  className="text-center"
                >
                  <h3 className="font-display text-lg font-bold uppercase tracking-wide">
                    Tudo pronto, <span className="text-glow-magenta">{name}!</span>
                  </h3>
                  <div className="mx-auto mt-6 max-w-sm space-y-2 rounded-xl border border-border bg-card/40 p-5 text-left">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Nome</span>
                      <span className="font-bold text-foreground">{name}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Dispositivo</span>
                      <span className="font-bold text-cyan">{selectedDevice?.label}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Teste</span>
                      <span className="font-bold text-lime">1 hora grátis</span>
                    </div>
                  </div>
                  <p className="mx-auto mt-5 max-w-sm text-xs text-muted-foreground">
                    Clique abaixo e seus dados serão enviados direto no nosso WhatsApp para ativarmos seu teste.
                  </p>
                  <motion.a
                    href={buildWaLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="mt-7 inline-flex items-center gap-2 rounded-xl border border-lime bg-lime/10 px-9 py-4 font-display text-base font-bold uppercase tracking-wide text-lime transition-all hover:bg-lime/20"
                    style={{ boxShadow: "0 0 28px -6px color-mix(in oklab, var(--lime) 50%, transparent)" }}
                  >
                    <MessageCircle className="h-5 w-5" /> Ativar no WhatsApp
                  </motion.a>
                  <div className="mt-4">
                    <button
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-2 font-display text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <ArrowLeft className="h-3 w-3" /> Voltar
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
