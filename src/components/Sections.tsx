import { motion } from "framer-motion";
import { Reveal, Counter } from "./Reveal";
import {
  Code2,
  Rocket,
  Palette,
  ShieldCheck,
  Smartphone,
  LineChart,
  Star,
  Plus,
} from "lucide-react";
import { useState } from "react";

const stats = [
  { to: 1000, suffix: "+", label: "Projetos Entregues" },
  { to: 99, suffix: "%", label: "Satisfação" },
  { to: 5, suffix: "+", label: "Anos no Mercado" },
  { to: 48, suffix: "h", label: "Suporte Médio" },
];

const services = [
  { icon: Code2, title: "Desenvolvimento Web", desc: "Aplicações rápidas, escaláveis e modernas com a melhor stack do mercado." },
  { icon: Palette, title: "UI / UX Design", desc: "Interfaces que encantam e convertem, pensadas pixel a pixel." },
  { icon: Rocket, title: "Performance", desc: "Sites otimizados a 60fps, prontos para escalar e ranquear." },
  { icon: Smartphone, title: "Mobile First", desc: "Experiências impecáveis em qualquer tela, do celular ao desktop." },
  { icon: LineChart, title: "Growth & SEO", desc: "Estratégia orientada a dados para acelerar seu crescimento." },
  { icon: ShieldCheck, title: "Segurança", desc: "Infraestrutura confiável com as melhores práticas de proteção." },
];

const projects = [
  { tag: "SaaS", title: "Painel Nebula", hue: "var(--cyan)" },
  { tag: "Fintech", title: "App Vortex Pay", hue: "var(--magenta)" },
  { tag: "E-commerce", title: "Loja Pulse", hue: "var(--lime)" },
  { tag: "AI", title: "Plataforma Helix", hue: "var(--cyan)" },
  { tag: "Branding", title: "Identidade Onyx", hue: "var(--magenta)" },
  { tag: "Dashboard", title: "Analytics Flux", hue: "var(--lime)" },
];

const testimonials = [
  { name: "Marina Costa", role: "CEO, Lumen", text: "Entregaram além do esperado. O site novo triplicou nossas conversões em 2 meses.", rating: 5 },
  { name: "Rafael Mendes", role: "CTO, Vortex", text: "Time técnico impecável e velocidade absurda. Recomendo de olhos fechados.", rating: 5 },
  { name: "Júlia Ramos", role: "Founder, Pulse", text: "Design lindo, performance perfeita e suporte humano de verdade. Nota 10.", rating: 5 },
];

