import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users,
  AlertTriangle,
  Clock,
  Package,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import {
  db,
  clientAlert,
  daysUntil,
  fillTemplate,
  messageFor,
  waLink,
  type Client,
} from "@/lib/db";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  component: Dashboard,
});

function Dashboard() {
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data } = await db.from("clients").select("*").order("due_date");
      return data ?? [];
    },
  });
  const { data: planCount = 0 } = useQuery({
    queryKey: ["plan-count"],
    queryFn: async () => {
      const { count } = await db
        .from("plans")
        .select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const active = clients.filter((c) => c.status === "ativo").length;
  const trials = clients.filter((c) => c.status === "teste").length;
  const alerts = clients
    .map((c) => ({ c, a: clientAlert(c) }))
    .filter((x) => x.a !== "ok");

  const stats = [
    { label: "Clientes", value: clients.length, icon: Users, color: "var(--cyan)" },
    { label: "Ativos", value: active, icon: CheckCircle2, color: "var(--lime)" },
    { label: "Em teste", value: trials, icon: Clock, color: "var(--magenta)" },
    { label: "Planos", value: planCount, icon: Package, color: "var(--cyan)" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-black">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Visão geral e notificações proativas do seu negócio.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-card/40 p-5 backdrop-blur"
          >
            <s.icon className="h-5 w-5" style={{ color: s.color }} />
            <div className="mt-3 font-display text-3xl font-black">{s.value}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-magenta/40 bg-card/40 p-5 backdrop-blur">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-magenta" />
          <h2 className="font-display text-lg font-bold uppercase tracking-wide">
            Notificações ({alerts.length})
          </h2>
        </div>

        {alerts.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Tudo em dia! Nenhum cliente próximo do vencimento ou com teste
            expirado.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {alerts.map(({ c, a }) => {
              const days = daysUntil(c.due_date);
              const labels: Record<string, string> = {
                due_soon: `Vence em ${days} dia(s)`,
                expired: `Vencido há ${Math.abs(days ?? 0)} dia(s)`,
                trial_expired: "Teste expirado",
              };
              const colors: Record<string, string> = {
                due_soon: "var(--cyan)",
                expired: "var(--magenta)",
                trial_expired: "#ffd400",
              };
              const msg = fillTemplate(messageFor[a as keyof typeof messageFor], c);
              return (
                <div
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background/40 p-4"
                >
                  <div>
                    <p className="font-display text-sm font-bold">{c.name}</p>
                    <p
                      className="text-xs font-bold uppercase tracking-wide"
                      style={{ color: colors[a] }}
                    >
                      {labels[a]}
                    </p>
                  </div>
                  <a
                    href={waLink(c.contact, msg)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-lime/60 bg-lime/10 px-4 py-2 font-display text-xs font-bold uppercase tracking-wide text-lime transition-all hover:bg-lime/20"
                  >
                    <MessageCircle className="h-4 w-4" /> Enviar cobrança
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
