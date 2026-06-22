"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { PageShell } from "@/components/shell/page-header";
import { Stat, StatRow } from "@/components/ui/stat";
import { Badge, ProgressBar, Avatar, Divider, EmptyState } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import type { Goal, KeyResult } from "@/lib/types";
import { nanoid } from "nanoid";

const STATUS_META: Record<Goal["status"], { label: string; color: string }> = {
  on_track: { label: "Yolunda", color: "var(--color-health-good)" },
  at_risk: { label: "Riskte", color: "var(--color-health-warn)" },
  off_track: { label: "Sapma", color: "var(--color-health-risk)" },
  done: { label: "Tamam", color: "var(--color-accent)" },
};

function goalProgress(g: Goal): number {
  if (g.keyResults.length === 0) return g.status === "done" ? 100 : 0;
  const sum = g.keyResults.reduce((a, kr) => a + Math.min(1, kr.target ? kr.current / kr.target : 0), 0);
  return Math.round((sum / g.keyResults.length) * 100);
}

export default function GoalsPage() {
  const goals = useStore((s) => s.goals);
  const projects = useStore((s) => s.projects);
  const members = useStore((s) => s.members);
  const addGoalAction = useStore((s) => s.addGoal);
  const updateGoal = useStore((s) => s.updateGoal);
  const deleteGoal = useStore((s) => s.deleteGoal);

  const quarter = goals[0]?.quarter ?? "2026-Q3";
  const quarterGoals = useMemo(() => goals.filter((g) => g.quarter === quarter), [goals, quarter]);
  const overall =
    quarterGoals.length > 0
      ? Math.round(quarterGoals.reduce((a, g) => a + goalProgress(g), 0) / quarterGoals.length)
      : 0;
  const onTrack = useMemo(() => goals.filter((g) => g.status === "on_track").length, [goals]);
  const atRisk = useMemo(() => goals.filter((g) => g.status === "at_risk" || g.status === "off_track").length, [goals]);

  function addGoal() {
    addGoalAction({ quarter });
  }

  function patchKr(goalId: string, krId: string, patch: Partial<KeyResult>) {
    const g = goals.find((x) => x.id === goalId);
    if (!g) return;
    const keyResults = g.keyResults.map((kr) => (kr.id === krId ? { ...kr, ...patch } : kr));
    updateGoal(goalId, { keyResults });
  }

  function addKr(goalId: string) {
    const g = goals.find((x) => x.id === goalId);
    if (!g) return;
    updateGoal(goalId, {
      keyResults: [...g.keyResults, { id: "kr_" + nanoid(6), label: "Yeni anahtar sonuç", current: 0, target: 100, unit: "%" }],
    });
  }

  function removeKr(goalId: string, krId: string) {
    const g = goals.find((x) => x.id === goalId);
    if (!g) return;
    updateGoal(goalId, { keyResults: g.keyResults.filter((kr) => kr.id !== krId) });
  }

  function cycleStatus(g: Goal) {
    const order: Goal["status"][] = ["on_track", "at_risk", "off_track", "done"];
    const next = order[(order.indexOf(g.status) + 1) % order.length];
    updateGoal(g.id, { status: next });
  }

  return (
    <PageShell crumbs={[{ label: "Hedefler & OKR" }]}>
      <div className="notion-width mx-auto px-12 pb-20 pt-4 animate-rise">
        <div className="mb-10 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[34px] font-bold leading-tight tracking-[-0.02em] text-[var(--text)]">Hedefler & OKR</h1>
            <p className="mt-1.5 text-[15px] text-[var(--text-faint)]">
              {quarter} · {quarterGoals.length} hedef · genel ilerleme %{overall}
            </p>
          </div>
          <Button variant="primary" onClick={addGoal}>
            <Icon name="Plus" size={16} /> Yeni Hedef
          </Button>
        </div>

        <StatRow className="mb-12 grid-cols-2 md:grid-cols-4">
          <Stat label="Genel çeyrek ilerlemesi" value={overall} suffix="%" />
          <Stat label="Toplam hedef" value={goals.length} />
          <Stat label="Yolunda" value={onTrack} />
          <Stat label="Risk altında" value={atRisk} />
        </StatRow>

        {goals.length === 0 ? (
          <EmptyState icon={<Icon name="Target" size={40} />} title="Henüz hedef yok" desc="İlk çeyrek hedefini ekleyerek başla." action={<Button variant="primary" onClick={addGoal}><Icon name="Plus" size={16} /> Yeni Hedef</Button>} />
        ) : (
          <section>
            <h2 className="mb-1 text-[13px] font-semibold text-[var(--text-dim)]">{quarter} hedefleri</h2>
            <div>
              {goals.map((g, i) => {
                const owner = members.find((m) => m.id === g.ownerId);
                const linked = g.projectIds.map((id) => projects.find((p) => p.id === id)).filter(Boolean);
                const pct = goalProgress(g);
                return (
                  <div key={g.id}>
                    {i > 0 && <Divider className="my-8" />}
                    <div className="pt-8 first:pt-6">
                      <div className="mb-2 flex items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <input
                              value={g.title}
                              onChange={(e) => updateGoal(g.id, { title: e.target.value })}
                              className="min-w-0 flex-1 bg-transparent text-[17px] font-semibold text-[var(--text)] outline-none"
                            />
                            <button onClick={() => cycleStatus(g)} title="Durumu değiştir">
                              <Badge color={STATUS_META[g.status].color} dot>{STATUS_META[g.status].label}</Badge>
                            </button>
                          </div>
                          <input
                            value={g.description}
                            onChange={(e) => updateGoal(g.id, { description: e.target.value })}
                            placeholder="Açıklama ekle…"
                            className="mt-0.5 w-full bg-transparent text-[13px] text-[var(--text-faint)] outline-none placeholder:text-[var(--text-faint)]"
                          />
                        </div>
                        <span className="text-[15px] font-semibold text-[var(--text)]">%{pct}</span>
                        {owner && <Avatar name={owner.name} color={owner.avatarColor} size={26} />}
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <button className="rounded-md px-1 py-1 text-[var(--text-faint)] outline-none hover:bg-[var(--bg-hover)] hover:text-[var(--text)]">
                              <Icon name="DotsThree" size={16} />
                            </button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.Content align="end" sideOffset={4} className="z-50 min-w-40 rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] p-1 shadow-[var(--shadow-pop)]">
                              <DropdownMenu.Item onSelect={() => deleteGoal(g.id)} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-[14px] text-[var(--color-health-risk)] outline-none data-[highlighted]:bg-[var(--bg-hover)]">
                                <Icon name="Trash" size={14} /> Hedefi sil
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </div>

                      {/* key results */}
                      <div className="mt-4 space-y-3">
                        {g.keyResults.map((kr) => (
                          <KrRow
                            key={kr.id}
                            kr={kr}
                            onPatch={(patch) => patchKr(g.id, kr.id, patch)}
                            onRemove={() => removeKr(g.id, kr.id)}
                          />
                        ))}
                        <button onClick={() => addKr(g.id)} className="flex items-center gap-1.5 text-[13px] text-[var(--text-faint)] hover:text-[var(--color-accent)]">
                          <Icon name="Plus" size={13} /> KR ekle
                        </button>
                      </div>

                      {/* linked projects */}
                      {linked.length > 0 && (
                        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                          <span className="text-[12px] text-[var(--text-faint)]">Projeler</span>
                          {linked.map((p) => (
                            <span key={p!.id} className="inline-flex items-center gap-1.5 text-[13px] text-[var(--text-dim)]">
                              <Icon name={p!.icon} size={13} style={{ color: p!.color }} />
                              {p!.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </PageShell>
  );
}

function KrRow({ kr, onPatch, onRemove }: { kr: KeyResult; onPatch: (patch: Partial<KeyResult>) => void; onRemove: () => void }) {
  const pct = kr.target ? Math.min(100, Math.round((kr.current / kr.target) * 100)) : 0;
  const step = kr.target >= 1000 ? 100 : kr.target >= 100 ? 10 : 1;
  return (
    <div className="group">
      <div className="mb-1.5 flex items-center justify-between gap-2 text-[13px]">
        <input
          value={kr.label}
          onChange={(e) => onPatch({ label: e.target.value })}
          className="min-w-0 flex-1 bg-transparent text-[var(--text-dim)] outline-none"
        />
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPatch({ current: Math.max(0, kr.current - step) })}
            className="flex h-5 w-5 items-center justify-center rounded text-[var(--text-faint)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]"
          >
            <Icon name="Minus" size={11} />
          </button>
          <span className="flex items-center font-medium text-[var(--text)]">
            <input
              type="number" value={kr.current}
              onChange={(e) => onPatch({ current: Math.max(0, Number(e.target.value) || 0) })}
              className="w-12 bg-transparent text-right tabular-nums outline-none"
            />
            <span className="text-[var(--text-faint)]">/</span>
            <input
              type="number" value={kr.target}
              onChange={(e) => onPatch({ target: Math.max(0, Number(e.target.value) || 0) })}
              className="w-12 bg-transparent tabular-nums outline-none"
            />
            <input
              value={kr.unit}
              onChange={(e) => onPatch({ unit: e.target.value })}
              className="w-9 bg-transparent text-[var(--text-faint)] outline-none"
            />
          </span>
          <button
            onClick={() => onPatch({ current: kr.current + step })}
            className="flex h-5 w-5 items-center justify-center rounded text-[var(--text-faint)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]"
          >
            <Icon name="Plus" size={11} />
          </button>
          <button
            onClick={onRemove}
            className="flex h-5 w-5 items-center justify-center rounded text-[var(--text-faint)] opacity-0 transition-opacity hover:text-[var(--color-health-risk)] group-hover:opacity-100"
            title="KR'yi sil"
          >
            <Icon name="X" size={11} />
          </button>
        </div>
      </div>
      <ProgressBar value={pct} color={pct >= 100 ? "var(--color-health-good)" : "var(--color-accent)"} />
    </div>
  );
}