const faqs = [
  { q: "Quanto tempo leva um projeto?", a: "Projetos típicos levam de 2 a 6 semanas, dependendo do escopo. Definimos um cronograma claro na primeira reunião." },
  { q: "Vocês oferecem suporte depois da entrega?", a: "Sim. Todos os planos incluem suporte humano e manutenção contínua para garantir tudo funcionando perfeitamente." },
  { q: "Como funciona o pagamento?", a: "Trabalhamos com parcelas flexíveis. Uma entrada inicial e o restante conforme as etapas do projeto são concluídas." },
  { q: "Posso pedir alterações durante o projeto?", a: "Com certeza. Nosso processo é colaborativo, com rodadas de revisão para alinhar cada detalhe ao seu gosto." },
];

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
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan/40 bg-cyan/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-cyan">
            <span className="h-2 w-2 animate-pulse rounded-full bg-lime" /> Sistema Online · Estúdio Digital
          </span>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[1.05] tracking-tight md:text-7xl">
            Sua marca nunca mais vai{" "}
            <span className="text-glow-cyan">travar.</span>
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Criamos experiências digitais de alta performance que convertem
            visitantes em clientes. Design premium, código impecável.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <a href="#cta" className="rounded-xl bg-cyan px-7 py-3.5 font-display text-sm font-bold uppercase tracking-wide text-primary-foreground transition-all hover:glow-cyan hover:brightness-110">
              Começar Agora
            </a>
            <a href="#servicos" className="rounded-xl border border-cyan/50 px-7 py-3.5 font-display text-sm font-bold uppercase tracking-wide text-cyan transition-all hover:bg-cyan/10">
              Ver Serviços
            </a>
          </div>
        </Reveal>

        {/* STATS */}
        <div className="mt-20 grid w-full max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border md:grid-cols-4">
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

      {/* SERVICES */}
      <section id="servicos" className="px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <Eyebrow>O que fazemos</Eyebrow>
            <h2 className="text-4xl font-black md:text-5xl">
              Feito pra quem <span className="text-glow-magenta">não aceita menos.</span>
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <Reveal key={s.title} delay={(i % 3) * 0.1}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="corner-frame group h-full rounded-xl border border-border bg-card/40 p-7 backdrop-blur transition-colors hover:border-cyan/60 hover:glow-cyan"
                >
                  <div className="mb-5 inline-flex rounded-lg border border-cyan/30 bg-cyan/10 p-3 text-cyan">
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

      {/* PORTFOLIO */}
      <section id="portfolio" className="px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <Eyebrow>Portfólio</Eyebrow>
            <h2 className="text-4xl font-black md:text-5xl">
              Projetos que <span className="text-glow-cyan">brilham.</span>
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <Reveal key={p.title} delay={(i % 3) * 0.1}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-xl border border-border p-6"
                  style={{ background: `linear-gradient(160deg, color-mix(in oklab, ${p.hue} 22%, var(--card)), var(--card))` }}
                >
                  <div
                    className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: `radial-gradient(400px circle at 50% 0%, color-mix(in oklab, ${p.hue} 28%, transparent), transparent 70%)` }}
                  />
                  <span className="relative z-10 mb-1 w-fit rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider" style={{ color: p.hue }}>
                    {p.tag}
                  </span>
                  <h3 className="relative z-10 font-display text-xl font-bold">{p.title}</h3>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="depoimentos" className="px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <Eyebrow>Depoimentos</Eyebrow>
            <h2 className="text-4xl font-black md:text-5xl">
              Quem confia, <span className="text-glow-magenta">recomenda.</span>
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.1}>
                <div className="h-full rounded-xl border border-border bg-card/40 p-7 backdrop-blur transition-colors hover:border-magenta/50">
                  <div className="mb-4 flex gap-1 text-magenta">
                    {Array.from({ length: t.rating }).map((_, k) => (
                      <Star key={k} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/90">"{t.text}"</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan to-magenta font-display font-bold text-primary-foreground">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-28">
        <div className="mx-auto max-w-3xl">
          <Reveal className="text-center">
            <Eyebrow>Perguntas Frequentes</Eyebrow>
            <h2 className="text-4xl font-black md:text-5xl">
              Tudo o que você <span className="text-glow-cyan">precisa saber.</span>
            </h2>
          </Reveal>
          <div className="mt-12 space-y-3">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={i * 0.05}>
                <FaqItem q={f.q} a={f.a} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="px-6 py-28">
        <Reveal className="mx-auto max-w-4xl">
          <div className="corner-frame relative overflow-hidden rounded-2xl border border-magenta/40 bg-card/40 p-12 text-center backdrop-blur glow-magenta">
            <div className="absolute left-1/2 top-0 h-60 w-96 -translate-x-1/2 rounded-full opacity-50 blur-3xl"
              style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--magenta) 40%, transparent), transparent)" }}
            />
            <h2 className="relative text-4xl font-black md:text-5xl">
              Pronto para <span className="text-glow-magenta">decolar?</span>
            </h2>
            <p className="relative mx-auto mt-4 max-w-md text-muted-foreground">
              Vamos transformar sua ideia em uma experiência digital memorável.
              Resposta em até 24 horas.
            </p>
            <a href="#home" className="relative mt-8 inline-block rounded-xl bg-magenta px-8 py-4 font-display text-sm font-bold uppercase tracking-wide text-primary-foreground transition-all hover:brightness-110 hover:glow-magenta">
              Falar com a equipe
            </a>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-border px-6 py-10 text-center text-xs uppercase tracking-widest text-muted-foreground">
        © 2026 NovaPulse · Estúdio Digital Premium
      </footer>
    </main>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card/40 backdrop-blur transition-colors hover:border-cyan/40">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="font-display text-sm font-bold uppercase tracking-wide md:text-base">{q}</span>
        <motion.span animate={{ rotate: open ? 45 : 0 }} className="text-cyan">
          <Plus className="h-5 w-5" />
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">{a}</p>
      </motion.div>
    </div>
  );
}
