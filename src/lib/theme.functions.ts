import { createServerFn } from "@tanstack/react-start";

export const getPublicTheme = createServerFn({ method: "GET" }).handler(
  async () => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data } = await supabaseAdmin
      .from("app_settings")
      .select("theme")
      .eq("id", "global")
      .maybeSingle();
    return { theme: (data?.theme ?? {}) as Record<string, string> };
  },
);
