"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import * as Tabs from "@radix-ui/react-tabs";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Popover from "@radix-ui/react-popover";
import { useStore, projectProgress } from "@/lib/store";
import { CHECKLIST_TEMPLATES } from "@/lib/seed";
import { PageShell } from "@/components/shell/page-header";
import { Badge, Avatar, ProgressBar, Divider, EmptyState } from "@/components/ui/primitives";
import { Stat, StatRow } from "@/components/ui/stat";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { SlideButton } from "@/components/ui/slide-button";
import { STAGES, HEALTH, PRIORITIES, TASK_STATUS } from "@/lib/constants";
import { relativeDay, daysUntil, formatDate, cn } from "@/lib/utils";

const ICON_CHOICES = [
  "Rocket", "Globe", "Camera", "Lightning", "Brain", "Code",
  "ChartLineUp", "Megaphone", "FilmSlate", "GridFour", "MagnifyingGlass", "Eye",
  "ArrowsOut", "Cube", "Sparkle", "Database",
];

/** URL'i her zaman yeni sekmede açılan tam https bağlantısına çevirir */
function toHref(url?: string) {
  if (!url) return undefined;
  return /^https?:\/\//.test(url) ? url : `https://${url}`;
}

export default function ProjectDetail() {
  const params = useParams();
  const id = String(params.id);
  const router = useRouter();

  const project = useStore((s) => s.projects.find((p) => p.id === id));
  const allTasks = useStore((s) => s.tasks);
  const allChecklists = useStore((s) => s.checklists);
  const allActivities = useStore((s) => s.activities);
  const members = useStore((s) => s.members);

  const tasks = useMemo(() => allTasks.filter((t) => t.projectId === id), [allTasks, id]);
  const checklists = useMemo(() => allChecklists.filter((c) => c.projectId === id), [allChecklists, id]);
  const activities = useMemo(
    () => allActivities.filter((a) => a.targetId === id || tasks.some((t) => t.id === a.targetId)),
    [allActivities, id, tasks]
  );

  const updateProject = useStore((s) => s.updateProject);
  const deleteProject = useStore((s) => s.deleteProject);
  const addTask = useStore((s) => s.addTask);
  const toggleTaskDone = useStore((s) => s.toggleTaskDone);
  const toggleChecklistItem = useStore((s) => s.toggleChecklistItem);
  const addChecklistFromTemplate = useStore((s) => s.addChecklistFromTemplate);

  const [editingName, setEditingName] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [newTask, setNewTask] = useState("");

  if (!project) {
    return (
      <PageShell crumbs={[{ label: "Projeler", href: "/app/projects" }, { label: "Bulunamadı" }]}>
        <div className="notion-width mx-auto px-12 py-20">
          <EmptyState
            icon={<Icon name="MagnifyingGlass" size={40} />}
            title="Proje bulunamadı"
            desc="Bu proje silinmiş ya da hiç var olmamış olabilir."
            action={<Button variant="primary" asChild><Link href="/app/projects">Projelere dön</Link></Button>}
          />
        </div>
      </PageShell>
    );
  }

  const stage = STAGES.find((s) => s.id === project.stage)!;
  const owner = members.find((m) => m.id === project.ownerId);
  const autoProgress = projectProgress(tasks);
  const done = tasks.filter((t) => t.status === "done").length;
  const dLeft = daysUntil(project.targetLaunch);

  const addNewTask = () => {
    const title = newTask.trim();
    if (!title) return;
    addTask({ projectId: id, title });
    setNewTask("");
  };

  const handleAddTemplate = (tplId: string) => {
    const tpl = CHECKLIST_TEMPLATES.find((t) => t.id === tplId);
    if (!tpl) return;
    addChecklistFromTemplate(id, tpl.id, tpl.name, tpl.items.map((i) => ({ id: i.id, label: i.label, critical: i.critical })));
  };

  const tabCls =
    "relative -mb-px flex items-center gap-1.5 px-1 pb-2.5 text-[14px] font-medium text-[var(--text-faint)] outline-none transition-colors hover:text-[var(--text-dim)] data-[state=active]:text-[var(--text)] after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:bg-[var(--text)] after:opacity-0 data-[state=active]:after:opacity-100";

  return (
    <PageShell crumbs={[{ label: "Projeler", href: "/app/projects" }, { label: project.name }]}>
      <div className="notion-width mx-auto px-12 pb-20 pt-4 animate-rise">
        {/* HEADER */}
        <div className="mb-8 flex items-start gap-4">
          <label className="group/logo relative mt-1 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl transition-colors hover:bg-[var(--bg-hover)]" style={{ background: project.logoUrl ? undefined : `color-mix(in srgb, ${project.color} 12%, transparent)` }} title="Logo yükle">
            {project.logoUrl ? (
              <img src={project.logoUrl} alt={project.name} className="h-full w-full object-cover" />
            ) : (
              <Icon name={project.icon} size={26} style={{ color: project.color }} />
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover/logo:opacity-100">
              <Icon name="Camera" size={16} className="text-white" />
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => updateProject(id, { logoUrl: String(reader.result) });
                reader.readAsDataURL(file);
              }}
            />
          </label>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {editingName ? (
                <input
                  autoFocus
                  defaultValue={project.name}
                  onBlur={(e) => { updateProject(id, { name: e.target.value.trim() || project.name }); setEditingName(false); }}
                  onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); if (e.key === "Escape") setEditingName(false); }}
                  className="w-full border-0 border-b border-[var(--border-strong)] bg-transparent pb-1 text-[34px] font-bold tracking-[-0.02em] text-[var(--text)] outline-none"
                />
              ) : (
                <button
                  onClick={() => setEditingName(true)}
                  className="group flex items-center gap-2 text-left"
                >
                  <h1 className="text-[34px] font-bold leading-tight tracking-[-0.02em] text-[var(--text)]">{project.name}</h1>
                  <Icon name="PencilSimple" size={15} className="opacity-0 text-[var(--text-faint)] transition-opacity group-hover:opacity-100" />
                </button>
              )}
              {project.archived && <Badge color="var(--color-stage-archived)">Arşivlendi</Badge>}
            </div>

            {editingDesc ? (
              <textarea
                autoFocus
                defaultValue={project.description}
                onBlur={(e) => { updateProject(id, { description: e.target.value }); setEditingDesc(false); }}
                onKeyDown={(e) => { if (e.key === "Escape") setEditingDesc(false); }}
                rows={2}
                className="mt-2 w-full resize-none border-0 border-b border-[var(--border-strong)] bg-transparent pb-1 text-[15px] text-[var(--text-dim)] outline-none"
              />
            ) : (
              <p
                onClick={() => setEditingDesc(true)}
                className="mt-1.5 cursor-text text-[15px] text-[var(--text-faint)] hover:text-[var(--text-dim)]"
              >
                {project.description || "Açıklama ekle…"}
              </p>
            )}

            {/* meta satırı */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {/* aşama dropdown */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[12px] font-medium outline-none"
                    style={{ background: `color-mix(in srgb, ${stage.color} 13%, transparent)`, color: `color-mix(in srgb, ${stage.color} 78%, var(--text))` }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: stage.color }} />
                    {stage.label}
                    <Icon name="CaretDown" size={11} />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content sideOffset={6} align="start"
                    className="z-50 min-w-44 rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] p-1 shadow-[var(--shadow-pop)] animate-fade">
                    {STAGES.map((st) => (
                      <DropdownMenu.Item key={st.id}
                        onSelect={() => updateProject(id, { stage: st.id, ...(st.id === "archived" ? { archived: true } : {}) })}
                        className={cn("flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-[var(--text-dim)] outline-none data-[highlighted]:bg-[var(--bg-hover)] data-[highlighted]:text-[var(--text)]")}>
                        <Icon name={st.icon} size={15} style={{ color: st.color }} />
                        {st.label}
                        {st.id === project.stage && <Icon name="Check" size={14} className="ml-auto text-[var(--color-accent)]" />}
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>

              {/* sağlık dropdown */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[12px] font-medium outline-none"
                    style={{ background: `color-mix(in srgb, ${HEALTH[project.health].color} 13%, transparent)`, color: `color-mix(in srgb, ${HEALTH[project.health].color} 78%, var(--text))` }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: HEALTH[project.health].color }} />
                    {HEALTH[project.health].label}
                    <Icon name="CaretDown" size={11} />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content sideOffset={6} align="start"
                    className="z-50 min-w-40 rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] p-1 shadow-[var(--shadow-pop)] animate-fade">
                    {(Object.keys(HEALTH) as (keyof typeof HEALTH)[]).map((h) => (
                      <DropdownMenu.Item key={h} onSelect={() => updateProject(id, { health: h })}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-[var(--text-dim)] outline-none data-[highlighted]:bg-[var(--bg-hover)] data-[highlighted]:text-[var(--text)]">
                        <span className="h-2 w-2 rounded-full" style={{ background: HEALTH[h].color }} />
                        {HEALTH[h].label}
                        {h === project.health && <Icon name="Check" size={14} className="ml-auto text-[var(--color-accent)]" />}
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>

              {/* öncelik dropdown */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[12px] font-medium outline-none"
                    style={{ background: `color-mix(in srgb, ${PRIORITIES[project.priority].color} 13%, transparent)`, color: `color-mix(in srgb, ${PRIORITIES[project.priority].color} 78%, var(--text))` }}>
                    {PRIORITIES[project.priority].label}
                    <Icon name="CaretDown" size={11} />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content sideOffset={6} align="start"
                    className="z-50 min-w-40 rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] p-1 shadow-[var(--shadow-pop)] animate-fade">
                    {(Object.keys(PRIORITIES) as (keyof typeof PRIORITIES)[]).map((pr) => (
                      <DropdownMenu.Item key={pr} onSelect={() => updateProject(id, { priority: pr })}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-[var(--text-dim)] outline-none data-[highlighted]:bg-[var(--bg-hover)] data-[highlighted]:text-[var(--text)]">
                        <span className="font-mono text-[11px]" style={{ color: PRIORITIES[pr].color }}>{PRIORITIES[pr].short}</span>
                        {PRIORITIES[pr].label}
                        {pr === project.priority && <Icon name="Check" size={14} className="ml-auto text-[var(--color-accent)]" />}
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>

              {/* sahip dropdown */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[12px] text-[var(--text-faint)] outline-none hover:bg-[var(--bg-hover)]">
                    {owner ? (
                      <><Avatar name={owner.name} color={owner.avatarColor} size={18} /> {owner.name}</>
                    ) : (
                      <><Icon name="User" size={14} /> Sahip ata</>
                    )}
                    <Icon name="CaretDown" size={11} />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content sideOffset={6} align="start"
                    className="z-50 min-w-44 rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] p-1 shadow-[var(--shadow-pop)] animate-fade">
                    {members.map((m) => (
                      <DropdownMenu.Item key={m.id} onSelect={() => updateProject(id, { ownerId: m.id })}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-[var(--text-dim)] outline-none data-[highlighted]:bg-[var(--bg-hover)] data-[highlighted]:text-[var(--text)]">
                        <Avatar name={m.name} color={m.avatarColor} size={18} />
                        {m.name}
                        {m.id === project.ownerId && <Icon name="Check" size={14} className="ml-auto text-[var(--color-accent)]" />}
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </div>

          {/* quick actions */}
          <div className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="icon" title={project.starred ? "Yıldızı kaldır" : "Yıldızla"}
              onClick={() => updateProject(id, { starred: !project.starred })}>
              <Icon name="Star" size={18} weight={project.starred ? "fill" : "regular"}
                style={{ color: project.starred ? "#d4a85a" : "var(--text-dim)" }} />
            </Button>
            {project.repoUrl && (
              <Button variant="ghost" size="icon" title="Repo" asChild>
                <a href={toHref(project.repoUrl)} target="_blank" rel="noopener noreferrer"><Icon name="GithubLogo" size={18} /></a>
              </Button>
            )}
            {project.liveUrl && (
              <Button variant="ghost" size="icon" title="Canlı" asChild>
                <a href={toHref(project.liveUrl)} target="_blank" rel="noopener noreferrer"><Icon name="ArrowSquareOut" size={18} /></a>
              </Button>
            )}
          </div>
        </div>

        {/* STAT ROW */}
        <StatRow className="mb-12 grid-cols-4">
          <Stat label="İlerleme" value={autoProgress} suffix="%" />
          <Stat label="Aylık gelir" value={project.mrr} prefix="$" />
          <Stat label="Aylık gider" value={project.monthlyCost} prefix="$" />
          <Stat label="Lansmana kalan" value={dLeft ?? 0} suffix={dLeft !== null ? " gün" : ""} />
        </StatRow>

        {/* TABS */}
        <Tabs.Root defaultValue="tasks">
          <Tabs.List className="mb-8 flex items-center gap-6 border-b border-[var(--border)]">
            {[
              { v: "tasks", label: "Görevler" },
              { v: "launch", label: "Launch Checklist" },
              { v: "info", label: "Bilgi" },
              { v: "activity", label: "Aktivite" },
            ].map((t) => (
              <Tabs.Trigger key={t.v} value={t.v} className={tabCls}>
                {t.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {/* GÖREVLER */}
          <Tabs.Content value="tasks" className="outline-none animate-fade">
            <div className="mb-6 flex items-center gap-2.5 border-b border-[var(--border)] pb-2.5">
              <Icon name="Plus" size={16} className="text-[var(--text-faint)]" />
              <input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addNewTask(); }}
                placeholder="Yeni görev ekle…"
                className="flex-1 bg-transparent text-[14px] text-[var(--text)] outline-none placeholder:text-[var(--text-faint)]"
              />
              <Button variant="ghost" size="sm" onClick={addNewTask} disabled={!newTask.trim()}>Ekle</Button>
            </div>

            <div className="mb-2 flex items-center gap-3">
              <span className="text-[12px] text-[var(--text-faint)]">{done}/{tasks.length} tamamlandı</span>
              <div className="flex-1"><ProgressBar value={autoProgress} color={project.color} /></div>
              <span className="text-[12px] text-[var(--text-faint)]">%{autoProgress}</span>
            </div>

            {tasks.length === 0 ? (
              <EmptyState icon={<Icon name="ListChecks" size={36} />} title="Henüz görev yok" desc="Yukarıdan ilk görevini ekle." />
            ) : (
              <div className="mt-4">
                {tasks.map((t, i) => {
                  const st = TASK_STATUS.find((s) => s.id === t.status)!;
                  const isDone = t.status === "done";
                  return (
                    <div key={t.id}>
                      {i > 0 && <Divider />}
                      <div className="group flex items-center gap-3 py-2.5">
                        <button onClick={() => toggleTaskDone(t.id)}
                          className={cn("shrink-0 transition-colors", isDone ? "text-[var(--color-accent)]" : "text-[var(--text-faint)] hover:text-[var(--color-accent)]")}>
                          <Icon name={isDone ? "CheckCircle" : "Circle"} size={18} weight={isDone ? "fill" : "regular"} />
                        </button>
                        <span className={cn("flex-1 text-[14px]", isDone ? "text-[var(--text-faint)] line-through" : "text-[var(--text)]")}>{t.title}</span>
                        <Badge color={st.color} dot>{st.label}</Badge>
                        <Badge color={PRIORITIES[t.priority].color}>{PRIORITIES[t.priority].short}</Badge>
                        {t.dueDate && <span className="w-20 text-right text-[12px] text-[var(--text-faint)]">{relativeDay(t.dueDate)}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Tabs.Content>

          {/* LAUNCH CHECKLIST */}
          <Tabs.Content value="launch" className="outline-none animate-fade">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-[var(--text-dim)]">Lansman listeleri</h2>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <Button variant="ghost" size="sm"><Icon name="Plus" size={14} /> Şablon ekle</Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content sideOffset={6} align="end"
                    className="z-50 min-w-56 rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] p-1 shadow-[var(--shadow-pop)] animate-fade">
                    {CHECKLIST_TEMPLATES.map((tpl) => (
                      <DropdownMenu.Item key={tpl.id} onSelect={() => handleAddTemplate(tpl.id)}
                        className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-[var(--text-dim)] outline-none data-[highlighted]:bg-[var(--bg-hover)] data-[highlighted]:text-[var(--text)]">
                        <Icon name={tpl.icon} size={16} className="text-[var(--color-accent)]" />
                        <div>
                          <div className="font-medium text-[var(--text)]">{tpl.name}</div>
                          <div className="text-[11px] text-[var(--text-faint)]">{tpl.items.length} adım</div>
                        </div>
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>

            {checklists.length === 0 ? (
              <EmptyState icon={<Icon name="RocketLaunch" size={36} />} title="Henüz lansman listesi yok"
                desc="Bir şablon ekleyerek yayın hazırlığını takip et." />
            ) : (
              <div className="space-y-10">
                {checklists.map((c) => {
                  const cDone = c.items.filter((i) => i.done).length;
                  const pct = c.items.length ? Math.round((cDone / c.items.length) * 100) : 0;
                  const critLeft = c.items.filter((i) => i.critical && !i.done).length;
                  return (
                    <div key={c.id}>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-[14px] font-semibold text-[var(--text)]">{c.name}</div>
                        <div className="flex items-center gap-3 text-[12px] text-[var(--text-faint)]">
                          {critLeft > 0 && (
                            <span className="inline-flex items-center gap-1 text-[var(--color-health-risk)]">
                              <Icon name="Warning" size={13} /> {critLeft} kritik
                            </span>
                          )}
                          <span>{cDone}/{c.items.length} · %{pct}</span>
                        </div>
                      </div>
                      <div className="mb-2"><ProgressBar value={pct} color={pct === 100 ? "var(--color-health-good)" : project.color} /></div>
                      <div>
                        {c.items.map((i) => (
                          <button key={i.id} onClick={() => toggleChecklistItem(c.id, i.id)}
                            className="group flex w-full items-center gap-2.5 py-2 text-left">
                            <Icon name={i.done ? "CheckCircle" : "Circle"} size={17} weight={i.done ? "fill" : "regular"}
                              style={{ color: i.done ? "var(--color-accent)" : "var(--text-faint)" }} className="shrink-0" />
                            <span className={cn("flex-1 text-[14px]", i.done ? "text-[var(--text-faint)] line-through" : "text-[var(--text)]")}>{i.label}</span>
                            {i.critical && !i.done && <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--color-health-risk)" }} title="Kritik" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Tabs.Content>

          {/* BİLGİ — tümü editlenebilir, divider'lı satırlar */}
          <Tabs.Content value="info" className="outline-none animate-fade">
            <div className="max-w-[640px]">
              {/* İkon */}
              <EditRow icon="Sparkle" label="İkon" first>
                <IconPicker
                  current={project.icon}
                  color={project.color}
                  onPick={(name) => updateProject(id, { icon: name })}
                />
              </EditRow>

              {/* Repo */}
              <EditRow icon="GithubLogo" label="Repo">
                <UrlField value={project.repoUrl} placeholder="github.com/…" onSave={(v) => updateProject(id, { repoUrl: v })} />
              </EditRow>

              {/* Canlı */}
              <EditRow icon="Globe" label="Canlı">
                <UrlField value={project.liveUrl} placeholder="uygulama.com" onSave={(v) => updateProject(id, { liveUrl: v })} />
              </EditRow>

              {/* Hedef lansman */}
              <EditRow icon="Rocket" label="Hedef lansman">
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={project.targetLaunch ? project.targetLaunch.slice(0, 10) : ""}
                    onChange={(e) => updateProject(id, { targetLaunch: e.target.value || undefined })}
                    className="rounded-md bg-transparent text-[14px] text-[var(--text)] outline-none hover:bg-[var(--bg-hover)] focus:bg-[var(--bg-hover)] [color-scheme:light] dark:[color-scheme:dark]"
                  />
                  {project.targetLaunch && (
                    <span className="text-[12px] text-[var(--text-faint)]">{relativeDay(project.targetLaunch)}</span>
                  )}
                </div>
              </EditRow>

              {/* Teknoloji — chip listesi */}
              <EditRow icon="Stack" label="Teknoloji" align="start">
                <ChipEditor
                  items={project.techStack}
                  placeholder="Teknoloji ekle…"
                  onChange={(arr) => updateProject(id, { techStack: arr })}
                />
              </EditRow>

              {/* Etiketler — chip listesi */}
              <EditRow icon="Tag" label="Etiketler" align="start">
                <ChipEditor
                  items={project.tags}
                  placeholder="Etiket ekle…"
                  prefix="#"
                  color={project.color}
                  onChange={(arr) => updateProject(id, { tags: arr })}
                />
              </EditRow>

              {/* Salt-okunur bilgiler */}
              <EditRow icon="DeviceMobile" label="Platform">
                <span className="text-[14px] text-[var(--text-dim)]">{project.platform}</span>
              </EditRow>
              <EditRow icon="FolderOpen" label="Yerel yol">
                <span className="truncate text-[14px] text-[var(--text-dim)]">{project.localPath || "—"}</span>
              </EditRow>
              <EditRow icon="Calendar" label="Başlangıç">
                <span className="text-[14px] text-[var(--text-dim)]">{formatDate(project.startedAt)}</span>
              </EditRow>
            </div>
          </Tabs.Content>

          {/* AKTİVİTE */}
          <Tabs.Content value="activity" className="outline-none animate-fade">
            {activities.length === 0 ? (
              <EmptyState icon={<Icon name="ClockCounterClockwise" size={36} />} title="Henüz aktivite yok" desc="Bu projede yapılanlar burada görünecek." />
            ) : (
              <div className="space-y-3">
                {activities.map((a) => {
                  const actor = members.find((m) => m.id === a.actorId);
                  return (
                    <div key={a.id} className="flex items-center gap-2.5">
                      {actor && <Avatar name={actor.name} color={actor.avatarColor} size={20} />}
                      <span className="flex-1 text-[13px] text-[var(--text-dim)]">
                        <span className="font-medium text-[var(--text)]">{actor?.name}</span> {a.verb}{" "}
                        <span className="text-[var(--text)]">{a.targetLabel}</span>
                      </span>
                      <span className="text-[12px] text-[var(--text-faint)]">{relativeDay(a.at)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </Tabs.Content>
        </Tabs.Root>

        {/* DANGER ZONE — sakin, kutusuz */}
        <div className="mt-16">
          <Divider />
          <div className="pt-6">
            <div className="mb-4 flex items-center gap-2">
              <Icon name="Warning" size={15} className="text-[var(--color-health-risk)]" />
              <h3 className="text-[13px] font-semibold text-[var(--text-dim)]">Tehlikeli bölge</h3>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-[13px] text-[var(--text-faint)]">
                  {project.archived ? "Bu proje zaten arşivde. Onaylayıp tekrar arşivleyebilirsin." : "Projeyi aktif listelerden gizler, verisi korunur."}
                </p>
                <SlideButton
                  label="Arşivlemek için kaydır"
                  confirmLabel="Bırak ve arşivle"
                  doneLabel="Arşivlendi"
                  icon="Archive"
                  color="var(--color-accent)"
                  onConfirm={() => updateProject(id, { archived: true, stage: "archived" })}
                />
              </div>
              <div>
                <p className="mb-2 text-[13px] text-[var(--text-faint)]">Projeyi çöp kutusuna taşır. Geri Dönüşüm'den geri alınabilir.</p>
                <SlideButton
                  label="Silmek için kaydır"
                  confirmLabel="Bırak ve sil"
                  doneLabel="Silindi"
                  icon="Trash"
                  color="var(--color-health-risk)"
                  onConfirm={() => { deleteProject(id); router.push("/app/projects"); }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

/* Etiket sol — editlenebilir değer sağ, divider'lı satır */
function EditRow({
  icon,
  label,
  children,
  first,
  align = "center",
}: {
  icon: string;
  label: string;
  children: React.ReactNode;
  first?: boolean;
  align?: "center" | "start";
}) {
  return (
    <>
      {!first && <Divider />}
      <div className={cn("flex gap-3 py-2.5 text-[14px]", align === "center" ? "items-center" : "items-start")}>
        <Icon name={icon} size={15} className={cn("shrink-0 text-[var(--text-faint)]", align === "start" && "mt-1.5")} />
        <span className={cn("w-28 shrink-0 text-[var(--text-faint)]", align === "start" && "mt-1")}>{label}</span>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </>
  );
}

/* Inline düzenlenebilir URL + tıklanabilir link */
function UrlField({ value, placeholder, onSave }: { value?: string; placeholder: string; onSave: (v: string | undefined) => void }) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <input
        autoFocus
        defaultValue={value ?? ""}
        placeholder={placeholder}
        onBlur={(e) => { onSave(e.target.value.trim() || undefined); setEditing(false); }}
        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); if (e.key === "Escape") setEditing(false); }}
        className="w-full rounded-md bg-[var(--bg-hover)] px-2 py-1 text-[14px] text-[var(--text)] outline-none placeholder:text-[var(--text-faint)]"
      />
    );
  }
  return (
    <div className="group flex items-center gap-2">
      {value ? (
        <a href={toHref(value)} target="_blank" rel="noopener noreferrer" className="truncate text-[var(--color-accent)] hover:underline">{value}</a>
      ) : (
        <button onClick={() => setEditing(true)} className="text-[var(--text-faint)] hover:text-[var(--text-dim)]">{placeholder}</button>
      )}
      <button onClick={() => setEditing(true)} className="shrink-0 text-[var(--text-faint)] opacity-0 transition-opacity hover:text-[var(--text-dim)] group-hover:opacity-100" title="Düzenle">
        <Icon name="PencilSimple" size={13} />
      </button>
    </div>
  );
}

/* Düzenlenebilir chip listesi (teknoloji / etiket) */
function ChipEditor({
  items,
  placeholder,
  prefix = "",
  color,
  onChange,
}: {
  items: string[];
  placeholder: string;
  prefix?: string;
  color?: string;
  onChange: (arr: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim().replace(/^#/, "");
    if (!v || items.includes(v)) { setDraft(""); return; }
    onChange([...items, v]);
    setDraft("");
  };
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {items.map((it) =>
        color ? (
          <span key={it} className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[12px] font-medium leading-none"
            style={{ background: `color-mix(in srgb, ${color} 13%, transparent)`, color: `color-mix(in srgb, ${color} 78%, var(--text))` }}>
            {prefix}{it}
            <button onClick={() => onChange(items.filter((x) => x !== it))} className="opacity-60 hover:opacity-100"><Icon name="X" size={11} /></button>
          </span>
        ) : (
          <span key={it} className="inline-flex items-center gap-1 rounded-md bg-[var(--bg-hover)] px-2 py-1 text-[12px] text-[var(--text-dim)]">
            {prefix}{it}
            <button onClick={() => onChange(items.filter((x) => x !== it))} className="text-[var(--text-faint)] hover:text-[var(--text)]"><Icon name="X" size={11} /></button>
          </span>
        )
      )}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        onBlur={add}
        placeholder={placeholder}
        className="min-w-28 flex-1 bg-transparent px-1 py-0.5 text-[13px] text-[var(--text)] outline-none placeholder:text-[var(--text-faint)]"
      />
    </div>
  );
}

/* Phosphor ikon seçici — küçük grid popover */
function IconPicker({ current, color, onPick }: { current: string; color: string; onPick: (name: string) => void }) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="inline-flex items-center gap-2 rounded-md px-1.5 py-1 text-[14px] text-[var(--text-dim)] outline-none hover:bg-[var(--bg-hover)]">
          <Icon name={current} size={18} style={{ color }} />
          <span className="text-[13px] text-[var(--text-faint)]">{current}</span>
          <Icon name="CaretDown" size={11} className="text-[var(--text-faint)]" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content sideOffset={6} align="start"
          className="z-50 w-[232px] rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] p-2 shadow-[var(--shadow-pop)] animate-fade">
          <div className="grid grid-cols-6 gap-1">
            {ICON_CHOICES.map((name) => (
              <Popover.Close asChild key={name}>
                <button
                  onClick={() => onPick(name)}
                  title={name}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg outline-none transition-colors hover:bg-[var(--bg-hover)]",
                    name === current && "bg-[var(--bg-active)]"
                  )}
                >
                  <Icon name={name} size={18} style={{ color: name === current ? color : "var(--text-dim)" }} />
                </button>
              </Popover.Close>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
