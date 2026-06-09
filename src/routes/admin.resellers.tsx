import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Store,
  Wallet,
  Users,
  Coins,
} from "lucide-react";
import { toast } from "sonner";
import {
  db,
  brl,
  type Reseller,
  type ResellerTransaction,
  type Client,
} from "@/lib/db";

export const Route = createFileRoute("/admin/resellers")({
  ssr: false,
  component: ResellersPage,
});

const empty: Partial<Reseller> = {
  name: "",
  email: "",
  contact: "",
  credit_cost: 0,
  status: "ativo",
  notes: "",
};

function ResellersPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Reseller> | null>(null);
  const [topup, setTopup] = useState<Reseller | null>(null);
  const [topupVal, setTopupVal] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: resellers = [], isLoading } = useQuery<Reseller[]>({
    queryKey: ["resellers"],
    queryFn: async () => {
      const { data } = await db.from("resellers").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data } = await db.from("clients").select("*");
      return data ?? [];
    },
  });
  const { data: txs = [] } = useQuery<ResellerTransaction[]>({
    queryKey: ["reseller-transactions"],
    queryFn: async () => {
      const { data } = await db.from("reseller_transactions").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const clientCount = (id: string) => clients.filter((c) => c.reseller_id === id).length;
  const totalBalance = resellers.reduce((s, r) => s + Number(r.balance), 0);

  const save = async () => {
    if (!editing?.name) return toast.error("Nome obrigatório");
    setSaving(true);
    const payload = {
      name: editing.name,
      email: editing.email || null,
      contact: editing.contact || null,
      credit_cost: Number(editing.credit_cost) || 0,
      status: editing.status,
      notes: editing.notes || null,
    };
    const { error } = editing.id
      ? await db.from("resellers").update(payload).eq("id", editing.id)
      : await db.from("resellers").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Revendedor salvo");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["resellers"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Remover este revendedor?")) return;
    const { error } = await db.from("resellers").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removido");
    qc.invalidateQueries({ queryKey: ["resellers"] });
  };

  const addCredit = async () => {
    if (!topup) return;
    const val = Number(topupVal);
    if (!val) return toast.error("Informe um valor");
    setSaving(true);
    const newBalance = Number(topup.balance) + val;
    const { error: e1 } = await db.from("resellers").update({ balance: newBalance }).eq("id", topup.id);
    const { error: e2 } = await db.from("reseller_transactions").insert({
      reseller_id: topup.id,
      type: val >= 0 ? "credit_purchase" : "adjustment",
      amount: val,
      balance_after: newBalance,
      description: val >= 0 ? "Crédito adicionado pelo admin" : "Ajuste de saldo",
    });
    setSaving(false);
    if (e1 || e2) return toast.error((e1 ?? e2)!.message);
    toast.success("Saldo atualizado");
    setTopup(null);
    setTopupVal("");
    qc.invalidateQueries({ queryKey: ["resellers"] });
    qc.invalidateQueries({ queryKey: ["reseller-transactions"] });
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black">Revendedores</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cadastre revendedores, gerencie créditos e acompanhe a rede.
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...empty })}
          className="inline-flex items-center gap-2 rounded-lg border border-cyan bg-cyan/10 px-4 py-2 font-display text-xs font-bold uppercase tracking-wide text-cyan transition-all hover:bg-cyan/20"
        >
          <Plus className="h-4 w-4" /> Novo revendedor
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Kpi icon={Store} color="var(--cyan)" label="Revendedores" value={String(resellers.length)} />
        <Kpi icon={Wallet} color="var(--lime)" label="Saldo total na rede" value={brl(totalBalance)} />
        <Kpi icon={Users} color="var(--magenta)" label="Clientes via revenda" value={String(clients.filter((c) => c.reseller_id).length)} />
      </div>

      {isLoading ? (
        <div className="mt-10 flex justify-center"><Loader2 className="h-7 w-7 animate-spin text-cyan" /></div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {resellers.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-card/40 p-5 backdrop-blur"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-bold">{r.name}</h3>
                  <p className="text-xs text-muted-foreground">{r.email ?? "sem e-mail"} · {r.contact ?? "sem contato"}</p>
                </div>
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                  style={{
                    color: r.status === "ativo" ? "var(--lime)" : "var(--magenta)",
                    background: r.status === "ativo" ? "color-mix(in oklab, var(--lime) 15%, transparent)" : "color-mix(in oklab, var(--magenta) 15%, transparent)",
                  }}
                >
                  {r.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border border-border/60 bg-background/40 p-2">
                  <div className="font-display text-sm font-black text-lime">{brl(Number(r.balance))}</div>
                  <div className="text-[10px] uppercase text-muted-foreground">Saldo</div>
                </div>
                <div className="rounded-lg border border-border/60 bg-background/40 p-2">
                  <div className="font-display text-sm font-black text-cyan">{clientCount(r.id)}</div>
                  <div className="text-[10px] uppercase text-muted-foreground">Clientes</div>
                </div>
                <div className="rounded-lg border border-border/60 bg-background/40 p-2">
                  <div className="font-display text-sm font-black">{brl(Number(r.credit_cost))}</div>
                  <div className="text-[10px] uppercase text-muted-foreground">Custo crédito</div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => { setTopup(r); setTopupVal(""); }} className="inline-flex items-center gap-1.5 rounded-lg border border-lime/60 bg-lime/10 px-3 py-1.5 text-xs font-bold uppercase text-lime hover:bg-lime/20">
                  <Coins className="h-3.5 w-3.5" /> Crédito
                </button>
                <button onClick={() => setEditing(r)} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-bold uppercase text-muted-foreground hover:text-foreground">
                  <Pencil className="h-3.5 w-3.5" /> Editar
                </button>
                <button onClick={() => remove(r.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-bold uppercase text-muted-foreground hover:text-magenta">
                  <Trash2 className="h-3.5 w-3.5" /> Excluir
                </button>
              </div>
            </motion.div>
          ))}
          {resellers.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum revendedor cadastrado ainda.</p>
          )}
        </div>
      )}

      {/* Recent credit transactions */}
      {txs.length > 0 && (
        <div className="mt-8 rounded-xl border border-border bg-card/40 p-5 backdrop-blur">
          <h2 className="mb-3 font-display text-base font-bold uppercase tracking-wide">Movimentações de crédito</h2>
          <div className="space-y-2">
            {txs.slice(0, 12).map((t) => {
              const r = resellers.find((x) => x.id === t.reseller_id);
              return (
                <div key={t.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/40 p-3 text-xs">
                  <div>
                    <p className="font-bold">{r?.name ?? "Revendedor"}</p>
                    <p className="text-muted-foreground">{new Date(t.created_at).toLocaleString("pt-BR")} · {t.description}</p>
                  </div>
                  <span className="font-display font-bold" style={{ color: Number(t.amount) >= 0 ? "var(--lime)" : "var(--magenta)" }}>
                    {Number(t.amount) >= 0 ? "+" : ""}{brl(Number(t.amount))}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {editing && (
        <Modal title={editing.id ? "Editar revendedor" : "Novo revendedor"} onClose={() => setEditing(null)}>
          <Field label="Nome"><input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inputCls} /></Field>
          <Field label="E-mail (para login no painel)"><input type="email" value={editing.email ?? ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })} className={inputCls} placeholder="revendedor@email.com" /></Field>
          <Field label="Contato (WhatsApp)"><input value={editing.contact ?? ""} onChange={(e) => setEditing({ ...editing, contact: e.target.value })} className={inputCls} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Custo por crédito (R$)"><input type="number" step="0.01" value={editing.credit_cost ?? 0} onChange={(e) => setEditing({ ...editing, credit_cost: Number(e.target.value) })} className={inputCls} /></Field>
            <Field label="Status">
              <select value={editing.status ?? "ativo"} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className={inputCls}>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </Field>
          </div>
          <Field label="Observações"><input value={editing.notes ?? ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} className={inputCls} /></Field>
          <p className="mb-3 text-[11px] leading-relaxed text-muted-foreground">
            O revendedor acessa o próprio painel em <b>/revenda</b> criando uma conta com este e-mail.
          </p>
          <SaveBtn onClick={save} saving={saving} />
        </Modal>
      )}

      {topup && (
        <Modal title={`Ajustar saldo — ${topup.name}`} onClose={() => setTopup(null)}>
          <p className="mb-3 text-xs text-muted-foreground">Saldo atual: <b className="text-lime">{brl(Number(topup.balance))}</b></p>
          <Field label="Valor (use negativo para debitar)"><input type="number" step="0.01" value={topupVal} onChange={(e) => setTopupVal(e.target.value)} className={inputCls} placeholder="Ex: 100" /></Field>
          <SaveBtn onClick={addCredit} saving={saving} />
        </Modal>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm outline-none transition-all focus:border-cyan";

function Kpi({ icon: Icon, color, label, value }: { icon: any; color: string; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-5 backdrop-blur" style={{ boxShadow: `0 0 24px -16px ${color}` }}>
      <Icon className="h-5 w-5" style={{ color }} />
      <div className="mt-3 font-display text-2xl font-black" style={{ color }}>{value}</div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="mb-1 block font-display text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-cyan/40 bg-card p-6"
        style={{ boxShadow: "0 0 40px -12px var(--cyan)" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold uppercase tracking-wide">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

function SaveBtn({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  return (
    <button onClick={onClick} disabled={saving} className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-cyan bg-cyan/10 px-4 py-3 font-display text-sm font-bold uppercase tracking-wide text-cyan transition-all hover:bg-cyan/20 disabled:opacity-50">
      {saving && <Loader2 className="h-4 w-4 animate-spin" />} Salvar
    </button>
  );
}
