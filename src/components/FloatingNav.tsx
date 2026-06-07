import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Tv } from "lucide-react";

const links = [
  { label: "Planos", href: "#planos" },
  { label: "Catálogo", href: "#catalogo" },
  { label: "Jogos", href: "#jogos" },
  { label: "Indique", href: "#indique" },
  { label: "Suporte", href: "#suporte" },
  { label: "Minha Conta", href: "#conta" },
];

export function FloatingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-x-0 top-3 z-50 px-4"
    >
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-2xl border px-4 py-3 transition-all duration-500 ${
          scrolled
            ? "glass border-border glow-cyan"
            : "border-transparent bg-transparent"
        }`}
      >
        <a href="#home" className="flex items-center gap-2 font-display text-lg font-bold tracking-wider">
          <Tv className="h-5 w-5 text-magenta" />
          <span>QUINZE<span className="text-glow-magenta">CONTO</span></span>
        </a>

        <ul className="hidden items-center gap-6 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-cyan"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href="#teste-gratis"
            className="hidden rounded-lg border border-cyan/60 bg-cyan/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-cyan transition-all hover:glow-cyan hover:bg-cyan/20 sm:inline-block"
          >
            Teste Grátis
          </a>
          <button
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg border border-border p-2 text-foreground lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-auto mt-2 max-w-6xl rounded-2xl glass border border-border p-4 lg:hidden"
          >
            <ul className="flex flex-col gap-1">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:bg-secondary hover:text-cyan"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#teste-gratis"
                  onClick={() => setOpen(false)}
                  className="mt-1 block rounded-lg bg-cyan px-3 py-2 text-center text-sm font-bold uppercase tracking-wide text-primary-foreground"
                >
                  Teste Grátis
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
