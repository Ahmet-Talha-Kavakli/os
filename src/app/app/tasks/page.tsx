"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { PageShell } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Divider, EmptyState } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { TaskDrawer } from "@/components/tasks/task-drawer";
import {
  TaskCheck,
  ProjectChip,
  AssigneeAvatar,
  DueChip,
  PriorityBadge,
  TaskMeta,
} from "@/components/tasks/task-bits";
import { TASK_STATUS, PRIORITIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus, Priority } from "@/lib/types";

type ViewMode = "board" | "list";
type GroupBy = "status" | "project";

const selectCls =
  "h-8 cursor-pointer rounded-md bg-transparent px-2 text-[13px] text-[var(--text-dim)] outline-none transition-colors hover:bg-[var(--bg-hover)] focus:bg-[var(--bg-hover)]";

export default function TasksPage() {
  const tasks = useStore((s) => s.tasks);
  const projects = useStore((s) => s.projects);
  const members = useStore((s) => s.members);
  const me = useStore((s) => s.currentUserId);
  const addTask = useStore((s) => s.addTask);
  const updateTask = useStore((s) => s.updateTask);
  const toggleTaskDone = useStore((s) => s.toggleTaskDone);

  const [view, setView] = useState<ViewMode>("board");
  const [groupBy, setGroupBy] = useState<GroupBy>("status");
  const [openId, setOpenId] = useState<string | null>(null);
  const [quickAdd, setQuickAdd] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // filtreler
  const [fProject, setFProject] = useState("");
  const [fAssignee, setFAssignee] = useState("");
  const [fPriority, setFPriority] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [search, setSearch] = useState("");
  const [mineOnly, setMineOnly] = useState(false);

  const hasFilter = fProject || fAssignee || fPriority || fStatus || search || mineOnly;

  // sadece üst-seviye görevler (alt görevler drawer'da yönetiliyor)
  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (t.parentId) return false;
      if (fProject && t.projectId !== fProject) return false;
      if (fAssignee && t.assigneeId !== fAssignee) return false;
      if (fPriority && t.priority !== fPriority) return false;
      if (fStatus && t.status !== fStatus) return false;
      if (mineOnly && t.assigneeId !== me) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tasks, fProject, fAssignee, fPriority, fStatus, mineOnly, me, search]);

  const open = filtered.filter((t) => t.status !== "done").length;

  function handleQuickAdd(e: React.FormEvent) {
    e.preventDefault();
    const title = quickAdd.trim();
    if (!title) return;
    addTask({
      title,
      status: fStatus ? (fStatus as TaskStatus) : "todo",
      priority: fPriority ? (fPriority as Priority) : "p2",
      projectId: fProject || undefined,
      assigneeId: mineOnly ? me : fAssignee || undefined,
    });
    setQuickAdd("");
  }

  function clearFilters() {
    setFProject("");
    setFAssignee("");
    setFPriority("");
    setFStatus("");
    setSearch("");
    setMineOnly(false);
  }

  function onDrop(status: TaskStatus) {
    if (dragId) {
      const t = tasks.find((x) => x.id === dragId);
      if (t && t.status !== status) {
        updateTask(dragId, {
          status,
          completedAt: status === "done" ? new Date().toISOString() : undefined,
        });
      }
    }
    setDragId(null);
    setDragOver(null);
  }

  return (
    <PageShell crumbs={[{ label: "Görevler" }]}>
      <div className="mx-auto w-full max-w-[1200px] px-12 pb-20 pt-4 animate-rise">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[34px] font-bold leading-tight tracking-[-0.02em] text-[var(--text)]">Görevler</h1>
            <p className="mt-1.5 text-[15px] text-[var(--text-faint)]">
              {filtered.length} görev · {open} açık
            </p>
          </div>
          <Button variant="primary" onClick={() => setOpenId(addTask({ title: "Yeni görev", status: "todo" }).id)}>
            <Icon name="Plus" size={16} /> Görev
          </Button>
        </div>

        {/* görünüm sekmeleri — sade metin */}
        <div className="mb-5 flex items-center gap-5 border-b border-[var(--border)]">
          {(
            [
              ["board", "Pano"],
              ["list", "Liste"],
            ] as const
          ).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "-mb-px border-b-2 pb-2.5 text-[14px] font-medium transition-colors",
                view === v
                  ? "border-[var(--text)] text-[var(--text)]"
                  : "border-transparent text-[var(--text-faint)] hover:text-[var(--text)]"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* hızlı ekleme */}
        <form onSubmit={handleQuickAdd} className="mb-2">
          <div className="flex items-center gap-2.5 py-1.5">
            <Icon name="Plus" size={16} className="text-[var(--text-faint)]" />
            <input
              value={quickAdd}
              onChange={(e) => setQuickAdd(e.target.value)}
              placeholder="Hızlı görev ekle, Enter ile kaydet…"
              className="flex-1 bg-transparent text-[14px] text-[var(--text)] outline-none placeholder:text-[var(--text-faint)]"
            />
            {quickAdd && (
              <Button type="submit" variant="subtle" size="sm">
                Ekle
              </Button>
            )}
          </div>
        </form>
        <Divider className="mb-3" />

        {/* filtre çubuğu */}
        <div className="mb-8 flex flex-wrap items-center gap-1">
          <div className="flex items-center gap-2 rounded-md px-2 transition-colors focus-within:bg-[var(--bg-hover)]">
            <Icon name="MagnifyingGlass" size={14} className="text-[var(--text-faint)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ara…"
              className="h-8 w-36 bg-transparent text-[13px] text-[var(--text)] outline-none placeholder:text-[var(--text-faint)]"
            />
          </div>

          <button
            onClick={() => setMineOnly((v) => !v)}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-md px-2 text-[13px] font-medium transition-colors",
              mineOnly
                ? "bg-[var(--bg-hover)] text-[var(--text)]"
                : "text-[var(--text-faint)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]"
            )}
          >
            <Icon name="User" size={13} /> Bana atananlar
          </button>

          <select value={fProject} onChange={(e) => setFProject(e.target.value)} className={selectCls}>
            <option value="">Tüm projeler</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select value={fAssignee} onChange={(e) => setFAssignee(e.target.value)} className={selectCls}>
            <option value="">Herkes</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <select value={fPriority} onChange={(e) => setFPriority(e.target.value)} className={selectCls}>
            <option value="">Tüm öncelikler</option>
            {(Object.keys(PRIORITIES) as Priority[]).map((p) => (
              <option key={p} value={p}>
                {PRIORITIES[p].label}
              </option>
            ))}
          </select>

          <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} className={selectCls}>
            <option value="">Tüm durumlar</option>
            {TASK_STATUS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>

          {view === "list" && (
            <select value={groupBy} onChange={(e) => setGroupBy(e.target.value as GroupBy)} className={selectCls}>
              <option value="status">Duruma göre</option>
              <option value="project">Projeye göre</option>
            </select>
          )}

          {hasFilter && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <Icon name="X" size={13} /> Temizle
            </Button>
          )}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Icon name="ListChecks" size={40} />}
            title={hasFilter ? "Filtreye uyan görev yok" : "Henüz görev yok"}
            desc={hasFilter ? "Filtreleri temizleyip tekrar dene." : "Yukarıdan hızlıca bir görev ekleyebilirsin."}
          />
        ) : view === "board" ? (
          <BoardView
            tasks={filtered}
            onOpen={setOpenId}
            onToggle={toggleTaskDone}
            dragId={dragId}
            dragOver={dragOver}
            setDragId={setDragId}
            setDragOver={setDragOver}
            onDrop={onDrop}
          />
        ) : (
          <ListView
            tasks={filtered}
            groupBy={groupBy}
            onOpen={setOpenId}
            onToggle={toggleTaskDone}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            projects={projects}
          />
        )}
      </div>

      <TaskDrawer taskId={openId} onClose={() => setOpenId(null)} />
    </PageShell>
  );
}

