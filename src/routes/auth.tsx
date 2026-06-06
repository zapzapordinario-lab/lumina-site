import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Tv, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  ssr: false,
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) navigate({ to: "/admin" });
  }, [session, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        toast.success("Conta criada! Entrando…");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/admin" });
    } catch (err: any) {
      toast.error(err.message ?? "Falha na autenticação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(circle at center, black, transparent 75%)",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md rounded-2xl border border-cyan/40 bg-card/60 p-8 backdrop-blur"
        style={{ boxShadow: "0 0 40px -12px var(--cyan)" }}
      >
        <div className="mb-6 flex items-center justify-center gap-2 font-display text-2xl font-bold tracking-wider">
          <Tv className="h-6 w-6 text-magenta" />
          <span>
            DEZ<span className="text-glow-magenta">PILA</span>
          </span>
        </div>
        <p className="mb-6 text-center font-display text-xs font-bold uppercase tracking-[0.3em] text-cyan/80">
          // Painel Administrativo
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1 block font-display text-xs font-bold uppercase tracking-wide text-muted-foreground">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-background/60 px-4 py-3 text-sm outline-none transition-all focus:border-cyan"
              placeholder="voce@exemplo.com"
            />
          </div>
          <div>
            <label className="mb-1 block font-display text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Senha
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-background/60 px-4 py-3 text-sm outline-none transition-all focus:border-cyan"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-cyan bg-cyan/10 px-4 py-3 font-display text-sm font-bold uppercase tracking-wide text-cyan transition-all hover:bg-cyan/20 hover:glow-cyan disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <button
          onClick={() => setMode((m) => (m === "login" ? "signup" : "login"))}
          className="mt-5 w-full text-center text-xs text-muted-foreground transition-colors hover:text-cyan"
        >
          {mode === "login"
            ? "Primeiro acesso? Criar conta de administrador"
            : "Já tem conta? Entrar"}
        </button>
        <p className="mt-4 text-center text-[10px] leading-relaxed text-muted-foreground">
          A primeira conta criada torna-se administradora automaticamente.
        </p>
      </motion.div>
    </div>
  );
}
