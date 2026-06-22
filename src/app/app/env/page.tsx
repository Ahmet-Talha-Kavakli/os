"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { PageShell } from "@/components/shell/page-header";
import { Badge, Divider, EmptyState } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ScopePicker } from "@/components/ui/scope-picker";
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
  const addEnvField = useStore((s) => s.addEnvField);
  const updateEnvField = useStore((s) => s.updateEnvField);
  const deleteEnvField = useStore((s) => s.deleteEnvField);

  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleReveal = (id: string) => setRevealed((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleExpand = (id: string) => setExpanded((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const copy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 1500);
  };

  const copyGroupEnv = (envId: string) => {
    const g = envKeys.find((e) => e.id === envId);
    if (!g) return;
    const text = (g.fields ?? []).map((f) => `${f.key}=${f.value}`).join("\n");
    copy("g" + envId, text);
  };

  const copyAll = () => {
    const text = envKeys.flatMap((e) => (e.fields ?? []).map((f) => `${f.key}=${f.value}`)).join("\n");
    copy("ALL", text);
  };

  const create = () => {
    addEnvKey({ name: "Yeni grup" });
  };

  return (
    <PageShell crumbs={[{ label: "Env Keyleri" }]}>
      <div className="notion-width mx-auto px-12 pb-20 pt-4 animate-rise">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-[34px] font-bold leading-tight tracking-[-0.02em] text-[var(--text)]">Env Keyleri</h1>
            <p className="mt-1.5 text-[15px] text-[var(--text-faint)]">{envKeys.length} grup · bir grup birden çok anahtar tutabilir (Supabase → URL, anon, service). Yerelde saklanır.</p>
          </div>
          <div className="flex gap-2">
            {envKeys.length > 0 && (
              <Button variant="glass" onClick={copyAll}>
                <Icon name={copied === "ALL" ? "Check" : "Copy"} size={15} /> {copied === "ALL" ? "Kopyalandı" : ".env kopyala"}
              </Button>
            )}
            <Button variant="primary" onClick={create}><Icon name="Plus" size={16} /> Yeni Grup</Button>
          </div>
        </div>

        {envKeys.length === 0 ? (
          <EmptyState icon={<Icon name="Key" size={40} />} title="Henüz key yok" desc="İlk anahtar grubunu oluştur (örn. Supabase)." action={<Button variant="primary" onClick={create}>Grup oluştur</Button>} />
        ) : (
          <div className="space-y-3">
            {envKeys.map((e) => {
              const proj = projects.find((p) => p.id === e.projectId);
              const env = ENV_LABEL[e.env];
              const open = expanded.has(e.id);
              return (
                <div key={e.id} className="flex overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-raised)]">
                  {/* kapsam renk şeridi */}
                  <div className="w-1 shrink-0" style={{ background: proj?.color ?? "var(--color-tag-gray)" }} />
                  <div className="min-w-0 flex-1">
                  {/* grup başlığı */}
                  <div className="flex items-center gap-2.5 px-3 py-2.5">
                    <button onClick={() => toggleExpand(e.id)} className="text-[var(--text-faint)] hover:text-[var(--text)]">
                      <Icon name="CaretRight" size={13} className={cn("transition-transform", open && "rotate-90")} />
                    </button>
                    <Icon name="Key" size={15} className="text-[var(--text-faint)]" />
                    <input
                      value={e.name}
                      onChange={(ev) => updateEnvKey(e.id, { name: ev.target.value })}
                      className="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-[var(--text)] outline-none"
                    />
                    <span className="shrink-0 text-[12px] text-[var(--text-faint)]">{(e.fields ?? []).length} anahtar</span>
                    <ScopePicker projectId={e.projectId} onChange={(pid) => updateEnvKey(e.id, { projectId: pid })} />
                    <select value={e.env} onChange={(ev) => updateEnvKey(e.id, { env: ev.target.value as any })} className="shrink-0 rounded-md bg-transparent text-[12px] text-[var(--text-dim)] outline-none">
                      <option value="development">Geliştirme</option>
                      <option value="production">Production</option>
                      <option value="shared">Ortak</option>
                    </select>
                    <button onClick={() => copyGroupEnv(e.id)} className="rounded-md p-1.5 text-[var(--text-faint)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]" title="Grubu .env olarak kopyala">
                      <Icon name={copied === "g" + e.id ? "Check" : "Copy"} size={14} style={copied === "g" + e.id ? { color: "var(--color-health-good)" } : undefined} />
                    </button>
                    <button onClick={() => deleteEnvKey(e.id)} className="rounded-md p-1.5 text-[var(--text-faint)] hover:bg-[var(--bg-hover)] hover:text-[var(--color-health-risk)]" title="Sil">
                      <Icon name="Trash" size={14} />
                    </button>
                  </div>

                  {/* alanlar */}
                  {open && (
                    <div className="border-t border-[var(--border)] px-3 py-2.5">
                      <div className="space-y-1.5">
                        {(e.fields ?? []).map((f) => {
                          const show = revealed.has(f.id);
                          return (
                            <div key={f.id} className="group flex items-center gap-2">
                              <input
                                value={f.key}
                                onChange={(ev) => updateEnvField(e.id, f.id, { key: ev.target.value })}
                                placeholder="KEY_ADI"
                                className="w-56 shrink-0 rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-1 font-mono text-[13px] font-medium text-[var(--text)] outline-none"
                              />
                              <input
                                value={f.value}
                                type={show ? "text" : "password"}
                                onChange={(ev) => updateEnvField(e.id, f.id, { value: ev.target.value })}
                                placeholder="değer"
                                className="flex-1 rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-1 font-mono text-[13px] text-[var(--text-dim)] outline-none"
                              />
                              <button onClick={() => toggleReveal(f.id)} className="rounded-md p-1.5 text-[var(--text-faint)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]" title={show ? "Gizle" : "Göster"}>
                                <Icon name={show ? "EyeSlash" : "Eye"} size={14} />
                              </button>
                              <button onClick={() => copy(f.id, f.value)} className="rounded-md p-1.5 text-[var(--text-faint)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]" title="Değeri kopyala">
                                <Icon name={copied === f.id ? "Check" : "Copy"} size={14} style={copied === f.id ? { color: "var(--color-health-good)" } : undefined} />
                              </button>
                              <button onClick={() => deleteEnvField(e.id, f.id)} className="rounded-md p-1.5 text-[var(--text-faint)] opacity-0 transition-opacity hover:text-[var(--color-health-risk)] group-hover:opacity-100" title="Alanı sil">
                                <Icon name="X" size={13} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      <button onClick={() => addEnvField(e.id)} className="mt-2 flex items-center gap-1.5 text-[13px] text-[var(--text-faint)] hover:text-[var(--color-accent)]">
                        <Icon name="Plus" size={14} /> Anahtar ekle
                      </button>

                      {/* not */}
                      <div className="mt-3">
                        <textarea
                          value={e.note ?? ""}
                          onChange={(ev) => updateEnvKey(e.id, { note: ev.target.value })}
                          placeholder="Not ekle… (örn. nereden alındı, hangi hesap)"
                          rows={2}
                          className="w-full resize-none rounded-md bg-[var(--bg-hover)] px-2.5 py-2 text-[13px] text-[var(--text-dim)] outline-none placeholder:text-[var(--text-faint)]"
                        />
                      </div>
                    </div>
                  )}
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
