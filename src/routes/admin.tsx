import {
  createFileRoute,
  Outlet,
  Link,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Users,
  Bot,
  CalendarDays,
  Palette,
  MonitorPlay,
  LogOut,
  Tv,
  Loader2,
  ShieldAlert,
  DollarSign,
  Store,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/finance", label: "Financeiro", icon: DollarSign },
  { to: "/admin/resellers", label: "Revendedores", icon: Store },
  { to: "/admin/plans", label: "Planos", icon: Package },
  { to: "/admin/clients", label: "Usuários", icon: Users },
  { to: "/admin/automation", label: "Automação", icon: Bot },
  { to: "/admin/calendar", label: "Calendário", icon: CalendarDays },
  { to: "/admin/theme", label: "Tema", icon: Palette },
  { to: "/admin/iptv", label: "Acessos IPTV", icon: MonitorPlay },
];

function AdminLayout() {
  const { session, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-cyan" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <ShieldAlert className="h-12 w-12 text-magenta" />
        <h1 className="font-display text-2xl font-bold">Acesso restrito</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Sua conta não tem permissão de administrador. Se você é revendedor,
          acesse o seu painel de revenda.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate({ to: "/revenda" })}
            className="rounded-lg border border-cyan/60 bg-cyan/10 px-4 py-2 text-sm font-bold uppercase tracking-wide text-cyan hover:bg-cyan/20"
          >
            Painel de revenda
          </button>
          <button
            onClick={async () => {
              await signOut();
              navigate({ to: "/auth" });
            }}
            className="rounded-lg border border-border px-4 py-2 text-sm font-bold uppercase tracking-wide text-muted-foreground hover:text-foreground"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-card/40 backdrop-blur lg:flex">
        <div className="flex items-center gap-2 border-b border-border px-5 py-5 font-display text-lg font-bold tracking-wider">
          <Tv className="h-5 w-5 text-magenta" />
          QUINZE<span className="text-glow-magenta">CONTO</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((n) => {
            const active = n.exact
              ? pathname === n.to
              : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-display text-xs font-bold uppercase tracking-wide transition-all ${
                  active
                    ? "border border-cyan/60 bg-cyan/10 text-cyan glow-cyan"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <button
            onClick={async () => {
              await signOut();
              navigate({ to: "/auth" });
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-display text-xs font-bold uppercase tracking-wide text-muted-foreground transition-all hover:text-destructive"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="sticky top-0 z-40 flex items-center gap-2 overflow-x-auto border-b border-border bg-card/70 px-3 py-2 backdrop-blur lg:hidden">
        {nav.map((n) => {
          const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
          return (
            <Link
              key={n.to}
              to={n.to}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-wide ${
                active ? "bg-cyan/15 text-cyan" : "text-muted-foreground"
              }`}
            >
              <n.icon className="h-3.5 w-3.5" />
              {n.label}
            </Link>
          );
        })}
      </div>

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-4 py-6 lg:ml-60 lg:px-8 lg:py-8"
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
