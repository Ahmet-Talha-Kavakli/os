"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { PageShell } from "@/components/shell/page-header";
import { Divider, EmptyState } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn, relativeDay } from "@/lib/utils";

export default function PromptsPage() {
  const collections = useStore((s) => s.promptCollections);
  const projects = useStore((s) => s.projects);
  const addPromptCollection = useStore((s) => s.addPromptCollection);
  const updatePromptCollection = useStore((s) => s.updatePromptCollection);
  const deletePromptCollection = useStore((s) => s.deletePromptCollection);
  const addPrompt = useStore((s) => s.addPrompt);
  const updatePrompt = useStore((s) => s.updatePrompt);
  const deletePrompt = useStore((s) => s.deletePrompt);

  const [selectedId, setSelectedId] = useState<string | null>(collections[0]?.id ?? null);
  const [copied, setCopied] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);

  const selected = collections.find((c) => c.id === selectedId) ?? collections[0];

  const copy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 1500);
  };

  const newCollection = () => {
    const c = addPromptCollection({ name: "Yeni Koleksiyon" });
    setSelectedId(c.id);
  };

  return (
    <PageShell crumbs={[{ label: "Promptlar" }]}>
      <div className="mx-auto max-w-[1100px] px-12 pb-20 pt-4 animate-rise">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-[34px] font-bold leading-tight tracking-[-0.02em] text-[var(--text)]">Promptlar</h1>
            <p className="mt-1.5 text-[15px] text-[var(--text-faint)]">Tekrar kullandığın promptlar ve konuşma akışların — tek tıkla kopyala.</p>
          </div>
          <Button variant="primary" onClick={newCollection}><Icon name="Plus" size={16} /> Yeni Koleksiyon</Button>
        </div>

        {collections.length === 0 ? (
          <EmptyState icon={<Icon name="ChatText" size={40} />} title="Henüz koleksiyon yok" desc="İlk prompt koleksiyonunu oluştur." action={<Button variant="primary" onClick={newCollection}>Koleksiyon oluştur</Button>} />
        ) : (
          <div className="grid grid-cols-[240px_1fr] gap-10">
            {/* sol: koleksiyonlar */}
            <div>
              <div className="mb-2 text-[13px] font-semibold text-[var(--text-dim)]">Koleksiyonlar</div>
              <div className="space-y-px">
                {collections.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={cn(
                      "group flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors",
                      c.id === selected?.id ? "bg-[var(--bg-active)]" : "hover:bg-[var(--bg-hover)]"
                    )}
                  >
                    <Icon name={c.icon} size={16} style={{ color: c.color }} />
                    <span className="flex-1 truncate text-[14px] text-[var(--text)]">{c.name}</span>
                    <span className="text-[12px] text-[var(--text-faint)]">{c.prompts.length}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* sağ: seçili koleksiyon */}
            {selected && (
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <Icon name={selected.icon} size={22} style={{ color: selected.color }} />
                  <input
                    value={selected.name}
                    onChange={(e) => updatePromptCollection(selected.id, { name: e.target.value })}
                    className="flex-1 bg-transparent text-[24px] font-bold tracking-[-0.01em] text-[var(--text)] outline-none"
                  />
                  <button onClick={() => { deletePromptCollection(selected.id); setSelectedId(collections.find((c) => c.id !== selected.id)?.id ?? null); }} className="rounded-md p-1.5 text-[var(--text-faint)] hover:bg-[var(--bg-hover)] hover:text-[var(--color-health-risk)]">
                    <Icon name="Trash" size={16} />
                  </button>
                </div>
                <input
                  value={selected.description}
                  placeholder="Açıklama ekle…"
                  onChange={(e) => updatePromptCollection(selected.id, { description: e.target.value })}
                  className="mb-6 w-full bg-transparent text-[14px] text-[var(--text-faint)] outline-none"
                />

                <div className="space-y-3">
                  {selected.prompts.map((p) => (
                    <div key={p.id} className="rounded-lg border border-[var(--border)] bg-[var(--bg-raised)] p-3.5 transition-colors hover:border-[var(--text-faint)]">
                      <div className="mb-2 flex items-center gap-2">
                        <input
                          value={p.title}
                          onChange={(e) => updatePrompt(selected.id, p.id, { title: e.target.value })}
                          className="flex-1 bg-transparent text-[14px] font-semibold text-[var(--text)] outline-none"
                        />
                        <button onClick={() => copy(p.id, p.body)} className="flex items-center gap-1 rounded-md px-2 py-1 text-[12px] text-[var(--text-dim)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text)]">
                          <Icon name={copied === p.id ? "Check" : "Copy"} size={13} style={copied === p.id ? { color: "var(--color-health-good)" } : undefined} />
                          {copied === p.id ? "Kopyalandı" : "Kopyala"}
                        </button>
                        <button onClick={() => deletePrompt(selected.id, p.id)} className="rounded-md p-1 text-[var(--text-faint)] hover:bg-[var(--bg-hover)] hover:text-[var(--color-health-risk)]">
                          <Icon name="X" size={13} />
                        </button>
                      </div>
                      <textarea
                        value={p.body}
                        onChange={(e) => updatePrompt(selected.id, p.id, { body: e.target.value })}
                        rows={Math.min(8, Math.max(2, p.body.split("\n").length))}
                        className="w-full resize-none rounded-md bg-[var(--bg-hover)] p-2.5 font-mono text-[13px] leading-relaxed text-[var(--text-dim)] outline-none"
                      />
                    </div>
                  ))}
                </div>

                <button onClick={() => addPrompt(selected.id, { title: "Yeni prompt" })} className="mt-3 flex items-center gap-2 rounded-md px-2 py-2 text-[14px] text-[var(--text-faint)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text)]">
                  <Icon name="Plus" size={15} /> Prompt ekle
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}
