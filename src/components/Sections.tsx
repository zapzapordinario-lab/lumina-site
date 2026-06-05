import { motion } from "framer-motion";
import { Reveal, Counter } from "./Reveal";
import {
  Tv,
  Globe,
  Zap,
  MessageCircle,
  MonitorSmartphone,
  Lock,
  Gift,
  Bot,
  Headphones,
  RefreshCw,
  Wallet,
  UserCircle,
  BookOpen,
  LayoutGrid,
  ArrowRight,
} from "lucide-react";

const quickAccess = [
  { icon: Gift, label: "Teste Grátis", href: "#teste", active: true, color: "var(--magenta)" },
  { icon: Bot, label: "Atendente IA", href: "#suporte", color: "var(--cyan)" },
  { icon: Headphones, label: "Humano", sub: "09:00–18:00", href: "#suporte", color: "var(--cyan)" },
  { icon: RefreshCw, label: "Renovar Plano", href: "#planos", color: "var(--cyan)" },
  { icon: Wallet, label: "Indique e Ganhe", href: "#indique", color: "var(--lime)" },
  { icon: UserCircle, label: "Área do Cliente", href: "#conta", color: "var(--magenta)" },
  { icon: BookOpen, label: "Tutoriais", href: "#suporte", color: "var(--cyan)" },
  { icon: LayoutGrid, label: "Planos", href: "#planos", color: "var(--cyan)" },
];

const stats = [
  { to: 600, suffix: "K+", label: "Conteúdos" },
  { to: 4, suffix: "K", label: "Qualidade" },
  { to: 24, suffix: "h", label: "Suporte" },
  { to: 5, suffix: "min", label: "Ativação" },
];

const features = [
  { icon: Tv, title: "600K+ Conteúdos", desc: "Canais, filmes, séries, desenhos e documentários. Catálogo atualizado diariamente com o que há de melhor.", color: "var(--cyan)" },
  { icon: Globe, title: "Todo o Futebol", desc: "Brasileirão, Libertadores, Champions League, Premier League. Todas as ligas ao vivo, sem delay.", color: "var(--cyan)" },
  { icon: Zap, title: "Zero Travamento", desc: "Servidores dedicados de alta performance. Assista o gol no momento exato — sem buffering.", color: "var(--magenta)" },
  { icon: MessageCircle, title: "Suporte Humano", desc: "Atendimento real no WhatsApp, 7 dias por semana, 24 horas. Não é robô — é gente de verdade.", color: "var(--cyan)" },
  { icon: MonitorSmartphone, title: "Qualquer Dispositivo", desc: "Smart TV, TV Box, Celular, Fire Stick, Roku, PC, Mac. Funciona em tudo, ativação imediata.", color: "var(--cyan)" },
  { icon: Lock, title: "Pagamento Seguro", desc: "PIX com liberação instantânea. Sem dados de cartão, sem assinatura recorrente. Cancele quando quiser.", color: "var(--lime)" },
];

const plans = [
  { title: "1 Mês · 1 Tela", price: "12,49", info: "30 dias · 1 dispositivo", badge: "Popular" },
  { title: "1 Mês · 2 Telas", price: "22,49", info: "30 dias · 2 dispositivos" },
  { title: "2 Meses · 1 Tela", price: "22,00", info: "60 dias · 1 dispositivo" },
  { title: "2 Meses · 2 Telas", price: "44,00", info: "60 dias · 2 dispositivos" },
  { title: "3 Meses · 1 Tela", price: "33,00", info: "90 dias · 1 dispositivo" },
  { title: "6 Meses · 1 Tela", price: "55,00", info: "180 dias · economia" },
  { title: "12 Meses · 1 Tela", price: "95,00", info: "365 dias · melhor custo-benefício", badge: "Mais Vendido", featured: true },
];

const referralSteps = [
  { n: "01", label: "Cadastre-se grátis" },
  { n: "02", label: "Receba seu link" },
  { n: "03", label: "Divulgue" },
  { n: "04", label: "Receba via PIX" },
];

