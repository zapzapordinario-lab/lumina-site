import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  CalendarDays,
  Bot,
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
import { db, clientAlert, messageFor, type Client } from "@/lib/db";

export const Route = createFileRoute("/admin/calendar")({
  ssr: false,
  component: CalendarPage,
});

type MessageKey = Exclude<ReturnType<typeof clientAlert>, "ok">;

const messageGroups: Record<
  MessageKey,
  { label: string; color: string; flow: string[]; copies: string[] }
> = {
  due_soon: {
    label: "Aviso pré-vencimento",
    color: "var(--cyan)",
    flow: [
      "Identificar cliente com vencimento em até 3 dias",
      "Enviar lembrete com plano e data",
      "Se responder, direcionar para pagamento/renovação",
      "Após confirmação, marcar como ativo no painel",
    ],
    copies: [
      messageFor.due_soon,
      "Oi {{nome}}! Seu acesso {{plano}} vence em {{vencimento}}. Quer que eu já deixe sua renovação encaminhada para não pausar nada?",
      "{{nome}}, passando para lembrar que seu plano {{plano}} vence em {{vencimento}}. Renovando agora você continua assistindo sem bloqueio.",
      "Fala, {{nome}}! Seu vencimento está chegando: {{vencimento}}. Posso te mandar os dados para renovar o {{plano}}?",
      "{{nome}}, seu acesso segue ativo, mas vence em {{vencimento}}. Garanta sua renovação antecipada e evite interrupção.",
      "Aviso rápido, {{nome}}: o plano {{plano}} vence em {{vencimento}}. Quer renovar agora e ficar tranquilo?",
      "Oi {{nome}}, tudo certo? Seu plano {{plano}} está perto de vencer ({{vencimento}}). Posso preparar a renovação?",
      "{{nome}}, faltam poucos dias para o vencimento do seu acesso. Data: {{vencimento}}. Renove e mantenha tudo liberado.",
      "Passando para te avisar, {{nome}}: seu {{plano}} vence em {{vencimento}}. A renovação é rápida e já mantém seu sinal ativo.",
      "{{nome}}, para não ficar sem assistir, renove seu plano {{plano}} antes de {{vencimento}}. Quer seguir com a renovação?",
      "Olá, {{nome}}! Seu acesso vence em {{vencimento}}. Se quiser, já faço sua renovação agora e deixo tudo garantido.",
    ],
  },
  expired: {
    label: "Cobrança pós-vencimento",
    color: "var(--magenta)",
    flow: [
      "Detectar cliente com vencimento atrasado",
      "Enviar cobrança com tom direto e educado",
      "Oferecer reativação imediata após pagamento",
      "Se não responder, acionar nova tentativa de recuperação",
    ],
    copies: [
      messageFor.expired,
      "{{nome}}, seu plano {{plano}} venceu em {{vencimento}} e pode ser bloqueado. Quer reativar agora para voltar a assistir?",
      "Oi {{nome}}! Consta aqui que seu acesso venceu em {{vencimento}}. Posso te ajudar a renovar e liberar novamente?",
      "{{nome}}, seu acesso está pendente desde {{vencimento}}. A renovação é rápida e a liberação acontece logo após a confirmação.",
      "Passando para regularizar, {{nome}}: seu {{plano}} venceu em {{vencimento}}. Quer receber os dados para pagamento?",
      "{{nome}}, seu plano aparece como vencido. Data: {{vencimento}}. Posso fazer a reativação para você agora?",
      "Olá, {{nome}}! Seu acesso foi pausado por vencimento em {{vencimento}}. Renovando agora você volta a assistir sem complicação.",
      "{{nome}}, ainda deseja continuar com o {{plano}}? Ele venceu em {{vencimento}} e posso reativar hoje mesmo.",
      "Aviso de pendência, {{nome}}: vencimento em {{vencimento}}. Me chama aqui que já resolvemos sua renovação.",
      "{{nome}}, seu acesso precisa de renovação para continuar ativo. Vencimento registrado: {{vencimento}}.",
      "Oi {{nome}}, posso liberar seu acesso novamente assim que renovar o {{plano}} vencido em {{vencimento}}.",
    ],
  },
  trial_expired: {
    label: "Expiração de teste",
    color: "#ffd400",
    flow: [
      "Identificar teste grátis encerrado",
      "Enviar oferta de ativação com benefício claro",
      "Coletar plano escolhido e dispositivo usado",
      "Enviar para atendimento finalizar ativação",
    ],
    copies: [
      messageFor.trial_expired,
      "{{nome}}, seu teste grátis terminou. Se curtiu a qualidade, posso ativar seu plano {{plano}} agora e manter tudo liberado.",
      "E aí, {{nome}}! Seu teste encerrou. Quer continuar assistindo com acesso completo hoje?",
      "{{nome}}, seu período de teste chegou ao fim. Ativando agora, você já fica com o sinal completo sem esperar.",
      "Oi {{nome}}, seu teste grátis expirou em {{vencimento}}. Quer escolher um plano e continuar com tudo liberado?",
      "{{nome}}, gostou do teste? Posso transformar em plano ativo agora e liberar seu acesso definitivo.",
      "Seu teste acabou, {{nome}}. Para não perder o acesso, me diga qual plano deseja ativar que já te encaminho.",
      "{{nome}}, o teste grátis foi finalizado. Temos ativação rápida para você continuar assistindo ainda hoje.",
      "Olá, {{nome}}! Seu teste encerrou e seu acesso pode ser ativado em poucos minutos. Quer seguir?",
      "{{nome}}, chegou a hora de garantir seu plano. O teste venceu em {{vencimento}} e eu já posso te ajudar na ativação.",
      "Teste concluído, {{nome}}! Quer manter o {{plano}} e receber os dados de ativação agora?",
    ],
  },
};

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
        <div className="grid gap-4 lg:grid-cols-3">
          {(Object.entries(messageGroups) as [MessageKey, (typeof messageGroups)[MessageKey]][]).map(([key, group]) => (
            <div
              key={key}
              className="rounded-lg border border-border bg-background/40 p-4"
              style={{ borderColor: `color-mix(in oklab, ${group.color} 35%, transparent)` }}
            >
              <p className="font-display text-xs font-bold uppercase tracking-wide" style={{ color: group.color }}>
                {group.label}
              </p>
              <div className="mt-3 rounded border border-border/70 bg-card/30 p-3">
                <div className="mb-2 flex items-center gap-2 font-display text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  <Bot className="h-3.5 w-3.5" /> Fluxo chatbot
                </div>
                <ol className="space-y-1 text-[11px] leading-relaxed text-muted-foreground">
                  {group.flow.map((step, index) => (
                    <li key={step}>{index + 1}. {step}</li>
                  ))}
                </ol>
              </div>
              <div className="mt-3 max-h-96 space-y-2 overflow-auto pr-1">
                {group.copies.map((copy, index) => (
                  <div key={`${key}-${index}`} className="rounded border border-border/60 bg-background/50 p-3">
                    <p className="text-xs leading-relaxed text-muted-foreground">{copy}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(copy);
                        toast.success("Mensagem copiada");
                      }}
                      className="mt-2 inline-flex items-center gap-1 rounded border border-border px-2.5 py-1.5 text-[10px] font-bold uppercase text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="h-3 w-3" /> Copiar msg
                    </button>
                  </div>
                ))}
              </div>
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
