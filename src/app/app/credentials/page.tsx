"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { PageShell } from "@/components/shell/page-header";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ScopePicker } from "@/components/ui/scope-picker";
import { cn } from "@/lib/utils";

const CAT: Record<string, string> = { account: "Hesap", service: "Servis", card: "Kart/Banka", other: "Diğer" };

export default function CredentialsPage() {
  const credentials = useStore((s) => s.credentials);
  const projects = useStore((s) => s.projects);
  const addCredential = useStore((s) => s.addCredential);
  const updateCredential = useStore((s) => s.updateCredential);
  const deleteCredential = useStore((s) => s.deleteCredential);
  const addCredField = useStore((s) => s.addCredField);
  const updateCredField = useStore((s) => s.updateCredField);
  const deleteCredField = useStore((s) => s.deleteCredField);

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

  const create = () => {
    addCredential({ label: "Yeni kayıt" });
  };

  return (
    <PageShell crumbs={[{ label: "Şifreler" }]}>
      <div className="notion-width mx-auto px-12 pb-20 pt-4 animate-rise">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-[34px] font-bold leading-tight tracking-[-0.02em] text-[var(--text)]">Şifreler</h1>
            <p className="mt-1.5 text-[15px] text-[var(--text-faint)]">{credentials.length} kayıt · bir kayıt birden çok alan tutabilir (şifre, 2FA, token). Yerelde saklanır.</p>
          </div>
          <Button variant="primary" onClick={create}><Icon name="Plus" size={16} /> Yeni Kayıt</Button>
        </div>

        {credentials.length === 0 ? (
          <EmptyState icon={<Icon name="Lock" size={40} />} title="Henüz kayıt yok" desc="İlk şifreni ekle (GitHub, mail…)." action={<Button variant="primary" onClick={create}>Kayıt oluştur</Button>} />
        ) : (
          <div className="space-y-3">
            {credentials.map((c) => {
              const open = expanded.has(c.id);
              const proj = projects.find((p) => p.id === c.projectId);
              return (
                <div key={c.id} className="flex overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-raised)]">
                  {/* kapsam renk şeridi */}
                  <div className="w-1 shrink-0" style={{ background: proj?.color ?? "var(--color-tag-gray)" }} />
                  <div className="min-w-0 flex-1">
                  {/* başlık */}
                  <div className="flex items-center gap-2.5 px-3 py-2.5">
                    <button onClick={() => toggleExpand(c.id)} className="text-[var(--text-faint)] hover:text-[var(--text)]">
                      <Icon name="CaretRight" size={13} className={cn("transition-transform", open && "rotate-90")} />
                    </button>
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--bg-hover)]">
                      <Icon name={c.icon} size={15} className="text-[var(--text-dim)]" />
                    </div>
                    <input
                      value={c.label}
                      onChange={(ev) => updateCredential(c.id, { label: ev.target.value })}
                      className="w-40 shrink-0 bg-transparent text-[14px] font-medium text-[var(--text)] outline-none"
                    />
                    {c.username && (
                      <button onClick={() => copy(c.id + "u", c.username!)} className="flex min-w-0 items-center gap-1.5 truncate rounded-md px-2 py-1 font-mono text-[13px] text-[var(--text-dim)] hover:bg-[var(--bg-hover)]" title="Kullanıcıyı kopyala">
                        <Icon name={copied === c.id + "u" ? "Check" : "User"} size={13} style={copied === c.id + "u" ? { color: "var(--color-health-good)" } : undefined} />
                        {c.username}
                      </button>
                    )}
                    <span className="flex-1" />
                    <span className="shrink-0 text-[12px] text-[var(--text-faint)]">{(c.fields ?? []).length} alan</span>
                    <ScopePicker projectId={c.projectId} onChange={(pid) => updateCredential(c.id, { projectId: pid })} />
                    <select value={c.category} onChange={(ev) => updateCredential(c.id, { category: ev.target.value as any })} className="shrink-0 rounded-md bg-transparent text-[12px] text-[var(--text-dim)] outline-none">
                      {Object.entries(CAT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <button onClick={() => deleteCredential(c.id)} className="rounded-md p-1.5 text-[var(--text-faint)] hover:bg-[var(--bg-hover)] hover:text-[var(--color-health-risk)]" title="Sil">
                      <Icon name="Trash" size={14} />
                    </button>
                  </div>

                  {open && (
                    <div className="border-t border-[var(--border)] px-3 py-2.5">
                      {/* üst bilgi: kullanıcı + url */}
                      <div className="mb-2.5 flex gap-2">
                        <input
                          value={c.username ?? ""}
                          onChange={(ev) => updateCredential(c.id, { username: ev.target.value })}
                          placeholder="Kullanıcı / e-posta"
                          className="flex-1 rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-[13px] text-[var(--text)] outline-none"
                        />
                        <input
                          value={c.url ?? ""}
                          onChange={(ev) => updateCredential(c.id, { url: ev.target.value })}
                          placeholder="URL (opsiyonel)"
                          className="flex-1 rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-[13px] text-[var(--text)] outline-none"
                        />
                      </div>

                      {/* gizli alanlar */}
                      <div className="space-y-1.5">
                        {(c.fields ?? []).map((f) => {
                          const show = revealed.has(f.id);
                          return (
                            <div key={f.id} className="group flex items-center gap-2">
                              <input
                                value={f.label}
                                onChange={(ev) => updateCredField(c.id, f.id, { label: ev.target.value })}
                                placeholder="Etiket"
                                className="w-40 shrink-0 rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-[13px] font-medium text-[var(--text)] outline-none"
                              />
                              <input
                                value={f.value}
                                type={show || !f.secret ? "text" : "password"}
                                onChange={(ev) => updateCredField(c.id, f.id, { value: ev.target.value })}
                                placeholder="değer"
                                className="flex-1 rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-1 font-mono text-[13px] text-[var(--text-dim)] outline-none"
                              />
                              <button onClick={() => updateCredField(c.id, f.id, { secret: !f.secret })} className={cn("rounded-md p-1.5 hover:bg-[var(--bg-hover)]", f.secret ? "text-[var(--text-faint)]" : "text-[var(--color-accent)]")} title={f.secret ? "Gizli alan" : "Açık alan"}>
                                <Icon name={f.secret ? "LockSimple" : "LockSimpleOpen"} size={14} />
                              </button>
                              {f.secret && (
                                <button onClick={() => toggleReveal(f.id)} className="rounded-md p-1.5 text-[var(--text-faint)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]">
                                  <Icon name={show ? "EyeSlash" : "Eye"} size={14} />
                                </button>
                              )}
                              <button onClick={() => copy(f.id, f.value)} className="rounded-md p-1.5 text-[var(--text-faint)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]" title="Kopyala">
                                <Icon name={copied === f.id ? "Check" : "Copy"} size={14} style={copied === f.id ? { color: "var(--color-health-good)" } : undefined} />
                              </button>
                              <button onClick={() => deleteCredField(c.id, f.id)} className="rounded-md p-1.5 text-[var(--text-faint)] opacity-0 transition-opacity hover:text-[var(--color-health-risk)] group-hover:opacity-100" title="Alanı sil">
                                <Icon name="X" size={13} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      <button onClick={() => addCredField(c.id)} className="mt-2 flex items-center gap-1.5 text-[13px] text-[var(--text-faint)] hover:text-[var(--color-accent)]">
                        <Icon name="Plus" size={14} /> Alan ekle (şifre, 2FA, token…)
                      </button>

                      {/* not */}
                      <div className="mt-3">
                        <textarea
                          value={c.note ?? ""}
                          onChange={(ev) => updateCredential(c.id, { note: ev.target.value })}
                          placeholder="Not ekle… (örn. kurtarma kodu nerede, hangi telefon)"
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
