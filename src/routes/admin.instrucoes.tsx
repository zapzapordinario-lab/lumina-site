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
  GraduationCap,
  Power,
} from "lucide-react";
import { toast } from "sonner";
import { db, type InstructionCredential } from "@/lib/db";

export const Route = createFileRoute("/admin/instrucoes")({
  ssr: false,
  component: InstructionsAdminPage,
});

const empty: Partial<InstructionCredential> = {
  client_name: "",
  username: "",
  password: "",
  active: true,
};

function InstructionsAdminPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<InstructionCredential> | null>(
    null,
  );
  const [saving, setSaving] = useState(false);

  const { data: rows = [], isLoading } = useQuery<InstructionCredential[]>({
    queryKey: ["instruction_credentials"],
    queryFn: async () => {
      const { data } = await db
        .from("instruction_credentials")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const baseLink = `${typeof window !== "undefined" ? window.location.origin : ""}/instrucoes`;

  const save = async () => {
    if (!editing?.username || !editing?.password)
      return toast.error("Usuário e senha são obrigatórios");
    setSaving(true);
    const payload = {
      client_name: editing.client_name || null,
      username: editing.username.trim(),
      password: editing.password,
      active: editing.active ?? true,
    };
    const { error } = editing.id
      ? await db
          .from("instruction_credentials")
          .update(payload)
          .eq("id", editing.id)
      : await db.from("instruction_credentials").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Credencial salva");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["instruction_credentials"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Remover esta credencial?")) return;
    await db.from("instruction_credentials").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["instruction_credentials"] });
  };

  const toggle = async (r: InstructionCredential) => {
    await db
      .from("instruction_credentials")
      .update({ active: !r.active })
      .eq("id", r.id);
    qc.invalidateQueries({ queryKey: ["instruction_credentials"] });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-black">Instruções</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie usuário e senha para o cliente acessar os tutoriais de
            instalação.
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...empty })}
          className="inline-flex items-center gap-2 rounded-lg border border-cyan bg-cyan/10 px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-cyan hover:bg-cyan/20 hover:glow-cyan"
        >
          <Plus className="h-4 w-4" /> Nova credencial
        </button>
      </div>

      {/* Shareable link */}
      <div className="mt-6 flex items-center gap-2 rounded-xl border border-magenta/40 bg-magenta/5 p-3">
        <Link2 className="h-4 w-4 shrink-0 text-magenta" />
        <input
          readOnly
          value={baseLink}
          className="flex-1 bg-transparent text-xs text-muted-foreground outline-none"
        />
        <button
          onClick={() => {
            navigator.clipboard.writeText(baseLink);
            toast.success("Link de instruções copiado");
          }}
          className="rounded p-1.5 text-magenta hover:bg-magenta/10"
        >
          <Copy className="h-4 w-4" />
        </button>
        <a
          href={baseLink}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded p-1.5 text-magenta hover:bg-magenta/10"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Envie este link ao cliente junto com o usuário e senha que você criar
        abaixo.
      </p>

      {isLoading ? (
        <Loader2 className="mt-10 h-6 w-6 animate-spin text-cyan" />
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {rows.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-border bg-card/40 p-5 backdrop-blur"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-cyan" />
                  <div>
                    <p className="font-display text-sm font-bold">
                      {r.client_name || "Cliente sem nome"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {r.username} · {r.password}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggle(r)}
                    title={r.active ? "Desativar" : "Ativar"}
                    className={`rounded-lg border border-border p-2 ${
                      r.active ? "text-lime" : "text-muted-foreground"
                    } hover:text-foreground`}
                  >
                    <Power className="h-4 w-4" />
                  </button>
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
              <p className="mt-3 text-[10px] font-bold uppercase tracking-wide">
                {r.active ? (
                  <span className="text-lime">● Ativo</span>
                ) : (
                  <span className="text-muted-foreground">● Inativo</span>
                )}
              </p>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhuma credencial cadastrada.
            </p>
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
                  {editing.id ? "Editar credencial" : "Nova credencial"}
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
                    onChange={(e) =>
                      setEditing({ ...editing, client_name: e.target.value })
                    }
                    className="inp"
                  />
                </div>
                <div>
                  <Lbl>Usuário</Lbl>
                  <input
                    value={editing.username ?? ""}
                    onChange={(e) =>
                      setEditing({ ...editing, username: e.target.value })
                    }
                    className="inp"
                  />
                </div>
                <div>
                  <Lbl>Senha</Lbl>
                  <input
                    value={editing.password ?? ""}
                    onChange={(e) =>
                      setEditing({ ...editing, password: e.target.value })
                    }
                    className="inp"
                  />
                </div>
              </div>
              <label className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={editing.active ?? true}
                  onChange={(e) =>
                    setEditing({ ...editing, active: e.target.checked })
                  }
                />
                Credencial ativa
              </label>
              <button
                onClick={save}
                disabled={saving}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-cyan bg-cyan/10 px-4 py-3 font-display text-sm font-bold uppercase tracking-wide text-cyan hover:bg-cyan/20 disabled:opacity-50"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Salvar
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
