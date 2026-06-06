import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Loader2,
  MessageCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  db,
  clientAlert,
  daysUntil,
  fillTemplate,
  messageFor,
  waLink,
  type Client,
  type Plan,
} from "@/lib/db";

export const Route = createFileRoute("/admin/clients")({
  ssr: false,
  component: ClientsPage,
});

const empty: Partial<Client> = {
  name: "",
  contact: "",
  plan_type: "mensal",
  plan_id: null,
  due_date: "",
  status: "teste",
  notes: "",
};

const STATUS_COLORS: Record<string, string> = {
  ativo: "var(--lime)",
  inativo: "var(--magenta)",
  teste: "var(--cyan)",
};

function ClientsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todos");
  const [editing, setEditing] = useState<Partial<Client> | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data } = await db.from("clients").select("*").order("created_at", {
        ascending: false,
      });
      return data ?? [];
    },
  });
  const { data: plans = [] } = useQuery<Plan[]>({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data } = await db.from("plans").select("*").order("sort_order");
      return data ?? [];
    },
  });

  const filtered = clients.filter((c) => {
    const m =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.contact ?? "").toLowerCase().includes(search.toLowerCase());
    const a = clientAlert(c);
    const f =
      filter === "todos" ||
      filter === c.status ||
      (filter === "alerta" && a !== "ok");
    return m && f;
  });

  const save = async () => {
    if (!editing?.name) return toast.error("Nome obrigatório");
    setSaving(true);
    const payload = {
      name: editing.name,
      contact: editing.contact || null,
      plan_type: editing.plan_type,
      plan_id: editing.plan_id || null,
      due_date: editing.due_date || null,
      status: editing.status,
      notes: editing.notes || null,
    };
    const { error } = editing.id
      ? await db.from("clients").update(payload).eq("id", editing.id)
      : await db.from("clients").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Cliente salvo");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["clients"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Remover este cliente?")) return;
    const { error } = await db.from("clients").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removido");
    qc.invalidateQueries({ queryKey: ["clients"] });
  };

  const alertLabel = (c: Client) => {
    const a = clientAlert(c);
    const days = daysUntil(c.due_date);
    if (a === "due_soon") return { t: `Vence em ${days}d`, c: "var(--cyan)" };
    if (a === "expired") return { t: `Vencido`, c: "var(--magenta)" };
    if (a === "trial_expired") return { t: "Teste expirado", c: "#ffd400" };
    return null;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-black">Usuários</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ativação manual e monitoramento de vencimentos e testes.
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...empty })}
          className="inline-flex items-center gap-2 rounded-lg border border-cyan bg-cyan/10 px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-cyan hover:bg-cyan/20 hover:glow-cyan"
        >
          <Plus className="h-4 w-4" /> Ativar cliente
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por nome ou contato…"
            className="w-full rounded-lg border border-border bg-card/40 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-cyan"
          />
        </div>
        {["todos", "ativo", "teste", "inativo", "alerta"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg border px-3 py-2 font-display text-xs font-bold uppercase tracking-wide ${
              filter === f
                ? "border-cyan bg-cyan/10 text-cyan"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "alerta" ? "⚠ Alerta" : f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Loader2 className="mt-10 h-6 w-6 animate-spin text-cyan" />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card/40">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left font-display text-[10px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Plano</th>
                <th className="px-4 py-3">Vencimento</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const al = alertLabel(c);
                const a = clientAlert(c);
                return (
                  <tr key={c.id} className="border-b border-border/60">
                    <td className="px-4 py-3">
                      <div className="font-bold">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.contact}</div>
                    </td>
                    <td className="px-4 py-3 text-xs uppercase text-muted-foreground">
                      {c.plan_type}
                    </td>
                    <td className="px-4 py-3">
                      <span>{c.due_date ?? "—"}</span>
                      {al && (
                        <span
                          className="ml-2 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase"
                          style={{ color: al.c, background: `color-mix(in oklab, ${al.c} 15%, transparent)` }}
                        >
                          <AlertTriangle className="h-3 w-3" />
                          {al.t}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded px-2 py-0.5 text-[10px] font-bold uppercase"
                        style={{
                          color: STATUS_COLORS[c.status],
                          background: `color-mix(in oklab, ${STATUS_COLORS[c.status]} 15%, transparent)`,
                        }}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {a !== "ok" && c.contact && (
                          <a
                            href={waLink(
                              c.contact,
                              fillTemplate(messageFor[a as keyof typeof messageFor], c),
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Enviar mensagem"
                            className="rounded-lg border border-lime/50 p-2 text-lime hover:bg-lime/10"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          onClick={() => setEditing(c)}
                          className="rounded-lg border border-border p-2 text-muted-foreground hover:text-cyan"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => remove(c.id)}
                          className="rounded-lg border border-border p-2 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border border-cyan/40 bg-card p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold uppercase tracking-wide">
                  {editing.id ? "Editar cliente" : "Ativar novo cliente"}
                </h2>
                <button onClick={() => setEditing(null)}>
                  <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Lbl>Nome do usuário</Lbl>
                  <input
                    value={editing.name ?? ""}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="inp"
                  />
                </div>
                <div className="col-span-2">
                  <Lbl>E-mail / Contato (WhatsApp)</Lbl>
                  <input
                    value={editing.contact ?? ""}
                    onChange={(e) => setEditing({ ...editing, contact: e.target.value })}
                    className="inp"
                    placeholder="5588999999999"
                  />
                </div>
                <div>
                  <Lbl>Plano</Lbl>
                  <select
                    value={editing.plan_type}
                    onChange={(e) =>
                      setEditing({ ...editing, plan_type: e.target.value })
                    }
                    className="inp"
                  >
                    <option value="mensal">Mensal</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>
                <div>
                  <Lbl>Plano vinculado</Lbl>
                  <select
                    value={editing.plan_id ?? ""}
                    onChange={(e) =>
                      setEditing({ ...editing, plan_id: e.target.value || null })
                    }
                    className="inp"
                  >
                    <option value="">—</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Lbl>Data de vencimento</Lbl>
                  <input
                    type="date"
                    value={editing.due_date ?? ""}
                    onChange={(e) => setEditing({ ...editing, due_date: e.target.value })}
                    className="inp"
                  />
                </div>
                <div>
                  <Lbl>Status</Lbl>
                  <select
                    value={editing.status}
                    onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                    className="inp"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                    <option value="teste">Teste</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <Lbl>Observações</Lbl>
                  <textarea
                    value={editing.notes ?? ""}
                    onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                    className="inp min-h-[70px]"
                  />
                </div>
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

function Lbl({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block font-display text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
      {children}
    </label>
  );
}
