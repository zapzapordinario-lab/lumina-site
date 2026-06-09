import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Links the currently authenticated user to a reseller row that was
 * pre-registered by the admin with the same e-mail. Returns the reseller row
 * (or null if this user is not a registered reseller).
 */
export const linkResellerAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, claims } = context as { userId: string; claims: any };
    const email = String(claims?.email ?? "").toLowerCase().trim();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing } = await supabaseAdmin
      .from("resellers")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (existing) return { reseller: existing };

    if (!email) return { reseller: null };

    const { data: match } = await supabaseAdmin
      .from("resellers")
      .select("*")
      .ilike("email", email)
      .is("user_id", null)
      .maybeSingle();
    if (!match) return { reseller: null };

    const { data: updated, error } = await supabaseAdmin
      .from("resellers")
      .update({ user_id: userId })
      .eq("id", match.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return { reseller: updated };
  });
