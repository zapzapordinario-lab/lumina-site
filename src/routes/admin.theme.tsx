import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { Palette, Check, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { db, type AppSettings } from "@/lib/db";
import { applyTheme } from "@/components/ThemeApplier";

export const Route = createFileRoute("/admin/theme")({
  ssr: false,
  component: ThemePage,
});

interface PaletteDef {
  name: string;
  theme: Record<string, string>;
}

const DEFAULT_THEME = {
  background: "oklch(0.16 0.02 240)",
  cyan: "oklch(0.82 0.16 195)",
  magenta: "oklch(0.70 0.27 350)",
  lime: "oklch(0.85 0.21 130)",
  accent: "oklch(0.70 0.25 350)",
};

const PALETTES: PaletteDef[] = [
  { name: "Neon Original", theme: DEFAULT_THEME },
  {
    name: "Magenta Pulse",
    theme: { background: "oklch(0.15 0.03 320)", cyan: "oklch(0.80 0.15 210)", magenta: "oklch(0.72 0.30 350)", lime: "oklch(0.85 0.20 130)", accent: "oklch(0.72 0.30 350)" },
  },
  {
    name: "Ultravioleta",
    theme: { background: "oklch(0.15 0.04 290)", cyan: "oklch(0.78 0.16 260)", magenta: "oklch(0.70 0.28 320)", lime: "oklch(0.85 0.18 145)", accent: "oklch(0.65 0.27 290)" },
  },
  {
    name: "Cyber Lime",
    theme: { background: "oklch(0.15 0.02 150)", cyan: "oklch(0.82 0.15 195)", magenta: "oklch(0.70 0.25 350)", lime: "oklch(0.88 0.23 128)", accent: "oklch(0.85 0.22 128)" },
  },
  {
    name: "Elétrico Amarelo",
    theme: { background: "oklch(0.16 0.02 250)", cyan: "oklch(0.80 0.15 200)", magenta: "oklch(0.70 0.25 350)", lime: "oklch(0.90 0.20 105)", accent: "oklch(0.88 0.19 100)" },
  },
  {
    name: "Blade Runner",
    theme: { background: "oklch(0.14 0.03 270)", cyan: "oklch(0.82 0.16 220)", magenta: "oklch(0.68 0.29 10)", lime: "oklch(0.82 0.18 160)", accent: "oklch(0.68 0.29 10)" },
  },
  {
    name: "Synthwave",
    theme: { background: "oklch(0.16 0.05 300)", cyan: "oklch(0.80 0.16 230)", magenta: "oklch(0.72 0.30 340)", lime: "oklch(0.85 0.16 180)", accent: "oklch(0.72 0.30 340)" },
  },
  {
    name: "Toxic Green",
    theme: { background: "oklch(0.14 0.02 160)", cyan: "oklch(0.85 0.18 175)", magenta: "oklch(0.70 0.24 350)", lime: "oklch(0.90 0.24 135)", accent: "oklch(0.85 0.20 160)" },
  },
];

function ThemePage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Record<string, string> | null>(null);
  const [font, setFont] = useState("Orbitron");

  const { data: settings } = useQuery<AppSettings>({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await db.from("app_settings").select("*").eq("id", "global").maybeSingle();
      return data;
    },
  });

  const preview = (t: Record<string, string>) => {
    setSelected(t);
    applyTheme(t);
  };

  const save = async () => {
    const theme = { ...(selected ?? DEFAULT_THEME), font };
    const { error } = await db.from("app_settings").update({ theme }).eq("id", "global");
    if (error) return toast.error(error.message);
    applyTheme(theme);
    toast.success("Tema aplicado globalmente");
    qc.invalidateQueries({ queryKey: ["settings"] });
  };

  const reset = () => {
    setSelected(DEFAULT_THEME);
    applyTheme(DEFAULT_THEME);
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-black">Customização de Tema</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Escolha uma paleta cyberpunk e aplique em todo o site instantaneamente.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PALETTES.map((p) => {
          const active = selected
            ? JSON.stringify(selected) === JSON.stringify(p.theme)
            : settings?.theme?.cyan === p.theme.cyan;
          return (
            <motion.button
              key={p.name}
              whileHover={{ y: -4 }}
              onClick={() => preview(p.theme)}
              className={`relative overflow-hidden rounded-xl border p-4 text-left transition-all ${
                active ? "border-foreground" : "border-border"
              }`}
              style={{ background: p.theme.background }}
            >
              {active && (
                <Check className="absolute right-3 top-3 h-4 w-4 text-foreground" />
              )}
              <div className="flex gap-2">
                {["cyan", "magenta", "lime", "accent"].map((k) => (
                  <span
                    key={k}
                    className="h-9 w-9 rounded-full"
                    style={{ background: p.theme[k], boxShadow: `0 0 14px ${p.theme[k]}` }}
                  />
                ))}
              </div>
              <p className="mt-3 font-display text-sm font-bold uppercase tracking-wide text-white">
                {p.name}
              </p>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border border-cyan/40 bg-card/40 p-5 backdrop-blur">
        <div className="mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5 text-cyan" />
          <h2 className="font-display text-lg font-bold uppercase tracking-wide">
            Fonte de títulos
          </h2>
        </div>
        <select value={font} onChange={(e) => setFont(e.target.value)} className="inp max-w-xs">
          <option value="Orbitron">Orbitron (padrão)</option>
          <option value="Chakra Petch">Chakra Petch</option>
          <option value="Rajdhani">Rajdhani</option>
        </select>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={save}
            className="inline-flex items-center gap-2 rounded-lg border border-cyan bg-cyan/10 px-5 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-cyan hover:bg-cyan/20 hover:glow-cyan"
          >
            <Save className="h-4 w-4" /> Aplicar globalmente
          </button>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" /> Restaurar padrão
          </button>
        </div>
      </div>
    </div>
  );
}
