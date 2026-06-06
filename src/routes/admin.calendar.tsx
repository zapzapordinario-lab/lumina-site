import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  isSameMonth,
  isSameDay,
  format,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { db, clientAlert, fillTemplate, messageFor, type Client } from "@/lib/db";

export const Route = createFileRoute("/admin/calendar")({
  ssr: false,
  component: CalendarPage,
});

function CalendarPage() {
  const [cursor, setCursor] = useState(new Date());

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data } = await db.from("clients").select("*");
      return data ?? [];
    },
  });

  const eventsOn = (day: Date) =>
    clients.filter((c) => c.due_date && isSameDay(new Date(c.due_date + "T00:00:00"), day));

  const monthStart = startOfMonth(cursor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 });
  const days: Date[] = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) days.push(d);

  return (
    <div>
      <h1 className="font-display text-3xl font-black">Calendário</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Faturamento, renovações e expirações dos clientes.
      </p>

      <div className="mt-6 rounded-xl border border-cyan/40 bg-card/40 p-5 backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setCursor(addMonths(cursor, -1))}
            className="rounded-lg border border-border p-2 text-muted-foreground hover:text-cyan"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="font-display text-lg font-bold uppercase tracking-wide">
            {format(cursor, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <button
            onClick={() => setCursor(addMonths(cursor, 1))}
            className="rounded-lg border border-border p-2 text-muted-foreground hover:text-cyan"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center font-display text-[10px] uppercase tracking-wide text-muted-foreground">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {days.map((day) => {
            const evs = eventsOn(day);
            const inMonth = isSameMonth(day, cursor);
            const today = isSameDay(day, new Date());
            return (
              <div
                key={day.toISOString()}
                className={`min-h-[68px] rounded-lg border p-1.5 text-left ${
                  today ? "border-cyan glow-cyan" : "border-border/60"
                } ${inMonth ? "bg-background/40" : "bg-transparent opacity-40"}`}
              >
                <div className="text-[11px] font-bold text-muted-foreground">
                  {format(day, "d")}
                </div>
                <div className="mt-1 space-y-1">
                  {evs.slice(0, 3).map((c) => {
                    const a = clientAlert(c);
                    const color =
                      a === "expired"
                        ? "var(--magenta)"
                        : a === "due_soon"
                          ? "var(--cyan)"
                          : a === "trial_expired"
                            ? "#ffd400"
                            : "var(--lime)";
                    return (
                      <div
                        key={c.id}
                        className="truncate rounded px-1 py-0.5 text-[9px] font-bold"
                        style={{ background: `color-mix(in oklab, ${color} 18%, transparent)`, color }}
                        title={`${c.name} · ${c.status}`}
                      >
                        {c.name}
                      </div>
                    );
                  })}
                  {evs.length > 3 && (
                    <div className="text-[9px] text-muted-foreground">+{evs.length - 3}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Message generator */}
      <div className="mt-6 rounded-xl border border-magenta/40 bg-card/40 p-5 backdrop-blur">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-magenta" />
          <h2 className="font-display text-lg font-bold uppercase tracking-wide">
            Gerador de mensagens automáticas
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {(
            [
              ["due_soon", "Aviso pré-vencimento", "var(--cyan)"],
              ["expired", "Cobrança pós-vencimento", "var(--magenta)"],
              ["trial_expired", "Expiração de teste", "#ffd400"],
            ] as const
          ).map(([key, label, color]) => (
            <div
              key={key}
              className="rounded-lg border border-border bg-background/40 p-4"
              style={{ borderColor: `color-mix(in oklab, ${color} 35%, transparent)` }}
            >
              <p className="font-display text-xs font-bold uppercase tracking-wide" style={{ color }}>
                {label}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {messageFor[key]}
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(messageFor[key]);
                  toast.success("Modelo copiado");
                }}
                className="mt-3 inline-flex items-center gap-1 rounded border border-border px-2.5 py-1.5 text-[10px] font-bold uppercase text-muted-foreground hover:text-foreground"
              >
                <Copy className="h-3 w-3" /> Copiar modelo
              </button>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Variáveis disponíveis: <code>{"{{nome}}"}</code>, <code>{"{{vencimento}}"}</code>,{" "}
          <code>{"{{plano}}"}</code>
        </p>
      </div>
    </div>
  );
}
