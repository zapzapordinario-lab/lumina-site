import { createServerFn } from "@tanstack/react-start";

export const getIptvAccessByToken = createServerFn({ method: "GET" })
  .inputValidator((data: { token: string }) => {
    const token = (data?.token ?? "").trim();
    if (!token || token.length > 128 || !/^[a-zA-Z0-9]+$/.test(token)) {
      throw new Error("Invalid token");
    }
    return { token };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: row, error } = await supabaseAdmin
      .from("iptv_access")
      .select(
        "client_name, username, password, server_primary, server_secondary, support_whatsapp, support_telegram",
      )
      .eq("token", data.token)
      .maybeSingle();

    if (error) throw new Error("Lookup failed");
    if (!row) return { found: false as const };
    return { found: true as const, access: row };
  });
