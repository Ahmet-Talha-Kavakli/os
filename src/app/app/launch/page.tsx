"use client";

import { useState } from "react";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useStore, useActiveProjects } from "@/lib/store";
import { CHECKLIST_TEMPLATES } from "@/lib/seed";
import { PageShell } from "@/components/shell/page-header";
import { Badge, ProgressBar, Divider, EmptyState } from "@/components/ui/primitives";
import { Stat, StatRow } from "@/components/ui/stat";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { STAGES, HEALTH } from "@/lib/constants";
import { cn } from "@/lib/utils";

const CAT_LABEL: Record<string, string> = {
  web_saas: "Web SaaS",
  ios: "iOS",
  company: "Şirket",
  marketing: "Pazarlama",
  custom: "Özel",
};

export default function LaunchCenter() {
  const projects = useActiveProjects();
  const checklists = useStore((s) => s.checklists);
  const toggleChecklistItem = useStore((s) => s.toggleChecklistItem);
  const addChecklistFromTemplate = useStore((s) => s.addChecklistFromTemplate);

  const [openTpl, setOpenTpl] = useState<string | null>(null);

  const companyTpl = CHECKLIST_TEMPLATES.find((t) => t.id === "tpl_company")!;
  // şirket checklist'i herhangi bir projeye bağlıysa onun ilerlemesini göster
  const companyChecklist = checklists.find((c) => c.templateId === "tpl_company");
  const companySteps = companyChecklist
    ? companyChecklist.items
    : companyTpl.items.map((i) => ({ ...i, done: false }));
  const companyDone = companySteps.filter((i) => i.done).length;
  const companyPct = Math.round((companyDone / companySteps.length) * 100);

  // genel istatistik
  const totalItems = checklists.reduce((a, c) => a + c.items.length, 0);
  const totalDone = checklists.reduce((a, c) => a + c.items.filter((i) => i.done).length, 0);
  const readyPct = totalItems ? Math.round((totalDone / totalItems) * 100) : 0;
  const critRemaining = checklists.reduce((a, c) => a + c.items.filter((i) => i.critical && !i.done).length, 0);
  const projectsWithList = projects.filter((p) => checklists.some((c) => c.projectId === p.id)).length;

  const addTemplate = (projectId: string, tplId: string) => {
    const tpl = CHECKLIST_TEMPLATES.find((t) => t.id === tplId);
    if (!tpl) return;
    addChecklistFromTemplate(projectId, tpl.id, tpl.name, tpl.items.map((i) => ({ id: i.id, label: i.label, critical: i.critical })));
  };

  return (
    <PageShell crumbs={[{ label: "Lansman Merkezi" }]}>
      <div className="notion-width mx-auto px-12 pb-20 pt-4 animate-rise">
        <div className="mb-10">
          <h1 className="text-[34px] font-bold leading-tight tracking-[-0.02em] text-[var(--text)]">Lansman Merkezi</h1>
          <p className="mt-1.5 text-[15px] text-[var(--text-faint)]">
            {projectsWithList}/{projects.length} projede liste · genel hazırlık %{readyPct}
          </p>
        </div>

        <StatRow className="mb-12 grid-cols-4">
          <Stat label="Genel hazırlık" value={readyPct} suffix="%" />
          <Stat label="Tamamlanan adım" value={totalDone} />
          <Stat label="Kalan kritik" value={critRemaining} />
          <Stat label="Şirket kuruluşu" value={companyPct} suffix="%" />
        </StatRow>

        <div className="space-y-12">
          {/* ŞİRKET KURULUŞU — sakin vurgulu blok */}
          <section>
            <div className="rounded-[var(--radius-card)] bg-[color-mix(in_srgb,var(--color-accent)_5%,transparent)] px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Icon name="Buildings" size={22} className="text-[var(--color-accent)]" />
                  <div>
                    <h2 className="text-[16px] font-semibold text-[var(--text)]">{companyTpl.name}</h2>
                    <p className="mt-0.5 max-w-md text-[13px] text-[var(--text-faint)]">{companyTpl.description} — şirket + ödeme altyapısı.</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[24px] font-semibold tracking-tight text-[var(--text)]">%{companyPct}</div>
                  <div className="text-[12px] text-[var(--text-faint)]">{companyDone}/{companySteps.length} adım</div>
                </div>
              </div>

              <div className="my-4"><ProgressBar value={companyPct} color="var(--color-accent)" /></div>

              <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                {companySteps.map((i) => {
                  const interactive = !!companyChecklist;
                  return (
                    <button key={i.id}
                      disabled={!interactive}
                      onClick={() => companyChecklist && toggleChecklistItem(companyChecklist.id, i.id)}
                      className={cn(
                        "group flex items-center gap-2.5 py-2 text-left",
                        !interactive && "cursor-default"
                      )}>
                      <Icon name={i.done ? "CheckCircle" : "Circle"} size={17} weight={i.done ? "fill" : "regular"}
                        className="shrink-0 transition-colors"
                        style={{ color: i.done ? "var(--color-accent)" : "var(--text-faint)" }} />
                      <span className={cn("flex-1 text-[14px]", i.done ? "text-[var(--text-faint)] line-through" : "text-[var(--text)]")}>{i.label}</span>
                      {i.critical && !i.done && <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--color-health-risk)" }} title="Kritik" />}
                    </button>
                  );
                })}
              </div>

              {!companyChecklist && (
                <div className="mt-4">
                  <p className="mb-2 text-[13px] text-[var(--text-faint)]">Bu listeyi takip etmeye başlamak için bir projeye ekle:</p>
                  <AddToProjectMenu projects={projects} onPick={(pid) => addTemplate(pid, "tpl_company")} label="Şirket listesini ekle" />
                </div>
              )}
            </div>
          </section>

          {/* ŞABLON IZGARASI — kutusuz açık tile'lar */}
          <section>
            <h2 className="mb-3 text-[13px] font-semibold text-[var(--text-dim)]">Hazır şablonlar</h2>
            <div className="grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2">
              {CHECKLIST_TEMPLATES.map((tpl, idx) => {
                const open = openTpl === tpl.id;
                return (
                  <div key={tpl.id}>
                    {idx > 1 && <Divider className="sm:hidden" />}
                    <button onClick={() => setOpenTpl(open ? null : tpl.id)} className="group flex w-full items-start gap-3 rounded-lg px-2 py-3 text-left transition-colors hover:bg-[var(--bg-hover)]">
                      <Icon name={tpl.icon} size={18} className="mt-0.5 shrink-0 text-[var(--color-accent)]" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-medium text-[var(--text)]">{tpl.name}</span>
                          <Badge>{CAT_LABEL[tpl.category]}</Badge>
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-[13px] text-[var(--text-faint)]">{tpl.description}</p>
                      </div>
                      <span className="flex shrink-0 items-center gap-1 text-[12px] text-[var(--text-faint)]">
                        {tpl.items.length} adım
                        <Icon name={open ? "CaretUp" : "CaretDown"} size={12} />
                      </span>
                    </button>
                    {open && (
                      <div className="mb-2 ml-9 space-y-1 pb-1 animate-fade">
                        {tpl.items.map((i) => (
                          <div key={i.id} className="flex items-center gap-2 text-[13px] text-[var(--text-dim)]">
                            <Icon name="Square" size={13} className="shrink-0 text-[var(--text-faint)]" />
                            <span className="flex-1">{i.label}</span>
                            {i.critical && <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-health-risk)" }} />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* PROJE BAZLI HAZIRLIK — divider satırları */}
          <section>
            <h2 className="mb-3 text-[13px] font-semibold text-[var(--text-dim)]">Projelere göre hazırlık</h2>
            {projects.length === 0 ? (
              <EmptyState icon={<Icon name="SquaresFour" size={36} />} title="Aktif proje yok" />
            ) : (
              <div>
                {projects.map((p, i) => {
                  const stage = STAGES.find((s) => s.id === p.stage)!;
                  const lists = checklists.filter((c) => c.projectId === p.id);
                  const items = lists.flatMap((c) => c.items);
                  const dn = items.filter((i) => i.done).length;
                  const pct = items.length ? Math.round((dn / items.length) * 100) : 0;
                  const crit = items.filter((i) => i.critical && !i.done).length;

                  return (
                    <div key={p.id}>
                      {i > 0 && <Divider />}
                      <div className="flex items-center gap-3 py-3">
                        <Icon name={p.icon} size={16} style={{ color: p.color }} className="shrink-0" />
                        <Link href={`/app/projects/${p.id}`} className="w-36 shrink-0 truncate text-[14px] font-medium text-[var(--text)] hover:text-[var(--color-accent)]">{p.name}</Link>
                        <Badge color={stage.color}>{stage.label}</Badge>
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: HEALTH[p.health].color }} title={HEALTH[p.health].label} />
                        {lists.length > 0 ? (
                          <>
                            <div className="flex flex-1 items-center gap-2">
                              <ProgressBar value={pct} color={pct === 100 ? "var(--color-health-good)" : p.color} />
                              <span className="w-20 shrink-0 text-right text-[12px] text-[var(--text-faint)]">{dn}/{items.length} · %{pct}</span>
                            </div>
                            {crit > 0 && (
                              <span className="inline-flex shrink-0 items-center gap-1 text-[12px] text-[var(--color-health-risk)]">
                                <Icon name="Warning" size={13} /> {crit}
                              </span>
                            )}
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/app/projects/${p.id}`}>Aç <Icon name="ArrowRight" size={13} /></Link>
                            </Button>
                          </>
                        ) : (
                          <>
                            <span className="flex-1 text-[13px] text-[var(--text-faint)]">Henüz lansman listesi yok</span>
                            <AddToProjectMenu single={p.id} onPick={(_, tplId) => addTemplate(p.id, tplId)} label="Liste ekle" />
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </PageShell>
  );
}

/** Şablon/proje seçici dropdown. `single` verilirse projeyi atlar, sadece şablon seçtirir. */
function AddToProjectMenu({
  projects,
  single,
  onPick,
  label,
}: {
  projects?: { id: string; name: string; icon: string; color: string }[];
  single?: string;
  onPick: (projectId: string, templateId: string) => void;
  label: string;
}) {
  // single mod: şablon seç → o projeye ekle
  if (single) {
    return (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button variant="ghost" size="sm"><Icon name="Plus" size={13} /> {label}</Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content sideOffset={6} align="end"
            className="z-50 min-w-52 rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] p-1 shadow-[var(--shadow-pop)] animate-fade">
            {CHECKLIST_TEMPLATES.map((tpl) => (
              <DropdownMenu.Item key={tpl.id} onSelect={() => onPick(single, tpl.id)}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-[var(--text-dim)] outline-none data-[highlighted]:bg-[var(--bg-hover)] data-[highlighted]:text-[var(--text)]">
                <Icon name={tpl.icon} size={16} className="text-[var(--color-accent)]" />
                <span className="font-medium text-[var(--text)]">{tpl.name}</span>
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    );
  }

  // proje seç modu (şirket bloğu için)
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="primary" size="sm"><Icon name="Plus" size={13} /> {label}</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content sideOffset={6} align="start"
          className="z-50 min-w-52 rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] p-1 shadow-[var(--shadow-pop)] animate-fade">
          {(projects ?? []).map((p) => (
            <DropdownMenu.Item key={p.id} onSelect={() => onPick(p.id, "tpl_company")}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-[var(--text-dim)] outline-none data-[highlighted]:bg-[var(--bg-hover)] data-[highlighted]:text-[var(--text)]">
              <Icon name={p.icon} size={16} style={{ color: p.color }} />
              <span className="font-medium text-[var(--text)]">{p.name}</span>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
