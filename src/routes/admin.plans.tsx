import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Search, Star, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { db, type Plan } from "@/lib/db";

export const Route = createFileRoute("/admin/plans")({
  ssr: false,
  component: PlansPage,
});

const PALETTE = ["#00e5ff", "#bd00ff", "#ff00aa", "#aaff00", "#ffd400", "#ff5e00"];

const empty: Partial<Plan> = {
  name: "",
  period: "mensal",
  price: 0,
  duration_days: 30,
  description: "",
  badge: "",
  accent_color: "#00e5ff",
  highlighted: false,
  sort_order: 0,
  active: true,
};

function PlansPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todos");
  const [editing, setEditing] = useState<Partial<Plan> | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: plans = [], isLoading } = useQuery<Plan[]>({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data } = await db.from("plans").select("*").order("sort_order");
      return data ?? [];
    },
  });

  const filtered = plans.filter((p) => {
    const m = p.name.toLowerCase().includes(search.toLowerCase());
    const f =
      filter === "todos" ||
      (filter === "destaque" && p.highlighted) ||
      (filter === "ativos" && p.active) ||
      filter === p.period;
    return m && f;
  });

  const save = async () => {
    if (!editing?.name) return toast.error("Nome obrigatório");
    setSaving(true);
    const payload = {
      name: editing.name,
      period: editing.period,
      price: Number(editing.price) || 0,
      duration_days: Number(editing.duration_days) || 30,
      description: editing.description,
      badge: editing.badge || null,
      accent_color: editing.accent_color,
      highlighted: editing.highlighted,
      sort_order: Number(editing.sort_order) || 0,
      active: editing.active,
    };
    const { error } = editing.id
      ? await db.from("plans").update(payload).eq("id", editing.id)
      : await db.from("plans").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Plano salvo");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["plans"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Remover este plano?")) return;
    const { error } = await db.from("plans").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Plano removido");
    qc.invalidateQueries({ queryKey: ["plans"] });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-black">Planos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie, edite, remova e personalize a cor de destaque dos planos.
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...empty })}
          className="inline-flex items-center gap-2 rounded-lg border border-cyan bg-cyan/10 px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-cyan transition-all hover:bg-cyan/20 hover:glow-cyan"
        >
          <Plus className="h-4 w-4" /> Novo plano
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar planos…"
            className="w-full rounded-lg border border-border bg-card/40 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-cyan"
          />
        </div>
        {["todos", "mensal", "anual", "destaque", "ativos"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg border px-3 py-2 font-display text-xs font-bold uppercase tracking-wide transition-all ${
              filter === f
                ? "border-cyan bg-cyan/10 text-cyan"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Loader2 className="mt-10 h-6 w-6 animate-spin text-cyan" />
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="relative rounded-xl border bg-card/40 p-5 backdrop-blur"
              style={{ borderColor: `color-mix(in oklab, ${p.accent_color} 45%, transparent)` }}
            >
              {p.highlighted && (
                <Star
                  className="absolute right-4 top-4 h-4 w-4"
                  style={{ color: p.accent_color }}
                  fill={p.accent_color}
                />
              )}
              <p className="font-display text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {p.name}
              </p>
              <div
                className="mt-2 font-display text-2xl font-black"
                style={{ color: p.accent_color }}
              >
                R$ {p.price.toFixed(2)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase text-muted-foreground">
                <span className="rounded bg-secondary px-2 py-0.5">{p.period}</span>
                <span className="rounded bg-secondary px-2 py-0.5">{p.duration_days}d</span>
                {!p.active && (
                  <span className="rounded bg-destructive/20 px-2 py-0.5 text-destructive">
                    inativo
                  </span>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setEditing(p)}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-bold uppercase text-muted-foreground hover:text-cyan"
                >
                  <Pencil className="h-3.5 w-3.5" /> Editar
                </button>
                <button
                  onClick={() => remove(p.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-bold uppercase text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remover
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum plano encontrado.</p>
          )}
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setEditing(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border border-cyan/40 bg-card p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold uppercase tracking-wide">
                  {editing.id ? "Editar plano" : "Novo plano"}
                </h2>
                <button onClick={() => setEditing(null)}>
                  <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nome" className="col-span-2">
                  <input
                    value={editing.name ?? ""}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="inp"
                  />
                </Field>
                <Field label="Período">
                  <select
                    value={editing.period}
                    onChange={(e) => setEditing({ ...editing, period: e.target.value })}
                    className="inp"
                  >
                    <option value="mensal">Mensal</option>
                    <option value="anual">Anual</option>
                  </select>
                </Field>
                <Field label="Preço (R$)">
                  <input
                    type="number"
                    step="0.01"
                    value={editing.price ?? 0}
                    onChange={(e) => setEditing({ ...editing, price: e.target.value as any })}
                    className="inp"
                  />
                </Field>
                <Field label="Duração (dias)">
                  <input
                    type="number"
                    value={editing.duration_days ?? 30}
                    onChange={(e) =>
                      setEditing({ ...editing, duration_days: e.target.value as any })
                    }
                    className="inp"
                  />
                </Field>
                <Field label="Badge">
                  <input
                    value={editing.badge ?? ""}
                    onChange={(e) => setEditing({ ...editing, badge: e.target.value })}
                    className="inp"
                    placeholder="Popular…"
                  />
                </Field>
                <Field label="Descrição" className="col-span-2">
                  <input
                    value={editing.description ?? ""}
                    onChange={(e) =>
                      setEditing({ ...editing, description: e.target.value })
                    }
                    className="inp"
                  />
                </Field>
                <Field label="Cor de destaque" className="col-span-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {PALETTE.map((c) => (
                      <button
                        key={c}
                        onClick={() => setEditing({ ...editing, accent_color: c })}
                        className={`h-8 w-8 rounded-full border-2 transition-all ${
                          editing.accent_color === c ? "scale-110 border-foreground" : "border-transparent"
                        }`}
                        style={{ background: c, boxShadow: `0 0 12px ${c}` }}
                      />
                    ))}
                    <input
                      type="color"
                      value={editing.accent_color ?? "#00e5ff"}
                      onChange={(e) =>
                        setEditing({ ...editing, accent_color: e.target.value })
                      }
                      className="h-8 w-10 rounded bg-transparent"
                    />
                  </div>
                </Field>
                <label className="col-span-2 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!editing.highlighted}
                    onChange={(e) =>
                      setEditing({ ...editing, highlighted: e.target.checked })
                    }
                  />
                  Plano em destaque
                </label>
                <label className="col-span-2 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editing.active ?? true}
                    onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                  />
                  Ativo
                </label>
              </div>
              <button
                onClick={save}
                disabled={saving}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-cyan bg-cyan/10 px-4 py-3 font-display text-sm font-bold uppercase tracking-wide text-cyan hover:bg-cyan/20 disabled:opacity-50"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Salvar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block font-display text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
