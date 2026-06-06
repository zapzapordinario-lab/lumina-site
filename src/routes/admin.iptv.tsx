import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Link2,
  Copy,
  ExternalLink,
  MonitorPlay,
} from "lucide-react";
import { toast } from "sonner";
import { db, type IptvAccess } from "@/lib/db";

export const Route = createFileRoute("/admin/iptv")({
  ssr: false,
  component: IptvPage,
});

const empty: Partial<IptvAccess> = {
  client_name: "",
  username: "",
  password: "",
  server_primary: "",
  server_secondary: "",
  support_whatsapp: "5588998044487",
  support_telegram: "",
};

function IptvPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<IptvAccess> | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: rows = [], isLoading } = useQuery<IptvAccess[]>({
    queryKey: ["iptv"],
    queryFn: async () => {
      const { data } = await db
        .from("iptv_access")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const save = async () => {
    if (!editing?.username || !editing?.password)
      return toast.error("Usuário e senha são obrigatórios");
    setSaving(true);
    const payload = {
      client_name: editing.client_name || null,
      username: editing.username,
      password: editing.password,
      server_primary: editing.server_primary || null,
      server_secondary: editing.server_secondary || null,
      support_whatsapp: editing.support_whatsapp || null,
      support_telegram: editing.support_telegram || null,
    };
    const { error } = editing.id
      ? await db.from("iptv_access").update(payload).eq("id", editing.id)
      : await db.from("iptv_access").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Acesso salvo");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["iptv"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Remover este acesso?")) return;
    await db.from("iptv_access").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["iptv"] });
  };

  const linkFor = (token: string) =>
    `${typeof window !== "undefined" ? window.location.origin : ""}/acesso/${token}`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-black">Acessos IPTV</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure os dados de acesso e gere um link único para cada cliente.
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...empty })}
          className="inline-flex items-center gap-2 rounded-lg border border-cyan bg-cyan/10 px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-cyan hover:bg-cyan/20 hover:glow-cyan"
        >
          <Plus className="h-4 w-4" /> Novo acesso
        </button>
      </div>

      {isLoading ? (
        <Loader2 className="mt-10 h-6 w-6 animate-spin text-cyan" />
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {rows.map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-card/40 p-5 backdrop-blur">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MonitorPlay className="h-5 w-5 text-cyan" />
                  <div>
                    <p className="font-display text-sm font-bold">
                      {r.client_name || "Cliente sem nome"}
                    </p>
                    <p className="text-xs text-muted-foreground">{r.username}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(r)}
                    className="rounded-lg border border-border p-2 text-muted-foreground hover:text-cyan"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => remove(r.id)}
                    className="rounded-lg border border-border p-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-lg border border-cyan/30 bg-background/40 p-2">
                <Link2 className="h-4 w-4 shrink-0 text-cyan" />
                <input
                  readOnly
                  value={linkFor(r.token)}
                  className="flex-1 bg-transparent text-xs text-muted-foreground outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(linkFor(r.token));
                    toast.success("Link copiado");
                  }}
                  className="rounded p-1.5 text-cyan hover:bg-cyan/10"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <a
                  href={linkFor(r.token)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded p-1.5 text-cyan hover:bg-cyan/10"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum acesso cadastrado.</p>
          )}
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setEditing(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border border-cyan/40 bg-card p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold uppercase tracking-wide">
                  {editing.id ? "Editar acesso" : "Novo acesso"}
                </h2>
                <button onClick={() => setEditing(null)}>
                  <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Lbl>Nome do cliente</Lbl>
                  <input
                    value={editing.client_name ?? ""}
                    onChange={(e) => setEditing({ ...editing, client_name: e.target.value })}
                    className="inp"
                  />
                </div>
                <div>
                  <Lbl>Username (ex: CPF)</Lbl>
                  <input
                    value={editing.username ?? ""}
                    onChange={(e) => setEditing({ ...editing, username: e.target.value })}
                    className="inp"
                  />
                </div>
                <div>
                  <Lbl>Password</Lbl>
                  <input
                    value={editing.password ?? ""}
                    onChange={(e) => setEditing({ ...editing, password: e.target.value })}
                    className="inp"
                  />
                </div>
                <div className="col-span-2">
                  <Lbl>URL do Servidor Principal</Lbl>
                  <input
                    value={editing.server_primary ?? ""}
                    onChange={(e) => setEditing({ ...editing, server_primary: e.target.value })}
                    className="inp"
                    placeholder="http://servidor1.com:8080"
                  />
                </div>
                <div className="col-span-2">
                  <Lbl>URL do Servidor Secundário</Lbl>
                  <input
                    value={editing.server_secondary ?? ""}
                    onChange={(e) =>
                      setEditing({ ...editing, server_secondary: e.target.value })
                    }
                    className="inp"
                    placeholder="http://servidor2.com:8080"
                  />
                </div>
                <div>
                  <Lbl>WhatsApp suporte</Lbl>
                  <input
                    value={editing.support_whatsapp ?? ""}
                    onChange={(e) =>
                      setEditing({ ...editing, support_whatsapp: e.target.value })
                    }
                    className="inp"
                  />
                </div>
                <div>
                  <Lbl>Telegram suporte</Lbl>
                  <input
                    value={editing.support_telegram ?? ""}
                    onChange={(e) =>
                      setEditing({ ...editing, support_telegram: e.target.value })
                    }
                    className="inp"
                    placeholder="@seucanal"
                  />
                </div>
              </div>
              <button
                onClick={save}
                disabled={saving}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-cyan bg-cyan/10 px-4 py-3 font-display text-sm font-bold uppercase tracking-wide text-cyan hover:bg-cyan/20 disabled:opacity-50"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Salvar e gerar link
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Lbl({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block font-display text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
      {children}
    </label>
  );
}
