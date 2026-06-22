"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useStore, useActiveProjects } from "@/lib/store";
import { PageShell } from "@/components/shell/page-header";
import { Badge, ProgressBar, Avatar, Divider, EmptyState } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { STAGES, HEALTH, PRIORITIES, VIEWS } from "@/lib/constants";
import { relativeDay, formatCurrency, cn } from "@/lib/utils";
import type { Project, Stage, Health, Member, ViewKind } from "@/lib/types";

// pano + tablo + zaman çizelgesi için kullanılacak aşamalar (arşiv hariç)
const STAGE_COLS = STAGES.filter((s) => s.id !== "archived");

export default function ProjectsPage() {
  const router = useRouter();
  const projects = useActiveProjects();
  const members = useStore((s) => s.members);
  const addProject = useStore((s) => s.addProject);

  const [view, setView] = useState<ViewKind>("board");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<Stage | "all">("all");
  const [healthFilter, setHealthFilter] = useState<Health | "all">("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (stageFilter !== "all" && p.stage !== stageFilter) return false;
      if (healthFilter !== "all" && p.health !== healthFilter) return false;
      if (ownerFilter !== "all" && p.ownerId !== ownerFilter) return false;
      if (q && !(p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q)))) return false;
      return true;
    });
  }, [projects, search, stageFilter, healthFilter, ownerFilter]);

  const handleNew = () => {
    const p = addProject();
    router.push(`/app/projects/${p.id}`);
  };

  const memberOf = (id: string) => members.find((m) => m.id === id);

  const filtersActive = stageFilter !== "all" || healthFilter !== "all" || ownerFilter !== "all" || search.trim() !== "";

  return (
    <PageShell crumbs={[{ label: "Projeler" }]}>
      <div className="mx-auto w-full max-w-[1200px] px-12 pb-20 pt-4 animate-rise">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[34px] font-bold leading-tight tracking-[-0.02em] text-[var(--text)]">Projeler</h1>
            <p className="mt-1.5 text-[15px] text-[var(--text-faint)]">
              {filtered.length} proje · {VIEWS.find((v) => v.id === view)?.label} görünümü
            </p>
          </div>
          <Button variant="primary" onClick={handleNew}>
            <Icon name="Plus" size={16} /> Yeni Proje
          </Button>
        </div>

        {/* görünüm sekmeleri — sade metin tabları */}
        <div className="mb-5 flex items-center gap-5 overflow-x-auto border-b border-[var(--border)]">
          {VIEWS.filter((v) => v.id !== "goals").map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={cn(
                "-mb-px flex shrink-0 items-center gap-1.5 border-b-2 pb-2.5 text-[14px] font-medium transition-colors",
                view === v.id
                  ? "border-[var(--text)] text-[var(--text)]"
                  : "border-transparent text-[var(--text-faint)] hover:text-[var(--text)]"
              )}
            >
              <Icon name={v.icon} size={15} />
              {v.label}
            </button>
          ))}
        </div>

        {/* filtreler */}
        <div className="mb-8 flex flex-wrap items-center gap-1">
          <div className="flex flex-1 min-w-[180px] items-center gap-2 rounded-md px-2 transition-colors focus-within:bg-[var(--bg-hover)]">
            <Icon name="MagnifyingGlass" size={15} className="text-[var(--text-faint)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Proje ara…"
              className="h-8 w-full bg-transparent text-[13px] text-[var(--text)] outline-none placeholder:text-[var(--text-faint)]"
            />
          </div>
          <FilterSelect value={stageFilter} onChange={(v) => setStageFilter(v as Stage | "all")}
            options={[{ value: "all", label: "Tüm aşamalar" }, ...STAGES.map((s) => ({ value: s.id, label: s.label }))]} />
          <FilterSelect value={healthFilter} onChange={(v) => setHealthFilter(v as Health | "all")}
            options={[{ value: "all", label: "Tüm sağlık" }, ...Object.entries(HEALTH).map(([k, v]) => ({ value: k, label: v.label }))]} />
          <FilterSelect value={ownerFilter} onChange={setOwnerFilter}
            options={[{ value: "all", label: "Tüm sahipler" }, ...members.map((m) => ({ value: m.id, label: m.name }))]} />
          {filtersActive && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setStageFilter("all"); setHealthFilter("all"); setOwnerFilter("all"); }}>
              <Icon name="X" size={14} /> Temizle
            </Button>
          )}
        </div>

        {/* içerik */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Icon name="SquaresFour" size={40} />}
            title="Eşleşen proje yok"
            desc={filtersActive ? "Filtreleri değiştir veya yeni bir proje oluştur." : "İlk projeni oluşturarak başla."}
            action={<Button variant="primary" onClick={handleNew}><Icon name="Plus" size={16} /> Yeni Proje</Button>}
          />
        ) : (
          <>
            {view === "board" && <BoardView projects={filtered} memberOf={memberOf} />}
            {view === "table" && <TableView projects={filtered} memberOf={memberOf} onOpen={(id) => router.push(`/app/projects/${id}`)} />}
            {view === "calendar" && <CalendarView projects={filtered} onOpen={(id) => router.push(`/app/projects/${id}`)} />}
            {view === "timeline" && <TimelineView projects={filtered} onOpen={(id) => router.push(`/app/projects/${id}`)} />}
            {view === "list" && <ListView projects={filtered} memberOf={memberOf} onOpen={(id) => router.push(`/app/projects/${id}`)} />}
          </>
        )}
      </div>
    </PageShell>
  );
}

