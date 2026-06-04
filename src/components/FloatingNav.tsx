import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap } from "lucide-react";

const links = [
  { label: "Home", href: "#home" },
  { label: "Serviços", href: "#servicos" },
  { label: "Portfólio", href: "#portfolio" },
  { label: "Depoimentos", href: "#depoimentos" },
  { label: "FAQ", href: "#faq" },
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
        className={`mx-auto flex max-w-5xl items-center justify-between rounded-2xl border px-4 py-3 transition-all duration-500 ${
          scrolled
            ? "glass border-border glow-cyan"
            : "border-transparent bg-transparent"
        }`}
      >
        <a href="#home" className="flex items-center gap-2 font-display text-lg font-bold tracking-wider">
          <Zap className="h-5 w-5 text-cyan" />
          <span>NOVA<span className="text-glow-cyan">PULSE</span></span>
        </a>

        <ul className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-cyan"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href="#cta"
            className="hidden rounded-lg bg-cyan px-4 py-2 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-all hover:glow-cyan md:inline-block"
          >
            Começar
          </a>
          <button
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg border border-border p-2 text-foreground md:hidden"
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
            className="mx-auto mt-2 max-w-5xl rounded-2xl glass border border-border p-4 md:hidden"
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
                  href="#cta"
                  onClick={() => setOpen(false)}
                  className="mt-1 block rounded-lg bg-cyan px-3 py-2 text-center text-sm font-bold uppercase tracking-wide text-primary-foreground"
                >
                  Começar
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
