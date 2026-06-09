import { supabase } from "@/integrations/supabase/client";

// The generated Database types may not yet include our new tables in the
// editor's view, so we expose a loosely-typed client for app data access.
// Auth still uses the strongly-typed `supabase` client directly.
export const db = supabase as unknown as {
  from: (table: string) => any;
};

export interface Plan {
  id: string;
  name: string;
  period: string;
  price: number;
  duration_days: number;
  description: string | null;
  badge: string | null;
  accent_color: string;
  highlighted: boolean;
  sort_order: number;
  active: boolean;
}

export interface Client {
  id: string;
  name: string;
  contact: string | null;
  plan_type: string;
  plan_id: string | null;
  due_date: string | null;
  status: string; // ativo | inativo | teste
  notes: string | null;
  reseller_id: string | null;
  created_at: string;
}

export interface Reseller {
  id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  contact: string | null;
  balance: number;
  credit_cost: number;
  status: string; // ativo | inativo
  notes: string | null;
  created_at: string;
}

export interface ResellerTransaction {
  id: string;
  reseller_id: string;
  type: string; // credit_purchase | debit | adjustment
  amount: number;
  balance_after: number | null;
  description: string | null;
  reference: string | null;
  status: string;
  created_at: string;
}

export interface Payment {
  id: string;
  client_id: string | null;
  plan_id: string | null;
  reseller_id: string | null;
  amount: number;
  method: string; // pix | manual
  status: string; // paid | pending
  reference: string | null;
  description: string | null;
  paid_at: string;
  created_at: string;
}

export interface Investment {
  id: string;
  reseller_id: string | null;
  panel_name: string | null;
  amount: number;
  credits: number | null;
  notes: string | null;
  invested_at: string;
  created_at: string;
}

export interface AppSettings {
  id: string;
  chatbot_webhook: string | null;
  chatbot_token: string | null;
  chatbot_base_url: string | null;
  support_whatsapp: string | null;
  support_telegram: string | null;
  theme: Record<string, any>;
}

export interface AutomationFlow {
  id: string;
  title: string;
  category: string;
  content: Record<string, any>;
  is_template: boolean;
  created_at: string;
}

export interface IptvAccess {
  id: string;
  token: string;
  client_name: string | null;
  username: string;
  password: string;
  server_primary: string | null;
  server_secondary: string | null;
  support_whatsapp: string | null;
  support_telegram: string | null;
  created_at: string;
}

// ---- Date / status helpers ----
export function daysUntil(date: string | null): number | null {
  if (!date) return null;
  const d = new Date(date + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / 86400000);
}

export type ClientAlert = "ok" | "due_soon" | "expired" | "trial_expired";

export function clientAlert(c: Client): ClientAlert {
  const days = daysUntil(c.due_date);
  if (c.status === "teste") {
    if (days !== null && days < 0) return "trial_expired";
    return "ok";
  }
  if (days === null) return "ok";
  if (days < 0) return "expired";
  if (days <= 3) return "due_soon";
  return "ok";
}

// ---- WhatsApp message generators ----
export function fillTemplate(tpl: string, c: Client): string {
  return tpl
    .replaceAll("{{nome}}", c.name)
    .replaceAll("{{vencimento}}", c.due_date ?? "—")
    .replaceAll("{{plano}}", c.plan_type);
}

export const messageFor: Record<Exclude<ClientAlert, "ok">, string> = {
  due_soon:
    "Oi {{nome}}! 👋 Seu plano DezPila vence em breve ({{vencimento}}). Renove via PIX e continue assistindo sem interrupção.",
  expired:
    "{{nome}}, seu plano DezPila venceu em {{vencimento}}. Reative agora via PIX em 5 minutos e volte a assistir tudo!",
  trial_expired:
    "{{nome}}, seu teste grátis expirou. Gostou da DezPila? Escolha um plano e ative em 5 minutos. 🎬",
};

export function waLink(phone: string | null | undefined, text: string): string {
  const num = (phone ?? "").replace(/\D/g, "");
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}
