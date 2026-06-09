import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  X,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  db,
  brl,
  MONTHS,
  monthIndex,
  yearOf,
  type Client,
  type Plan,
  type Payment,
  type Investment,
} from "@/lib/db";

interface Props {
  /** when set, new records are tagged to this reseller */
  resellerId?: string | null;
}

export function FinancePanel({ resellerId = null }: Props) {
  const qc = useQueryClient();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [payOpen, setPayOpen] = useState(false);
  const [invOpen, setInvOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: payments = [] } = useQuery<Payment[]>({
    queryKey: ["payments"],
    queryFn: async () => {
      const { data } = await db
        .from("payments")
        .select("*")
        .order("paid_at", { ascending: false });
      return data ?? [];
    },
  });
  const { data: investments = [] } = useQuery<Investment[]>({
    queryKey: ["investments"],
    queryFn: async () => {
      const { data } = await db
        .from("investments")
        .select("*")
        .order("invested_at", { ascending: false });
      return data ?? [];
    },
  });
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data } = await db.from("clients").select("*").order("name");
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

  const paid = payments.filter((p) => p.status === "paid");

  const totalRevenue = paid.reduce((s, p) => s + Number(p.amount), 0);
  const totalInvest = investments.reduce((s, i) => s + Number(i.amount), 0);
  const totalProfit = totalRevenue - totalInvest;

  const yearPayments = paid.filter((p) => yearOf(p.paid_at) === year);
  const yearInvest = investments.filter((i) => yearOf(i.invested_at) === year);
  const yearRevenue = yearPayments.reduce((s, p) => s + Number(p.amount), 0);
  const yearInvestTotal = yearInvest.reduce((s, i) => s + Number(i.amount), 0);

  const years = useMemo(() => {
    const set = new Set<number>([now.getFullYear()]);
    paid.forEach((p) => set.add(yearOf(p.paid_at)));
    investments.forEach((i) => set.add(yearOf(i.invested_at)));
    return Array.from(set).sort((a, b) => b - a);
  }, [paid, investments, now]);

  // monthly aggregation
  const monthly = MONTHS.map((m, idx) => {
    const rev = yearPayments
      .filter((p) => monthIndex(p.paid_at) === idx)
      .reduce((s, p) => s + Number(p.amount), 0);
    const inv = yearInvest
      .filter((i) => monthIndex(i.invested_at) === idx)
      .reduce((s, i) => s + Number(i.amount), 0);
    return { m, rev, inv };
  });
  const maxMonthly = Math.max(1, ...monthly.map((x) => Math.max(x.rev, x.inv)));

  // per-client matrix for the year
  const clientName = (id: string | null) =>
    clients.find((c) => c.id === id)?.name ?? "—";
  const perClient = useMemo(() => {
    const map = new Map<string, { name: string; total: number; months: number[] }>();
    paid.forEach((p) => {
      const key = p.client_id ?? "sem-cliente";
      if (!map.has(key))
        map.set(key, { name: clientName(p.client_id), total: 0, months: Array(12).fill(0) });
      const row = map.get(key)!;
      row.total += Number(p.amount);
      if (yearOf(p.paid_at) === year) row.months[monthIndex(p.paid_at)] += Number(p.amount);
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [paid, clients, year]);

  // forms
  const [payForm, setPayForm] = useState({
    client_id: "",
    plan_id: "",
    amount: "",
    paid_at: now.toISOString().slice(0, 10),
    method: "pix",
  });
  const [invForm, setInvForm] = useState({
    panel_name: "",
    amount: "",
    credits: "",
    invested_at: now.toISOString().slice(0, 10),
    notes: "",
  });

  const savePayment = async () => {
    if (!payForm.amount) return toast.error("Informe o valor");
    setSaving(true);
    const plan = plans.find((p) => p.id === payForm.plan_id);
    const { error } = await db.from("payments").insert({
      client_id: payForm.client_id || null,
      plan_id: payForm.plan_id || null,
      reseller_id: resellerId,
      amount: Number(payForm.amount),
      method: payForm.method,
      status: "paid",
      description: plan ? `Renovação ${plan.name}` : "Renovação",
      paid_at: new Date(payForm.paid_at).toISOString(),
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Pagamento registrado");
    setPayOpen(false);
    setPayForm({ client_id: "", plan_id: "", amount: "", paid_at: now.toISOString().slice(0, 10), method: "pix" });
    qc.invalidateQueries({ queryKey: ["payments"] });
  };

  const saveInvestment = async () => {
    if (!invForm.amount) return toast.error("Informe o valor");
    setSaving(true);
    const { error } = await db.from("investments").insert({
      reseller_id: resellerId,
      panel_name: invForm.panel_name || null,
      amount: Number(invForm.amount),
      credits: invForm.credits ? Number(invForm.credits) : null,
      notes: invForm.notes || null,
      invested_at: new Date(invForm.invested_at).toISOString(),
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Investimento registrado");
    setInvOpen(false);
    setInvForm({ panel_name: "", amount: "", credits: "", invested_at: now.toISOString().slice(0, 10), notes: "" });
    qc.invalidateQueries({ queryKey: ["investments"] });
  };

  const delPayment = async (id: string) => {
    if (!confirm("Remover este pagamento?")) return;
    const { error } = await db.from("payments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["payments"] });
  };
  const delInvestment = async (id: string) => {
    if (!confirm("Remover este investimento?")) return;
    const { error } = await db.from("investments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["investments"] });
  };

  const kpis = [
    { label: "Faturamento total", value: brl(totalRevenue), icon: DollarSign, color: "var(--lime)" },
    { label: `Faturado em ${year}`, value: brl(yearRevenue), icon: TrendingUp, color: "var(--cyan)" },
    { label: "Investido total", value: brl(totalInvest), icon: TrendingDown, color: "var(--magenta)" },
    { label: "Lucro líquido", value: brl(totalProfit), icon: Wallet, color: totalProfit >= 0 ? "var(--lime)" : "var(--magenta)" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black">Controle Financeiro</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Faturamento, investimentos e lucro — por cliente e por mês.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-cyan"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={() => setPayOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-lime/60 bg-lime/10 px-4 py-2 font-display text-xs font-bold uppercase tracking-wide text-lime transition-all hover:bg-lime/20"
          >
            <Plus className="h-4 w-4" /> Renovação
          </button>
          <button
            onClick={() => setInvOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-magenta/60 bg-magenta/10 px-4 py-2 font-display text-xs font-bold uppercase tracking-wide text-magenta transition-all hover:bg-magenta/20"
          >
            <Plus className="h-4 w-4" /> Investimento
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-card/40 p-5 backdrop-blur"
            style={{ boxShadow: `0 0 24px -16px ${s.color}` }}
          >
            <s.icon className="h-5 w-5" style={{ color: s.color }} />
            <div className="mt-3 font-display text-2xl font-black" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Monthly chart */}
      <div className="mt-8 rounded-xl border border-border bg-card/40 p-5 backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold uppercase tracking-wide">
            Receita x Investimento — {year}
          </h2>
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wide">
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-lime" /> Receita</span>
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-magenta" /> Investido</span>
          </div>
        </div>
        <div className="flex items-end gap-2 overflow-x-auto pb-2" style={{ height: 200 }}>
          {monthly.map((mm) => (
            <div key={mm.m} className="flex min-w-[36px] flex-1 flex-col items-center justify-end gap-1">
              <div className="flex h-[150px] w-full items-end justify-center gap-1">
                <div
                  title={`Receita ${brl(mm.rev)}`}
                  className="w-1/2 rounded-t bg-lime/80 transition-all"
                  style={{ height: `${(mm.rev / maxMonthly) * 100}%` }}
                />
                <div
                  title={`Investido ${brl(mm.inv)}`}
                  className="w-1/2 rounded-t bg-magenta/80 transition-all"
                  style={{ height: `${(mm.inv / maxMonthly) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-bold uppercase text-muted-foreground">{mm.m}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-6 text-xs">
          <span className="text-muted-foreground">Receita {year}: <b className="text-lime">{brl(yearRevenue)}</b></span>
          <span className="text-muted-foreground">Investido {year}: <b className="text-magenta">{brl(yearInvestTotal)}</b></span>
          <span className="text-muted-foreground">Lucro {year}: <b style={{ color: yearRevenue - yearInvestTotal >= 0 ? "var(--lime)" : "var(--magenta)" }}>{brl(yearRevenue - yearInvestTotal)}</b></span>
        </div>
      </div>

      {/* Per client matrix */}
      <div className="mt-8 rounded-xl border border-border bg-card/40 p-5 backdrop-blur">
        <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wide">
          Faturamento por cliente — {year}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-xs">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="sticky left-0 bg-card/40 px-2 py-2 font-bold uppercase">Cliente</th>
                {MONTHS.map((m) => (
                  <th key={m} className="px-2 py-2 text-right font-bold uppercase">{m}</th>
                ))}
                <th className="px-2 py-2 text-right font-bold uppercase text-cyan">Total</th>
              </tr>
            </thead>
            <tbody>
              {perClient.length === 0 && (
                <tr><td colSpan={14} className="px-2 py-6 text-center text-muted-foreground">Nenhum pagamento registrado ainda.</td></tr>
              )}
              {perClient.map((row) => (
                <tr key={row.name} className="border-t border-border/60">
                  <td className="sticky left-0 bg-card/40 px-2 py-2 font-bold">{row.name}</td>
                  {row.months.map((v, i) => (
                    <td key={i} className={`px-2 py-2 text-right ${v ? "text-foreground" : "text-muted-foreground/40"}`}>
                      {v ? brl(v) : "—"}
                    </td>
                  ))}
                  <td className="px-2 py-2 text-right font-bold text-cyan">{brl(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent lists */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card/40 p-5 backdrop-blur">
          <h2 className="mb-3 font-display text-base font-bold uppercase tracking-wide text-lime">Renovações recentes</h2>
          <div className="space-y-2">
            {paid.slice(0, 8).map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/40 p-3 text-xs">
                <div>
                  <p className="font-bold">{clientName(p.client_id)}</p>
                  <p className="text-muted-foreground">{new Date(p.paid_at).toLocaleDateString("pt-BR")} · {p.method}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-lime">{brl(Number(p.amount))}</span>
                  <button onClick={() => delPayment(p.id)} className="text-muted-foreground hover:text-magenta"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
            {paid.length === 0 && <p className="text-xs text-muted-foreground">Nada por aqui ainda.</p>}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card/40 p-5 backdrop-blur">
          <h2 className="mb-3 font-display text-base font-bold uppercase tracking-wide text-magenta">Investimentos recentes</h2>
          <div className="space-y-2">
            {investments.slice(0, 8).map((i) => (
              <div key={i.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/40 p-3 text-xs">
                <div>
                  <p className="font-bold">{i.panel_name ?? "Painel"}</p>
                  <p className="text-muted-foreground">{new Date(i.invested_at).toLocaleDateString("pt-BR")}{i.credits ? ` · ${i.credits} créditos` : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-magenta">{brl(Number(i.amount))}</span>
                  <button onClick={() => delInvestment(i.id)} className="text-muted-foreground hover:text-magenta"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
            {investments.length === 0 && <p className="text-xs text-muted-foreground">Nada por aqui ainda.</p>}
          </div>
        </div>
      </div>

      {/* Payment modal */}
      {payOpen && (
        <Modal title="Registrar renovação" onClose={() => setPayOpen(false)}>
          <Field label="Cliente">
            <select value={payForm.client_id} onChange={(e) => setPayForm({ ...payForm, client_id: e.target.value })} className={inputCls}>
              <option value="">— Selecionar —</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Plano">
            <select value={payForm.plan_id} onChange={(e) => { const pl = plans.find((p) => p.id === e.target.value); setPayForm({ ...payForm, plan_id: e.target.value, amount: pl ? String(pl.price) : payForm.amount }); }} className={inputCls}>
              <option value="">— Nenhum —</option>
              {plans.map((p) => <option key={p.id} value={p.id}>{p.name} ({brl(p.price)})</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Valor (R$)"><input type="number" step="0.01" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} className={inputCls} /></Field>
            <Field label="Data"><input type="date" value={payForm.paid_at} onChange={(e) => setPayForm({ ...payForm, paid_at: e.target.value })} className={inputCls} /></Field>
          </div>
          <Field label="Método">
            <select value={payForm.method} onChange={(e) => setPayForm({ ...payForm, method: e.target.value })} className={inputCls}>
              <option value="pix">PIX</option>
              <option value="manual">Manual</option>
              <option value="cartao">Cartão</option>
            </select>
          </Field>
          <SaveBtn onClick={savePayment} saving={saving} />
        </Modal>
      )}

      {/* Investment modal */}
      {invOpen && (
        <Modal title="Registrar investimento" onClose={() => setInvOpen(false)}>
          <Field label="Painel / fornecedor"><input value={invForm.panel_name} onChange={(e) => setInvForm({ ...invForm, panel_name: e.target.value })} className={inputCls} placeholder="Ex: Painel X" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Valor (R$)"><input type="number" step="0.01" value={invForm.amount} onChange={(e) => setInvForm({ ...invForm, amount: e.target.value })} className={inputCls} /></Field>
            <Field label="Créditos"><input type="number" value={invForm.credits} onChange={(e) => setInvForm({ ...invForm, credits: e.target.value })} className={inputCls} /></Field>
          </div>
          <Field label="Data"><input type="date" value={invForm.invested_at} onChange={(e) => setInvForm({ ...invForm, invested_at: e.target.value })} className={inputCls} /></Field>
          <Field label="Observações"><input value={invForm.notes} onChange={(e) => setInvForm({ ...invForm, notes: e.target.value })} className={inputCls} /></Field>
          <SaveBtn onClick={saveInvestment} saving={saving} />
        </Modal>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm outline-none transition-all focus:border-cyan";

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
    <button
      onClick={onClick}
      disabled={saving}
      className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-cyan bg-cyan/10 px-4 py-3 font-display text-sm font-bold uppercase tracking-wide text-cyan transition-all hover:bg-cyan/20 disabled:opacity-50"
    >
      {saving && <Loader2 className="h-4 w-4 animate-spin" />} Salvar
    </button>
  );
}
