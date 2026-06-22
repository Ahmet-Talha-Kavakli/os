"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { PageShell } from "@/components/shell/page-header";
import { Badge, Divider, EmptyState } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

const CAT: Record<string, string> = { account: "Hesap", service: "Servis", card: "Kart/Banka", other: "Diğer" };

export default function CredentialsPage() {
  const credentials = useStore((s) => s.credentials);
  const addCredential = useStore((s) => s.addCredential);
  const updateCredential = useStore((s) => s.updateCredential);
  const deleteCredential = useStore((s) => s.deleteCredential);

  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ label: "", username: "", secret: "", url: "", category: "account" });
  const [editing, setEditing] = useState<string | null>(null);

  const toggle = (id: string) =>
    setRevealed((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const copy = (key: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
  };

  const submit = () => {
    if (!form.label.trim()) return;
    addCredential({ label: form.label.trim(), icon: "Key", username: form.username, secret: form.secret, url: form.url, category: form.category as any });
    setForm({ label: "", username: "", secret: "", url: "", category: "account" });
    setAdding(false);
  };

  return (
    <PageShell crumbs={[{ label: "Şifreler" }]}>
      <div className="notion-width mx-auto px-12 pb-20 pt-4 animate-rise">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-[34px] font-bold leading-tight tracking-[-0.02em] text-[var(--text)]">Şifreler</h1>
            <p className="mt-1.5 text-[15px] text-[var(--text-faint)]">{credentials.length} kayıt · GitHub, mail, servisler — tıkla, kopyala. Yerelde saklanır.</p>
          </div>
          <Button variant="primary" onClick={() => setAdding((v) => !v)}><Icon name="Plus" size={16} /> Yeni Kayıt</Button>
        </div>

        {adding && (
          <div className="mb-6 grid grid-cols-2 gap-2 rounded-lg bg-[var(--bg-hover)] p-3">
            <input autoFocus value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Servis (GitHub)" className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)] px-2.5 py-1.5 text-[13px] text-[var(--text)] outline-none" />
            <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="URL (opsiyonel)" className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)] px-2.5 py-1.5 text-[13px] text-[var(--text)] outline-none" />
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Kullanıcı / e-posta" className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)] px-2.5 py-1.5 text-[13px] text-[var(--text)] outline-none" />
            <input value={form.secret} onChange={(e) => setForm({ ...form, secret: e.target.value })} placeholder="Şifre / token" className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)] px-2.5 py-1.5 text-[13px] text-[var(--text)] outline-none" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="col-span-2 rounded-md border border-[var(--border)] bg-[var(--bg-raised)] px-2.5 py-1.5 text-[13px] text-[var(--text)] outline-none">
              {Object.entries(CAT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <div className="col-span-2 flex justify-end"><Button variant="primary" size="sm" onClick={submit}>Ekle</Button></div>
          </div>
        )}

        {credentials.length === 0 ? (
          <EmptyState icon={<Icon name="Lock" size={40} />} title="Henüz kayıt yok" desc="İlk şifreni ekle." />
        ) : (
          <div>
            {credentials.map((c, i) => {
              const show = revealed.has(c.id);
              return (
                <div key={c.id}>
                  {i > 0 && <Divider />}
                  {editing === c.id ? (
                    <div className="flex flex-wrap items-center gap-2 py-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-hover)]">
                        <Icon name={c.icon} size={16} className="text-[var(--text-dim)]" />
                      </div>
                      <input autoFocus value={c.label} onChange={(ev) => updateCredential(c.id, { label: ev.target.value })} placeholder="Etiket" className="w-40 rounded-md border border-[var(--border)] bg-[var(--bg-raised)] px-2 py-1 text-[13px] text-[var(--text)] outline-none" />
                      <input value={c.username ?? ""} onChange={(ev) => updateCredential(c.id, { username: ev.target.value })} placeholder="Kullanıcı" className="flex-1 rounded-md border border-[var(--border)] bg-[var(--bg-raised)] px-2 py-1 font-mono text-[13px] text-[var(--text)] outline-none" />
                      <input value={c.secret} onChange={(ev) => updateCredential(c.id, { secret: ev.target.value })} placeholder="Şifre / token" className="w-48 rounded-md border border-[var(--border)] bg-[var(--bg-raised)] px-2 py-1 font-mono text-[13px] text-[var(--text)] outline-none" />
                      <select value={c.category} onChange={(ev) => updateCredential(c.id, { category: ev.target.value as any })} className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)] px-2 py-1 text-[13px] text-[var(--text)] outline-none">
                        {Object.entries(CAT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <Button variant="subtle" size="sm" onClick={() => setEditing(null)}>Bitti</Button>
                    </div>
                  ) : (
                    <div className="group flex items-center gap-3 py-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-hover)]">
                        <Icon name={c.icon} size={16} className="text-[var(--text-dim)]" />
                      </div>
                      <div className="w-40 shrink-0">
                        <div className="text-[14px] font-medium text-[var(--text)]">{c.label}</div>
                        {c.url && <div className="text-[12px] text-[var(--text-faint)]">{c.url}</div>}
                      </div>
                      {/* kullanıcı */}
                      {c.username && (
                        <button onClick={() => copy(c.id + "u", c.username!)} className="flex flex-1 items-center gap-1.5 rounded-md px-2 py-1 text-left text-[13px] text-[var(--text-dim)] transition-colors hover:bg-[var(--bg-hover)]" title="Kullanıcıyı kopyala">
                          <Icon name={copied === c.id + "u" ? "Check" : "User"} size={13} style={copied === c.id + "u" ? { color: "var(--color-health-good)" } : undefined} />
                          <span className="truncate font-mono">{c.username}</span>
                        </button>
                      )}
                      {/* şifre */}
                      <button onClick={() => copy(c.id + "s", c.secret)} className="flex w-48 items-center gap-1.5 rounded-md px-2 py-1 text-left font-mono text-[13px] text-[var(--text-dim)] transition-colors hover:bg-[var(--bg-hover)]" title="Şifreyi kopyala">
                        <Icon name={copied === c.id + "s" ? "Check" : "Copy"} size={13} style={copied === c.id + "s" ? { color: "var(--color-health-good)" } : undefined} />
                        <span className="truncate">{show ? c.secret : "••••••••••"}</span>
                      </button>
                      <Badge>{CAT[c.category]}</Badge>
                      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <button onClick={() => toggle(c.id)} className="rounded-md p-1.5 text-[var(--text-faint)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]" title={show ? "Gizle" : "Göster"}>
                          <Icon name={show ? "EyeSlash" : "Eye"} size={14} />
                        </button>
                        <button onClick={() => setEditing(c.id)} className="rounded-md p-1.5 text-[var(--text-faint)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]" title="Düzenle">
                          <Icon name="PencilSimple" size={14} />
                        </button>
                        <button onClick={() => deleteCredential(c.id)} className="rounded-md p-1.5 text-[var(--text-faint)] hover:bg-[var(--bg-hover)] hover:text-[var(--color-health-risk)]" title="Sil">
                          <Icon name="Trash" size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}