/* ---------------- ortak küçük parçalar ---------------- */

function FilterSelect({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 cursor-pointer rounded-md bg-transparent px-2 text-[13px] text-[var(--text-dim)] outline-none transition-colors hover:bg-[var(--bg-hover)] focus:bg-[var(--bg-hover)]"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function ProjectIcon({ project, size = 16 }: { project: Project; size?: number }) {
  return <Icon name={project.icon} size={size} style={{ color: project.color }} />;
}

function HealthDot({ health }: { health: Health }) {
  return <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: HEALTH[health].color }} title={HEALTH[health].label} />;
}

/* ---------------- PANO (Kanban) — kutusuz, hafif sütunlar ---------------- */

function BoardView({ projects, memberOf }: { projects: Project[]; memberOf: (id: string) => Member | undefined }) {
  const updateProject = useStore((s) => s.updateProject);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<Stage | null>(null);

  const onDrop = (stage: Stage) => {
    if (dragId) updateProject(dragId, { stage });
    setDragId(null);
    setOverStage(null);
  };

  return (
    <div className="flex gap-5 overflow-x-auto pb-4">
      {STAGE_COLS.map((col) => {
        const items = projects.filter((p) => p.stage === col.id);
        const isOver = overStage === col.id;
        return (
          <div
            key={col.id}
            onDragOver={(e) => { e.preventDefault(); setOverStage(col.id); }}
            onDragLeave={() => setOverStage((s) => (s === col.id ? null : s))}
            onDrop={() => onDrop(col.id)}
            className={cn(
              "flex w-[260px] shrink-0 flex-col rounded-lg transition-colors",
              isOver && "bg-[var(--bg-hover)]"
            )}
          >
            <div className="mb-1 flex items-center gap-1.5 px-1 py-1">
              <Icon name={col.icon} size={14} style={{ color: col.color }} />
              <span className="text-[13px] font-semibold text-[var(--text-dim)]">{col.label}</span>
              <span className="text-[12px] text-[var(--text-faint)]">{items.length}</span>
            </div>
            <div className="flex flex-col gap-1">
              {items.map((p) => {
                const owner = memberOf(p.ownerId);
                return (
                  <div
                    key={p.id}
                    draggable
                    onDragStart={() => setDragId(p.id)}
                    onDragEnd={() => { setDragId(null); setOverStage(null); }}
                    className={cn(
                      "group cursor-grab rounded-md px-2 py-2 transition-colors hover:bg-[var(--bg-hover)] active:cursor-grabbing",
                      dragId === p.id && "opacity-40"
                    )}
                  >
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <ProjectIcon project={p} size={15} />
                        <span className="truncate text-[14px] font-medium text-[var(--text)]">{p.name}</span>
                      </div>
                      <HealthDot health={p.health} />
                    </div>
                    <div className="flex items-center gap-2 pl-[23px]">
                      <ProgressBar value={p.progress} color={p.color} />
                      <span className="w-9 shrink-0 text-right text-[12px] text-[var(--text-faint)]">%{p.progress}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between pl-[23px]">
                      {p.mrr > 0 ? (
                        <span className="text-[12px] text-[var(--text-faint)]">{formatCurrency(p.mrr)}/ay</span>
                      ) : (
                        <span className="text-[12px] text-[var(--text-faint)]">{p.targetLaunch ? relativeDay(p.targetLaunch) : ""}</span>
                      )}
                      {owner && <Avatar name={owner.name} color={owner.avatarColor} size={18} />}
                    </div>
                  </div>
                );
              })}
              {items.length === 0 && (
                <div className="px-2 py-4 text-[12px] text-[var(--text-faint)]">Buraya sürükle</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- TABLO — Notion veritabanı ---------------- */

type SortKey = "name" | "stage" | "health" | "priority" | "progress" | "targetLaunch" | "mrr";
const PAGE_SIZE = 12;

function TableView({ projects, memberOf, onOpen }: {
  projects: Project[]; memberOf: (id: string) => Member | undefined; onOpen: (id: string) => void;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("priority");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);

  const priorityRank: Record<string, number> = { p0: 0, p1: 1, p2: 2, p3: 3 };
  const stageRank = Object.fromEntries(STAGES.map((s, i) => [s.id, i]));
  const healthRank = { risk: 0, warn: 1, good: 2 } as Record<Health, number>;

  const sorted = useMemo(() => {
    const arr = [...projects];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name": cmp = a.name.localeCompare(b.name, "tr"); break;
        case "stage": cmp = stageRank[a.stage] - stageRank[b.stage]; break;
        case "health": cmp = healthRank[a.health] - healthRank[b.health]; break;
        case "priority": cmp = priorityRank[a.priority] - priorityRank[b.priority]; break;
        case "progress": cmp = a.progress - b.progress; break;
        case "mrr": cmp = a.mrr - b.mrr; break;
        case "targetLaunch":
          cmp = new Date(a.targetLaunch ?? "2999-01-01").getTime() - new Date(b.targetLaunch ?? "2999-01-01").getTime();
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [projects, sortKey, sortDir]);

  const pageCount = Math.ceil(sorted.length / PAGE_SIZE);
  const safePage = Math.min(page, Math.max(0, pageCount - 1));
  const rows = sorted.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("asc"); }
  };

  const Th = ({ k, label, className }: { k: SortKey; label: string; className?: string }) => (
    <th className={cn("py-2 pr-4 text-left font-medium text-[var(--text-faint)]", className)}>
      <button onClick={() => toggleSort(k)} className="inline-flex items-center gap-1 transition-colors hover:text-[var(--text)]">
        {label}
        {sortKey === k && <Icon name={sortDir === "asc" ? "CaretUp" : "CaretDown"} size={11} />}
      </button>
    </th>
  );

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[14px]">
          <thead>
            <tr className="border-b border-[var(--border)] text-[12px]">
              <Th k="name" label="Proje" />
              <Th k="stage" label="Aşama" />
              <Th k="health" label="Sağlık" />
              <Th k="priority" label="Öncelik" />
              <th className="py-2 pr-4 text-left font-medium text-[var(--text-faint)]">Sahip</th>
              <Th k="progress" label="İlerleme" />
              <Th k="targetLaunch" label="Hedef Lansman" />
              <Th k="mrr" label="MRR" className="text-right pr-0" />
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const stage = STAGES.find((s) => s.id === p.stage)!;
              const owner = memberOf(p.ownerId);
              return (
                <tr
                  key={p.id}
                  onClick={() => onOpen(p.id)}
                  className="cursor-pointer border-b border-[var(--border)] transition-colors hover:bg-[var(--bg-hover)]"
                >
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2.5">
                      <ProjectIcon project={p} size={15} />
                      <span className="font-medium text-[var(--text)]">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className="inline-flex items-center gap-1.5 text-[13px] text-[var(--text-dim)]">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: stage.color }} />
                      {stage.label}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className="inline-flex items-center gap-1.5 text-[13px] text-[var(--text-dim)]">
                      <HealthDot health={p.health} /> {HEALTH[p.health].label}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className="inline-flex items-center gap-1.5 text-[13px] text-[var(--text-faint)]">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: PRIORITIES[p.priority].color }} />
                      {PRIORITIES[p.priority].short}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">{owner && <Avatar name={owner.name} color={owner.avatarColor} size={20} />}</td>
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20"><ProgressBar value={p.progress} color={p.color} /></div>
                      <span className="text-[12px] text-[var(--text-faint)]">%{p.progress}</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4 text-[13px] text-[var(--text-dim)]">{p.targetLaunch ? relativeDay(p.targetLaunch) : "—"}</td>
                  <td className="py-2.5 text-right font-medium text-[var(--text)]">{p.mrr > 0 ? formatCurrency(p.mrr) : <span className="text-[var(--text-faint)]">—</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {pageCount > 1 && (
        <div className="flex items-center justify-between pt-3 text-[12px] text-[var(--text-faint)]">
          <span>{sorted.length} proje · sayfa {safePage + 1}/{pageCount}</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="iconsm" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
              <Icon name="CaretLeft" size={14} />
            </Button>
            <Button variant="ghost" size="iconsm" disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)}>
              <Icon name="CaretRight" size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- TAKVIM (ay ızgarası) ---------------- */

function CalendarView({ projects, onOpen }: { projects: Project[]; onOpen: (id: string) => void }) {
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // pazartesi başlangıçlı ofset
  const startOffset = (firstDay.getDay() + 6) % 7;
  const monthLabel = new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(cursor);

  const byDay = useMemo(() => {
    const map = new Map<number, Project[]>();
    projects.forEach((p) => {
      if (!p.targetLaunch) return;
      const d = new Date(p.targetLaunch);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        map.set(day, [...(map.get(day) ?? []), p]);
      }
    });
    return map;
  }, [projects, year, month]);

  const cells: (number | null)[] = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const weekdays = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  const todayD = new Date();
  const isToday = (d: number) => todayD.getFullYear() === year && todayD.getMonth() === month && todayD.getDate() === d;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[15px] font-semibold capitalize text-[var(--text)]">{monthLabel}</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="iconsm" onClick={() => setCursor(new Date(year, month - 1, 1))}><Icon name="CaretLeft" size={14} /></Button>
          <Button variant="ghost" size="sm" onClick={() => { const d = new Date(); d.setDate(1); setCursor(d); }}>Bugün</Button>
          <Button variant="ghost" size="iconsm" onClick={() => setCursor(new Date(year, month + 1, 1))}><Icon name="CaretRight" size={14} /></Button>
        </div>
      </div>
      <div className="grid grid-cols-7 border-l border-t border-[var(--border)]">
        {weekdays.map((w) => (
          <div key={w} className="border-b border-r border-[var(--border)] px-2 py-1.5 text-[11px] font-medium text-[var(--text-faint)]">{w}</div>
        ))}
        {cells.map((d, i) => (
          <div
            key={i}
            className={cn(
              "min-h-[88px] border-b border-r border-[var(--border)] p-1.5",
              d !== null && isToday(d) && "bg-[var(--bg-hover)]"
            )}
          >
            {d !== null && (
              <>
                <div className={cn("mb-1 text-[12px]", isToday(d) ? "font-semibold text-[var(--color-accent)]" : "text-[var(--text-faint)]")}>{d}</div>
                <div className="flex flex-col gap-1">
                  {(byDay.get(d) ?? []).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => onOpen(p.id)}
                      className="flex items-center gap-1.5 truncate rounded px-1 py-0.5 text-left text-[11px] text-[var(--text-dim)] transition-colors hover:bg-[var(--bg-active)]"
                      title={`${p.name} — lansman`}
                    >
                      <Icon name={p.icon} size={11} style={{ color: p.color }} />
                      <span className="truncate">{p.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- ZAMAN ÇİZELGESİ (Gantt) ---------------- */

function TimelineView({ projects, onOpen }: { projects: Project[]; onOpen: (id: string) => void }) {
  const withDates = projects.filter((p) => p.targetLaunch);

  const range = useMemo(() => {
    const starts = withDates.map((p) => new Date(p.startedAt).getTime());
    const ends = withDates.map((p) => new Date(p.targetLaunch!).getTime());
    if (starts.length === 0) return null;
    const min = Math.min(...starts);
    const max = Math.max(...ends);
    const pad = (max - min) * 0.05 || 86400000 * 7;
    return { min: min - pad, max: max + pad };
  }, [withDates]);

  if (!range) {
    return <EmptyState icon={<Icon name="ChartGantt" size={40} />} title="Tarihli proje yok" desc="Zaman çizelgesi için projelere hedef lansman tarihi ekle." />;
  }

  const span = range.max - range.min;
  const pct = (t: number) => ((t - range.min) / span) * 100;
  const nowPct = pct(Date.now());

  // ay işaretleri
  const months: { label: string; left: number }[] = [];
  const cur = new Date(range.min);
  cur.setDate(1); cur.setHours(0, 0, 0, 0);
  while (cur.getTime() <= range.max) {
    months.push({ label: new Intl.DateTimeFormat("tr-TR", { month: "short" }).format(cur), left: pct(cur.getTime()) });
    cur.setMonth(cur.getMonth() + 1);
  }

  return (
    <div>
      {/* ay başlıkları */}
      <div className="relative mb-2 ml-[160px] h-5 border-b border-[var(--border)]">
        {months.map((m, i) => (
          <span key={i} className="absolute -translate-x-1/2 text-[11px] text-[var(--text-faint)]" style={{ left: `${m.left}%` }}>{m.label}</span>
        ))}
      </div>
      <div className="relative space-y-1">
        {withDates.map((p) => {
          const start = pct(new Date(p.startedAt).getTime());
          const end = pct(new Date(p.targetLaunch!).getTime());
          const width = Math.max(end - start, 2);
          return (
            <div key={p.id} className="flex items-center gap-3 rounded-md py-1.5 transition-colors hover:bg-[var(--bg-hover)]">
              <button onClick={() => onOpen(p.id)} className="flex w-[148px] shrink-0 items-center gap-2 truncate text-left transition-opacity hover:opacity-80">
                <ProjectIcon project={p} size={14} />
                <span className="truncate text-[14px] font-medium text-[var(--text)]">{p.name}</span>
              </button>
              <div className="relative h-6 flex-1">
                {/* bugün referans çizgisi her satırda */}
                {nowPct >= 0 && nowPct <= 100 && (
                  <div className="absolute bottom-0 top-0 w-px bg-[var(--border)]" style={{ left: `${nowPct}%` }} />
                )}
                <button
                  onClick={() => onOpen(p.id)}
                  className="absolute top-1/2 flex h-4 -translate-y-1/2 items-center overflow-hidden rounded px-2 text-[10px] font-medium text-white transition-all hover:brightness-110"
                  style={{ left: `${start}%`, width: `${width}%`, background: p.color, minWidth: 24 }}
                  title={`${p.name} · ${relativeDay(p.targetLaunch)}`}
                >
                  <span className="truncate">%{p.progress}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-[var(--text-faint)]">
        <span className="h-3 w-px bg-[var(--border)]" /> Bugün
      </div>
    </div>
  );
}

/* ---------------- LİSTE — divider tabanlı ---------------- */

function ListView({ projects, memberOf, onOpen }: {
  projects: Project[]; memberOf: (id: string) => Member | undefined; onOpen: (id: string) => void;
}) {
  return (
    <div>
      {projects.map((p, i) => {
        const stage = STAGES.find((s) => s.id === p.stage)!;
        const owner = memberOf(p.ownerId);
        return (
          <div key={p.id}>
            {i > 0 && <Divider />}
            <button
              onClick={() => onOpen(p.id)}
              className="group flex w-full items-center gap-3 py-2.5 text-left transition-colors"
            >
              <HealthDot health={p.health} />
              <ProjectIcon project={p} size={15} />
              <span className="w-40 shrink-0 truncate text-[14px] font-medium text-[var(--text)] group-hover:text-[var(--color-accent)]">{p.name}</span>
              <Badge color={stage.color} dot>{stage.label}</Badge>
              <span className="hidden flex-1 truncate text-[13px] text-[var(--text-faint)] md:block">{p.description}</span>
              <div className="ml-auto flex items-center gap-3">
                <div className="hidden w-24 items-center gap-2 sm:flex">
                  <ProgressBar value={p.progress} color={p.color} />
                  <span className="text-[12px] text-[var(--text-faint)]">%{p.progress}</span>
                </div>
                {p.mrr > 0 && <span className="hidden text-[12px] text-[var(--text-faint)] sm:block">{formatCurrency(p.mrr)}</span>}
                <span className="hidden w-20 text-right text-[12px] text-[var(--text-faint)] sm:block">{p.targetLaunch ? relativeDay(p.targetLaunch) : "—"}</span>
                {owner && <Avatar name={owner.name} color={owner.avatarColor} size={20} />}
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