/* ---------- PANO (Kanban) — sade, kutusuz sütunlar ---------- */
function BoardView({
  tasks,
  onOpen,
  onToggle,
  dragId,
  dragOver,
  setDragId,
  setDragOver,
  onDrop,
}: {
  tasks: Task[];
  onOpen: (id: string) => void;
  onToggle: (id: string) => void;
  dragId: string | null;
  dragOver: string | null;
  setDragId: (id: string | null) => void;
  setDragOver: React.Dispatch<React.SetStateAction<string | null>>;
  onDrop: (status: TaskStatus) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
      {TASK_STATUS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        const isOver = dragOver === col.id;
        return (
          <div
            key={col.id}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(col.id);
            }}
            onDragLeave={() => setDragOver((c) => (c === col.id ? null : c))}
            onDrop={() => onDrop(col.id)}
            className={cn(
              "flex flex-col rounded-lg transition-colors",
              isOver && "bg-[var(--bg-hover)]"
            )}
          >
            <div className="mb-1 flex items-center gap-1.5 px-1 py-1">
              <span className="h-2 w-2 rounded-full" style={{ background: col.color }} />
              <span className="text-[13px] font-semibold text-[var(--text-dim)]">{col.label}</span>
              <span className="text-[12px] text-[var(--text-faint)]">{colTasks.length}</span>
            </div>
            <div className="flex min-h-[80px] flex-1 flex-col gap-1.5">
              {colTasks.map((t) => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={() => setDragId(t.id)}
                  onDragEnd={() => {
                    setDragId(null);
                    setDragOver(null);
                  }}
                  onClick={() => onOpen(t.id)}
                  className={cn(
                    "group cursor-pointer rounded-md px-2 py-2 transition-colors hover:bg-[var(--bg-hover)]",
                    dragId === t.id && "opacity-40"
                  )}
                >
                  <div className="mb-1.5 flex items-start gap-2">
                    <div className="pt-0.5">
                      <TaskCheck task={t} onToggle={() => onToggle(t.id)} />
                    </div>
                    <p
                      className={cn(
                        "flex-1 text-[14px] leading-snug text-[var(--text)]",
                        t.status === "done" && "text-[var(--text-faint)] line-through"
                      )}
                    >
                      {t.title}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2 pl-7">
                    <TaskMeta task={t}>
                      <PriorityBadge priority={t.priority} />
                      <ProjectChip projectId={t.projectId} />
                    </TaskMeta>
                    <AssigneeAvatar assigneeId={t.assigneeId} />
                  </div>
                  {t.dueDate && (
                    <div className="mt-1 pl-7">
                      <DueChip task={t} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- LİSTE — divider tabanlı ---------- */
function ListView({
  tasks,
  groupBy,
  onOpen,
  onToggle,
  collapsed,
  setCollapsed,
  projects,
}: {
  tasks: Task[];
  groupBy: GroupBy;
  onOpen: (id: string) => void;
  onToggle: (id: string) => void;
  collapsed: Record<string, boolean>;
  setCollapsed: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  projects: { id: string; name: string; icon: string; color: string }[];
}) {
  const groups: { key: string; label: string; color?: string; icon?: string; items: Task[] }[] =
    groupBy === "status"
      ? TASK_STATUS.map((s) => ({
          key: s.id,
          label: s.label,
          color: s.color,
          items: tasks.filter((t) => t.status === s.id),
        }))
      : [
          ...projects.map((p) => ({
            key: p.id,
            label: p.name,
            color: p.color,
            icon: p.icon,
            items: tasks.filter((t) => t.projectId === p.id),
          })),
          {
            key: "__none",
            label: "Genel (projesiz)",
            icon: "Tray",
            items: tasks.filter((t) => !t.projectId),
          },
        ];

  return (
    <div className="space-y-10">
      {groups
        .filter((g) => g.items.length > 0)
        .map((g) => {
          const isCollapsed = collapsed[g.key];
          return (
            <section key={g.key}>
              <button
                onClick={() => setCollapsed((c) => ({ ...c, [g.key]: !c[g.key] }))}
                className="mb-2 flex w-full items-center gap-2 text-[13px] font-semibold text-[var(--text-dim)]"
              >
                <Icon name={isCollapsed ? "CaretRight" : "CaretDown"} size={12} className="text-[var(--text-faint)]" />
                {g.icon ? (
                  <Icon name={g.icon} size={14} style={{ color: g.color }} />
                ) : (
                  <span className="h-2 w-2 rounded-full" style={{ background: g.color }} />
                )}
                <span>{g.label}</span>
                <span className="text-[12px] font-normal text-[var(--text-faint)]">{g.items.length}</span>
              </button>
              {!isCollapsed && (
                <div>
                  {g.items.map((t, i) => (
                    <div key={t.id}>
                      {i > 0 && <Divider />}
                      <TaskRow task={t} onOpen={onOpen} onToggle={onToggle} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
    </div>
  );
}

function TaskRow({
  task,
  onOpen,
  onToggle,
}: {
  task: Task;
  onOpen: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  return (
    <div
      onClick={() => onOpen(task.id)}
      className="group flex cursor-pointer items-center gap-3 py-2.5"
    >
      <TaskCheck task={task} onToggle={() => onToggle(task.id)} />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-[14px] text-[var(--text)]",
            task.status === "done" && "text-[var(--text-faint)] line-through"
          )}
        >
          {task.title}
        </p>
        <TaskMeta task={task}>
          <ProjectChip projectId={task.projectId} />
        </TaskMeta>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <DueChip task={task} />
        <PriorityBadge priority={task.priority} />
        <AssigneeAvatar assigneeId={task.assigneeId} />
      </div>
    </div>
  );
}
