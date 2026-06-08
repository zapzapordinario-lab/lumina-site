import { createServerFn } from "@tanstack/react-start";

export const getPublicPlans = createServerFn({ method: "GET" }).handler(
  async () => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data } = await supabaseAdmin
      .from("plans")
      .select("*")
      .eq("active", true)
      .order("sort_order");
    return { plans: (data ?? []) as Array<{
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
    }> };
  },
);
