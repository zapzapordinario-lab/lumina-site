import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import {
  Tv,
  LogOut,
  Loader2,
  DollarSign,
  Users,
  Package,
  Wallet,
  Plus,
  Pencil,
  Trash2,
  X,
  QrCode,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { linkResellerAccount } from "@/lib/resellers.functions";
import { FinancePanel } from "@/components/FinancePanel";
import { PixDialog } from "@/components/PixDialog";
import { db, brl, type Reseller, type Client, type Plan } from "@/lib/db";

export const Route = createFileRoute("/revenda")({
  ssr: false,
  component: ResellerPanel,
});

type Tab = "overview" | "finance" | "clients" | "plans" | "saldo";

function ResellerPanel() {
  const navigate = useNavigate();
  const { session, loading: authLoading, signOut } = useAuth();
  const link = useServerFn(linkResellerAccount);
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    if (!authLoading && !session) navigate({ to: "/auth" });
  }, [authLoading, session, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["my-reseller", session?.user?.id],
    enabled: !!session,
    queryFn: async () => (await link({})) as { reseller: Reseller | null },
  });
  const reseller = data?.reseller ?? null;

  if (authLoading || isLoading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-cyan" />
      </div>
    );
  }

  if (!reseller) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <ShieldAlert className="h-12 w-12 text-magenta" />
        <h1 className="font-display text-2xl font-bold">Acesso de revendedor</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Sua conta não está vinculada a um revendedor. Peça ao administrador
          para cadastrar este e-mail como revendedor.
        </p>
        <button
          onClick={async () => { await signOut(); navigate({ to: "/auth" }); }}
          className="rounded-lg border border-border px-4 py-2 text-sm font-bold uppercase tracking-wide text-muted-foreground hover:text-foreground"
        >
          Sair
        </button>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "overview", label: "Visão geral", icon: Wallet },
    { id: "finance", label: "Financeiro", icon: DollarSign },
    { id: "clients", label: "Clientes", icon: Users },
    { id: "plans", label: "Planos", icon: Package },
    { id: "saldo", label: "Adicionar saldo", icon: QrCode },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 font-display text-lg font-bold tracking-wider">
            <Tv className="h-5 w-5 text-magenta" />
            QUINZE<span className="text-glow-magenta">CONTO</span>
            <span className="ml-2 rounded-full border border-cyan/40 px-2 py-0.5 text-[10px] uppercase text-cyan">Revenda</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-display text-xs font-bold">{reseller.name}</p>
              <p className="text-[11px] text-lime">{brl(Number(reseller.balance))}</p>
            </div>
            <button onClick={async () => { await signOut(); navigate({ to: "/auth" }); }} className="text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto px-4 pb-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 font-display text-[11px] font-bold uppercase tracking-wide transition-all ${
                tab === t.id ? "border border-cyan/60 bg-cyan/10 text-cyan" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          ))}
        </div>
      </header>

      <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-6xl px-4 py-6">
        {tab === "overview" && <Overview reseller={reseller} />}
        {tab === "finance" && <FinancePanel resellerId={reseller.id} />}
        {tab === "clients" && <ResellerClients reseller={reseller} />}
        {tab === "plans" && <PlansView />}
        {tab === "saldo" && <SaldoTab reseller={reseller} />}
      </motion.main>
    </div>
  );
}

