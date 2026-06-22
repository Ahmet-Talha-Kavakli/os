"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { PageShell } from "@/components/shell/page-header";
import { Badge, Divider, EmptyState } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const ENV_LABEL: Record<string, { label: string; color: string }> = {
  development: { label: "Geliştirme", color: "var(--color-tag-blue)" },
  production: { label: "Production", color: "var(--color-tag-green)" },
  shared: { label: "Ortak", color: "var(--color-tag-purple)" },
};

export default function EnvPage() {
  const envKeys = useStore((s) => s.envKeys);
  const projects = useStore((s) => s.projects);
  const addEnvKey = useStore((s) => s.addEnvKey);
  const updateEnvKey = useStore((s) => s.updateEnvKey);
  const deleteEnvKey = useStore((s) => s.deleteEnvKey);

  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", value: "", env: "development" });
  const [editing, setEditing] = useState<string | null>(null);

  const toggle = (id: string) =>
    setRevealed((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const copy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 1500);
  };

  const copyAllEnv = () => {
    const text = envKeys.map((e) => `${e.name}=${e.value}`).join("\n");
    navigator.clipboard?.writeText(text);
    setCopied("ALL");
    setTimeout(() => setCopied((c) => (c === "ALL" ? null : c)), 1500);
  };

  const submit = () => {
    if (!form.name.trim()) return;
    addEnvKey({ name: form.name.trim(), value: form.value, env: form.env as any });
    setForm({ name: "", value: "", env: "development" });
    setAdding(false);
  };

  return (
    <PageShell crumbs={[{ label: "Env Keyleri" }]}>
      <div className="notion-width mx-auto px-12 pb-20 pt-4 animate-rise">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-[34px] font-bold leading-tight tracking-[-0.02em] text-[var(--text)]">Env Keyleri</h1>
            <p className="mt-1.5 text-[15px] text-[var(--text-faint)]">{envKeys.length} anahtar · API key'lerin, tek tıkla kopyala. Yerelde saklanır.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="glass" onClick={copyAllEnv}>
              <Icon name={copied === "ALL" ? "Check" : "Copy"} size={15} /> {copied === "ALL" ? "Kopyalandı" : ".env kopyala"}
            </Button>
            <Button variant="primary" onClick={() => setAdding((v) => !v)}><Icon name="Plus" size={16} /> Yeni Key</Button>
          </div>
        </div>

        {adding && (
          <div className="mb-6 flex flex-wrap items-center gap-2 rounded-lg bg-[var(--bg-hover)] p-3">
            <input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="KEY_ADI" className="flex-1 rounded-md border border-[var(--border)] bg-[var(--bg-raised)] px-2.5 py-1.5 font-mono text-[13px] text-[var(--text)] outline-none" />
            <input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="değer" className="flex-[2] rounded-md border border-[var(--border)] bg-[var(--bg-raised)] px-2.5 py-1.5 font-mono text-[13px] text-[var(--text)] outline-none" />
            <select value={form.env} onChange={(e) => setForm({ ...form, env: e.target.value })} className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)] px-2.5 py-1.5 text-[13px] text-[var(--text)] outline-none">
              <option value="development">Geliştirme</option>
              <option value="production">Production</option>
              <option value="shared">Ortak</option>
            </select>
            <Button variant="primary" size="sm" onClick={submit}>Ekle</Button>
          </div>
        )}

        {envKeys.length === 0 ? (
          <EmptyState icon={<Icon name="Key" size={40} />} title="Henüz key yok" desc="İlk API key'ini ekle." />
        ) : (
          <div>
            {envKeys.map((e, i) => {
              const proj = projects.find((p) => p.id === e.projectId);
              const env = ENV_LABEL[e.env];
              const show = revealed.has(e.id);
              return (
                <div key={e.id}>
                  {i > 0 && <Divider />}
                  <div className="group flex items-center gap-3 py-2.5">
                    <Icon name="Key" size={15} className="shrink-0 text-[var(--text-faint)]" />
                    <span className="w-56 shrink-0 truncate font-mono text-[13px] font-medium text-[var(--text)]">{e.name}</span>
                    {editing === e.id ? (
                      <input
                        autoFocus value={e.value}
                        onChange={(ev) => updateEnvKey(e.id, { value: ev.target.value })}
                        onBlur={() => setEditing(null)}
                        onKeyDown={(ev) => ev.key === "Enter" && setEditing(null)}
                        className="flex-1 rounded-md border border-[var(--border)] bg-[var(--bg-raised)] px-2 py-1 font-mono text-[13px] text-[var(--text)] outline-none"
                      />
                    ) : show ? (
                      <button onClick={() => setEditing(e.id)} className="flex-1 truncate text-left font-mono text-[13px] text-[var(--text-dim)] hover:text-[var(--text)]" title="Düzenle">{e.value || <span className="text-[var(--text-faint)]">boş</span>}</button>
                    ) : (
                      <span className="flex-1 truncate font-mono text-[13px] text-[var(--text-dim)]">{"•".repeat(Math.min(28, e.value.length || 12))}</span>
                    )}
                    {proj && <span className="flex shrink-0 items-center gap-1 text-[12px] text-[var(--text-faint)]"><Icon name={proj.icon} size={12} style={{ color: proj.color }} />{proj.name}</span>}
                    {env && <Badge color={env.color}>{env.label}</Badge>}
                    <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button onClick={() => toggle(e.id)} className="rounded-md p-1.5 text-[var(--text-faint)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]" title={show ? "Gizle" : "Göster"}>
                        <Icon name={show ? "EyeSlash" : "Eye"} size={14} />
                      </button>
                      <button onClick={() => { if (!show) toggle(e.id); setEditing(e.id); }} className="rounded-md p-1.5 text-[var(--text-faint)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]" title="Düzenle">
                        <Icon name="PencilSimple" size={14} />
                      </button>
                      <button onClick={() => copy(e.id, e.value)} className="rounded-md p-1.5 text-[var(--text-faint)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]" title="Kopyala">
                        <Icon name={copied === e.id ? "Check" : "Copy"} size={14} style={copied === e.id ? { color: "var(--color-health-good)" } : undefined} />
                      </button>
                      <button onClick={() => deleteEnvKey(e.id)} className="rounded-md p-1.5 text-[var(--text-faint)] hover:bg-[var(--bg-hover)] hover:text-[var(--color-health-risk)]" title="Sil">
                        <Icon name="Trash" size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}