const whatsapps = ["(88) 99804-4487", "(88) 92000-9431"];
const waLink = (n: string) => `https://wa.me/55${n.replace(/\D/g, "")}`;
const primaryWa = waLink(whatsapps[0]);

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="mb-3 font-display text-xs font-bold uppercase tracking-[0.35em] text-cyan/80">
      // {children}
    </p>
  );
}

export function Sections() {
  return (
    <main className="relative z-10">
      {/* HERO */}
      <section id="home" className="flex min-h-screen flex-col items-center justify-center px-6 pt-28 text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-md border border-cyan/40 bg-cyan/5 px-4 py-1.5 font-display text-[11px] font-semibold uppercase tracking-widest text-cyan">
            <span className="h-2 w-2 animate-pulse rounded-full bg-lime" /> Sistema Online · Teste Grátis · 1 Hora · Sem Cartão
          </span>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[1.02] tracking-tight md:text-7xl">
            <span className="text-glow-magenta">Cancele os streamings</span>{" "}
            e tenha <span className="text-glow-cyan">tudo em uma só tela.</span>
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Mais de <span className="font-bold text-foreground">600 mil conteúdos</span> — canais ao vivo, filmes, séries e todo o futebol.
            Qualidade <span className="font-bold text-foreground">HD/4K</span>, suporte humano 24h e ativação em 5 minutos.
          </p>
        </Reveal>

        {/* QUICK ACCESS GRID */}
        <div id="teste" className="mt-12 grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {quickAccess.map((q, i) => (
            <Reveal key={q.label} delay={i * 0.05}>
              <motion.a
                href={q.href}
                whileHover={{ scale: 1.04 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`flex h-full flex-col items-center justify-center gap-2 rounded-xl border bg-card/40 px-3 py-5 backdrop-blur transition-all ${
                  q.active ? "border-cyan/70 glow-cyan" : "border-border hover:border-cyan/50"
                }`}
              >
                <q.icon className="h-6 w-6" style={{ color: q.color }} />
                <span className="font-display text-[11px] font-bold uppercase leading-tight tracking-wide">{q.label}</span>
                {q.sub && <span className="font-display text-[10px] font-bold text-lime">{q.sub}</span>}
              </motion.a>
            </Reveal>
          ))}
        </div>

        {/* STATS */}
        <div className="mt-14 grid w-full max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border md:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1} className="bg-card/40 p-6 text-center backdrop-blur">
              <div className="font-display text-3xl font-black text-glow-cyan md:text-4xl">
                <Counter to={s.to} suffix={s.suffix} />
              </div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                {s.label}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="catalogo" className="px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <Eyebrow>Por que DezPila</Eyebrow>
            <h2 className="text-4xl font-black md:text-5xl">
              Feito pra quem <span className="text-glow-cyan">não aceita menos.</span>
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((s, i) => (
              <Reveal key={s.title} delay={(i % 3) * 0.1}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="corner-frame group h-full rounded-xl border border-border bg-card/40 p-7 backdrop-blur transition-colors hover:border-cyan/60 hover:glow-cyan"
                >
                  <div className="mb-5 inline-flex rounded-lg border p-3" style={{ borderColor: `color-mix(in oklab, ${s.color} 30%, transparent)`, background: `color-mix(in oklab, ${s.color} 10%, transparent)`, color: s.color }}>
                    <s.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-bold uppercase tracking-wide">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section id="planos" className="px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <Eyebrow>Planos e Preços</Eyebrow>
            <h2 className="text-4xl font-black md:text-5xl">
              Escolha o seu <span className="text-glow-cyan">plano.</span>
            </h2>
            <p className="mt-4 text-sm uppercase tracking-wider text-muted-foreground">
              Pagamento via PIX · Ativação em 5 minutos · Cancele quando quiser
            </p>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((p, i) => {
              const accent = p.featured ? "var(--lime)" : "var(--cyan)";
              return (
                <Reveal key={p.title} delay={(i % 4) * 0.08}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    className="corner-frame relative flex h-full flex-col rounded-xl border bg-card/40 p-6 backdrop-blur transition-colors"
                    style={{ borderColor: `color-mix(in oklab, ${accent} 35%, transparent)` }}
                  >
                    {p.badge && (
                      <span
                        className="absolute -top-3 right-4 rounded-md px-3 py-1 font-display text-[10px] font-bold uppercase tracking-wider text-primary-foreground"
                        style={{ background: accent }}
                      >
                        {p.badge}
                      </span>
                    )}
                    <p className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">{p.title}</p>
                    <div className="mt-3 font-display text-3xl font-black" style={{ color: accent, textShadow: `0 0 18px color-mix(in oklab, ${accent} 60%, transparent)` }}>
                      R$<span className="text-4xl">{p.price.split(",")[0]}</span><span className="text-xl">,{p.price.split(",")[1]}</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{p.info}</p>
                    <a
                      href="#suporte"
                      className="mt-auto block rounded-lg border px-4 py-3 text-center font-display text-sm font-bold uppercase tracking-wide transition-all hover:brightness-125"
                      style={{ borderColor: accent, color: accent, marginTop: "1.5rem" }}
                    >
                      Ativar
                    </a>
                  </motion.div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* REFERRAL */}
      <section id="indique" className="px-6 py-28">
        <div className="mx-auto max-w-4xl">
          <Reveal className="text-center">
            <Eyebrow>Programa de Indicação</Eyebrow>
            <h2 className="text-4xl font-black md:text-5xl">
              Indique e <span className="text-glow-magenta">ganhe.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="corner-frame relative mt-12 overflow-hidden rounded-2xl border border-magenta/50 bg-card/40 p-10 text-center backdrop-blur glow-magenta">
              <div className="absolute left-1/2 top-0 h-60 w-96 -translate-x-1/2 rounded-full opacity-50 blur-3xl"
                style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--magenta) 40%, transparent), transparent)" }}
              />
              <div className="relative font-display text-7xl font-black text-glow-magenta md:text-8xl">
                <Counter to={85} suffix="%" />
              </div>
              <p className="relative mt-1 font-display text-xs font-bold uppercase tracking-[0.3em] text-magenta/80">
                De comissão por venda
              </p>
              <h3 className="relative mt-7 font-display text-xl font-bold">Ganhe dinheiro indicando a DezPila</h3>
              <p className="relative mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                Cadastre-se grátis, receba seu link exclusivo e ganhe comissão a cada venda confirmada. Top 3 do ranking mensal ganham até 85%. Saque via PIX.
              </p>
              <a href="#suporte" className="relative mt-7 inline-flex items-center gap-2 rounded-xl border border-magenta px-7 py-3.5 font-display text-sm font-bold uppercase tracking-wide text-magenta transition-all hover:bg-magenta/15 hover:glow-magenta">
                Começar a indicar <ArrowRight className="h-4 w-4" />
              </a>
              <div className="relative mt-10 grid grid-cols-2 gap-6 border-t border-magenta/20 pt-8 sm:grid-cols-4">
                {referralSteps.map((s) => (
                  <div key={s.n}>
                    <div className="font-display text-2xl font-black text-magenta">{s.n}</div>
                    <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SUPPORT */}
      <section id="suporte" className="px-6 py-28">
        <div className="mx-auto max-w-3xl">
          <Reveal className="text-center">
            <Eyebrow>Suporte</Eyebrow>
            <h2 className="text-4xl font-black md:text-5xl">
              Fale com a <span className="text-glow-cyan">gente.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="corner-frame mt-12 rounded-2xl border border-lime/50 bg-card/40 p-8 text-center backdrop-blur" style={{ boxShadow: "0 0 28px -6px color-mix(in oklab, var(--lime) 45%, transparent)" }}>
              <p className="font-display text-lg font-bold text-lime">// WhatsApp</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Atendimento humano, rápido e sem robô. 7 dias por semana.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                {whatsapps.map((w) => (
                  <a
                    key={w}
                    href={`https://wa.me/55${w.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-lime/50 bg-lime/5 px-5 py-3 font-display text-sm font-bold tracking-wider text-lime transition-all hover:bg-lime/15"
                  >
                    {w}
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <footer id="conta" className="border-t border-border px-6 py-10 text-center font-display text-xs uppercase tracking-widest text-muted-foreground">
        © 2026 DezPila · IPTV Premium · <span className="text-cyan">IA Support</span> · <span className="text-lime">WhatsApp</span>
      </footer>
    </main>
  );
}