function Overview({ reseller }: { reseller: Reseller }) {
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: async () => (await db.from("clients").select("*")).data ?? [],
  });
  const active = clients.filter((c) => c.status === "ativo").length;
  const cards = [
    { label: "Saldo disponível", value: brl(Number(reseller.balance)), color: "var(--lime)", icon: Wallet },
    { label: "Clientes", value: String(clients.length), color: "var(--cyan)", icon: Users },
    { label: "Ativos", value: String(active), color: "var(--magenta)", icon: Users },
    { label: "Custo por crédito", value: brl(Number(reseller.credit_cost)), color: "var(--cyan)", icon: DollarSign },
  ];
  return (
    <div>
      <h1 className="font-display text-3xl font-black">Olá, {reseller.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">Seu painel de revenda completo.</p>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-border bg-card/40 p-5 backdrop-blur" style={{ boxShadow: `0 0 24px -16px ${s.color}` }}>
            <s.icon className="h-5 w-5" style={{ color: s.color }} />
            <div className="mt-3 font-display text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm outline-none transition-all focus:border-cyan";
const emptyClient: Partial<Client> = { name: "", contact: "", plan_type: "mensal", plan_id: null, due_date: "", status: "teste", notes: "" };

function ResellerClients({ reseller }: { reseller: Reseller }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Client> | null>(null);
  const [saving, setSaving] = useState(false);
  const [charge, setCharge] = useState<Client | null>(null);

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: async () => (await db.from("clients").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: plans = [] } = useQuery<Plan[]>({
    queryKey: ["plans"],
    queryFn: async () => (await db.from("plans").select("*").order("sort_order")).data ?? [],
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
      reseller_id: reseller.id,
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
    qc.invalidateQueries({ queryKey: ["clients"] });
  };

  const planPrice = (id: string | null) => plans.find((p) => p.id === id)?.price ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-black">Meus clientes</h1>
        <button onClick={() => setEditing({ ...emptyClient })} className="inline-flex items-center gap-2 rounded-lg border border-cyan bg-cyan/10 px-4 py-2 font-display text-xs font-bold uppercase tracking-wide text-cyan hover:bg-cyan/20">
          <Plus className="h-4 w-4" /> Novo
        </button>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {clients.map((c) => (
          <div key={c.id} className="rounded-xl border border-border bg-card/40 p-4 backdrop-blur">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display font-bold">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.contact ?? "sem contato"} · {c.plan_type}</p>
                <p className="text-[11px] text-muted-foreground">Vence: {c.due_date ?? "—"}</p>
              </div>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" style={{ color: c.status === "ativo" ? "var(--lime)" : c.status === "teste" ? "var(--cyan)" : "var(--magenta)" }}>{c.status}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => setCharge(c)} className="inline-flex items-center gap-1.5 rounded-lg border border-lime/60 bg-lime/10 px-3 py-1.5 text-xs font-bold uppercase text-lime hover:bg-lime/20"><QrCode className="h-3.5 w-3.5" /> Cobrar PIX</button>
              <button onClick={() => setEditing(c)} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-bold uppercase text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /> Editar</button>
              <button onClick={() => remove(c.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-bold uppercase text-muted-foreground hover:text-magenta"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
        {clients.length === 0 && <p className="text-sm text-muted-foreground">Nenhum cliente ainda.</p>}
      </div>

      {editing && (
        <Modal title={editing.id ? "Editar cliente" : "Novo cliente"} onClose={() => setEditing(null)}>
          <Field label="Nome"><input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inputCls} /></Field>
          <Field label="Contato"><input value={editing.contact ?? ""} onChange={(e) => setEditing({ ...editing, contact: e.target.value })} className={inputCls} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Plano">
              <select value={editing.plan_id ?? ""} onChange={(e) => setEditing({ ...editing, plan_id: e.target.value || null })} className={inputCls}>
                <option value="">— Nenhum —</option>
                {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={editing.status ?? "teste"} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className={inputCls}>
                <option value="teste">Teste</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </Field>
          </div>
          <Field label="Vencimento"><input type="date" value={editing.due_date ?? ""} onChange={(e) => setEditing({ ...editing, due_date: e.target.value })} className={inputCls} /></Field>
          <SaveBtn onClick={save} saving={saving} />
        </Modal>
      )}

      <PixDialog
        open={!!charge}
        onClose={() => setCharge(null)}
        defaultAmount={charge ? planPrice(charge.plan_id) : 0}
        description={charge ? `Renovação de plano — ${charge.name}` : ""}
        kind="client_payment"
        reseller_id={reseller.id}
        client_id={charge?.id ?? null}
        plan_id={charge?.plan_id ?? null}
      />
    </div>
  );
}

function PlansView() {
  const { data: plans = [] } = useQuery<Plan[]>({
    queryKey: ["plans"],
    queryFn: async () => (await db.from("plans").select("*").order("sort_order")).data ?? [],
  });
  return (
    <div>
      <h1 className="font-display text-2xl font-black">Planos disponíveis</h1>
      <p className="mt-1 text-sm text-muted-foreground">Tabela de planos definida pela administração.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((p) => (
          <div key={p.id} className="rounded-xl border border-border bg-card/40 p-5 backdrop-blur" style={{ boxShadow: `0 0 24px -18px ${p.accent_color}` }}>
            <h3 className="font-display text-lg font-bold" style={{ color: p.accent_color }}>{p.name}</h3>
            <p className="mt-2 font-display text-2xl font-black">{brl(Number(p.price))}</p>
            <p className="text-xs text-muted-foreground">{p.period} · {p.duration_days} dias</p>
            {p.description && <p className="mt-2 text-xs text-muted-foreground">{p.description}</p>}
          </div>
        ))}
        {plans.length === 0 && <p className="text-sm text-muted-foreground">Nenhum plano cadastrado.</p>}
      </div>
    </div>
  );
}

function SaldoTab({ reseller }: { reseller: Reseller }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mx-auto max-w-lg text-center">
      <Wallet className="mx-auto h-10 w-10 text-lime" />
      <h1 className="mt-3 font-display text-2xl font-black">Adicionar saldo</h1>
      <p className="mt-1 text-sm text-muted-foreground">Compre créditos via PIX automático para gerenciar seus clientes.</p>
      <div className="mt-6 rounded-xl border border-lime/40 bg-card/40 p-6 backdrop-blur" style={{ boxShadow: "0 0 30px -16px var(--lime)" }}>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Saldo atual</p>
        <p className="font-display text-4xl font-black text-lime">{brl(Number(reseller.balance))}</p>
        <button onClick={() => setOpen(true)} className="mt-5 inline-flex items-center gap-2 rounded-lg border border-lime bg-lime/10 px-5 py-3 font-display text-sm font-bold uppercase tracking-wide text-lime hover:bg-lime/20">
          <QrCode className="h-4 w-4" /> Comprar crédito via PIX
        </button>
      </div>
      <PixDialog
        open={open}
        onClose={() => setOpen(false)}
        description={`Compra de saldo — ${reseller.name}`}
        kind="reseller_topup"
        reseller_id={reseller.id}
        payer_email={reseller.email ?? undefined}
      />
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
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-cyan/40 bg-card p-6" style={{ boxShadow: "0 0 40px -12px var(--cyan)" }}>
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
