import { createServerFn } from "@tanstack/react-start";

export const validateInstructionLogin = createServerFn({ method: "POST" })
  .inputValidator((data: { username: string; password: string }) => {
    const username = (data?.username ?? "").trim();
    const password = (data?.password ?? "").trim();
    if (!username || username.length > 128) throw new Error("Invalid username");
    if (!password || password.length > 128) throw new Error("Invalid password");
    return { username, password };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: row, error } = await supabaseAdmin
      .from("instruction_credentials")
      .select("client_name, username, active")
      .eq("username", data.username)
      .eq("password", data.password)
      .maybeSingle();

    if (error) throw new Error("Lookup failed");
    if (!row || !row.active) return { ok: false as const };
    return { ok: true as const, client_name: row.client_name };
  });
