"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { PageShell } from "@/components/shell/page-header";
import { Divider, EmptyState } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import type { Idea } from "@/lib/types";
import { cn, relativeDay } from "@/lib/utils";

const STATUS: { id: Idea["status"]; label: string; color: string }[] = [
  { id: "spark", label: "Kıvılcım", color: "var(--color-tag-yellow)" },
  { id: "exploring", label: "Keşif", color: "var(--color-tag-blue)" },
  { id: "validated", label: "Doğrulandı", color: "var(--color-tag-green)" },
  { id: "building", label: "Yapımda", color: "var(--color-tag-purple)" },
  { id: "parked", label: "Beklemede", color: "var(--color-tag-gray)" },
];

function Dots({ n, label, onSet }: { n: number; label: string; onSet: (v: 1 | 2 | 3) => void }) {
  return (
    <span className="flex items-center gap-1 text-[12px] text-[var(--text-faint)]">
      {label}
      <span className="flex gap-0.5">
        {[1, 2, 3].map((i) => (
          <button
            key={i}
            onClick={() => onSet(i as 1 | 2 | 3)}
            title={`${label}: ${i}`}
            className={cn("h-1.5 w-1.5 rounded-full transition-colors hover:bg-[var(--text-dim)]", i <= n ? "bg-[var(--text-dim)]" : "bg-[var(--bg-active)]")}
          />
        ))}
      </span>
    </span>
  );
}

export default function IdeasPage() {
  const ideas = useStore((s) => s.ideas);
  const addIdea = useStore((s) => s.addIdea);
  const updateIdea = useStore((s) => s.updateIdea);
  const deleteIdea = useStore((s) => s.deleteIdea);

  const [quick, setQuick] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const add = () => {
    if (!quick.trim()) return;
    const idea = addIdea({ title: quick.trim() });
    setQuick("");
    setExpanded(idea.id);
  };

  return (
    <PageShell crumbs={[{ label: "Fikirler" }]}>
      <div className="notion-width mx-auto px-12 pb-20 pt-4 animate-rise">
        <div className="mb-8">
          <h1 className="text-[34px] font-bold leading-tight tracking-[-0.02em] text-[var(--text)]">Fikirler</h1>
          <p className="mt-1.5 text-[15px] text-[var(--text-faint)]">{ideas.length} fikir · aklına geleni hemen düşür, sonra olgunlaştır.</p>
        </div>

        {/* hızlı ekleme */}
        <div className="mb-8 flex items-center gap-2 border-b border-[var(--border)] pb-2">
          <Icon name="Lightbulb" size={18} className="text-[var(--text-faint)]" />
          <input
            value={quick}
            onChange={(e) => setQuick(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Yeni bir fikir yaz ve Enter'a bas…"
            className="flex-1 bg-transparent text-[15px] text-[var(--text)] outline-none placeholder:text-[var(--text-faint)]"
          />
          {quick && <Button variant="primary" size="sm" onClick={add}>Ekle</Button>}
        </div>

        {ideas.length === 0 ? (
          <EmptyState icon={<Icon name="Lightbulb" size={40} />} title="Henüz fikir yok" desc="İlk fikrini yukarıya yaz." />
        ) : (
          <div className="space-y-10">
            {STATUS.map((st) => {
              const group = ideas.filter((i) => i.status === st.id);
              if (group.length === 0) return null;
              return (
                <section key={st.id}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: st.color }} />
                    <h2 className="text-[13px] font-semibold text-[var(--text-dim)]">{st.label}</h2>
                    <span className="text-[12px] text-[var(--text-faint)]">{group.length}</span>
                  </div>
                  <div>
                    {group.map((idea, i) => (
                      <div key={idea.id}>
                        {i > 0 && <Divider />}
                        <div className="group py-3">
                          <div className="flex items-start gap-3">
                            <button onClick={() => setExpanded((e) => (e === idea.id ? null : idea.id))} className="mt-0.5 text-[var(--text-faint)] hover:text-[var(--text)]">
                              <Icon name="CaretRight" size={13} className={cn("transition-transform", expanded === idea.id && "rotate-90")} />
                            </button>
                            <div className="min-w-0 flex-1">
                              <input
                                value={idea.title}
                                onChange={(e) => updateIdea(idea.id, { title: e.target.value })}
                                className="w-full bg-transparent text-[15px] font-medium text-[var(--text)] outline-none"
                              />
                              {expanded === idea.id && (
                                <textarea
                                  value={idea.body}
                                  onChange={(e) => updateIdea(idea.id, { body: e.target.value })}
                                  placeholder="Detay ekle…"
                                  rows={2}
                                  className="mt-1.5 w-full resize-none bg-transparent text-[14px] text-[var(--text-dim)] outline-none placeholder:text-[var(--text-faint)]"
                                />
                              )}
                            </div>
                            <Dots n={idea.impact} label="Etki" onSet={(v) => updateIdea(idea.id, { impact: v })} />
                            <Dots n={idea.effort} label="Efor" onSet={(v) => updateIdea(idea.id, { effort: v })} />
                            {/* durum dropdown */}
                            <DropdownMenu.Root>
                              <DropdownMenu.Trigger asChild>
                                <button className="rounded-md px-1.5 py-1 text-[var(--text-faint)] outline-none hover:bg-[var(--bg-hover)] hover:text-[var(--text)]">
                                  <Icon name="DotsThree" size={16} />
                                </button>
                              </DropdownMenu.Trigger>
                              <DropdownMenu.Portal>
                                <DropdownMenu.Content align="end" sideOffset={4} className="z-50 min-w-40 rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] p-1 shadow-[var(--shadow-pop)]">
                                  <div className="px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-[var(--text-faint)]">Durum</div>
                                  {STATUS.map((s) => (
                                    <DropdownMenu.Item key={s.id} onSelect={() => updateIdea(idea.id, { status: s.id })} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-[14px] text-[var(--text)] outline-none data-[highlighted]:bg-[var(--bg-hover)]">
                                      <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                                      <span className="flex-1">{s.label}</span>
                                      {idea.status === s.id && <Icon name="Check" size={13} style={{ color: "var(--color-accent)" }} />}
                                    </DropdownMenu.Item>
                                  ))}
                                  <div className="my-1 h-px bg-[var(--border)]" />
                                  <DropdownMenu.Item onSelect={() => deleteIdea(idea.id)} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-[14px] text-[var(--color-health-risk)] outline-none data-[highlighted]:bg-[var(--bg-hover)]">
                                    <Icon name="Trash" size={14} /> Sil
                                  </DropdownMenu.Item>
                                </DropdownMenu.Content>
                              </DropdownMenu.Portal>
                            </DropdownMenu.Root>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}
