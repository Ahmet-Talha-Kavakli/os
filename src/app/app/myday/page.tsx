"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { PageShell } from "@/components/shell/page-header";
import { Stat, StatRow } from "@/components/ui/stat";
import { Divider } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import {
  TaskCheck,
  ProjectChip,
  AssigneeAvatar,
  DueChip,
  PriorityBadge,
  TaskMeta,
} from "@/components/tasks/task-bits";
import { daysUntil, formatDate, cn } from "@/lib/utils";
import type { Task } from "@/lib/types";

export default function MyDayPage() {
  const tasks = useStore((s) => s.tasks);
  const members = useStore((s) => s.members);
  const me = useStore((s) => s.currentUserId);
  const toggleTaskDone = useStore((s) => s.toggleTaskDone);

  const [allUsers, setAllUsers] = useState(false);

  const myName = members.find((m) => m.id === me)?.name ?? "";
  const hour = new Date().getHours();
  const greeting =
    hour < 6 ? "İyi geceler" : hour < 12 ? "Günaydın" : hour < 18 ? "İyi günler" : "İyi akşamlar";

  const scope = useMemo(
    () => tasks.filter((t) => !t.parentId && (allUsers || t.assigneeId === me)),
    [tasks, allUsers, me]
  );

  const overdue = scope.filter(
    (t) => t.status !== "done" && t.dueDate && (daysUntil(t.dueDate) ?? 0) < 0
  );
  const todayTasks = scope.filter(
    (t) => t.status !== "done" && t.dueDate && daysUntil(t.dueDate) === 0
  );
  const soon = scope.filter((t) => {
    if (t.status === "done" || !t.dueDate) return false;
    const d = daysUntil(t.dueDate);
    return d !== null && d > 0 && d <= 7;
  });
  const unscheduled = scope.filter((t) => t.status !== "done" && !t.dueDate);

  // bugünün tamamlanma istatistiği — bugüne ait + bugün biten görevler
  const todayDone = scope.filter(
    (t) => t.status === "done" && t.dueDate && daysUntil(t.dueDate) === 0
  );
  const todayTotal = todayTasks.length + todayDone.length;
  const todayPct = todayTotal === 0 ? 0 : Math.round((todayDone.length / todayTotal) * 100);

  const sortByDue = (a: Task, b: Task) => (daysUntil(a.dueDate) ?? 0) - (daysUntil(b.dueDate) ?? 0);

  return (
    <PageShell crumbs={[{ label: "Bugünüm" }]}>
      <div className="notion-width mx-auto px-12 pb-20 pt-4 animate-rise">
        <div className="mb-10 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[34px] font-bold leading-tight tracking-[-0.02em] text-[var(--text)]">
              {greeting}
              {myName ? `, ${myName.split(" ")[0]}` : ""}
            </h1>
            <p className="mt-1.5 text-[15px] text-[var(--text-faint)]">
              {formatDate(new Date(), { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          <button
            onClick={() => setAllUsers((v) => !v)}
            className={cn(
              "flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium transition-colors",
              allUsers
                ? "bg-[var(--bg-hover)] text-[var(--text)]"
                : "text-[var(--text-faint)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]"
            )}
          >
            <Icon name={allUsers ? "Users" : "User"} size={15} />
            {allUsers ? "Tüm ekip" : "Sadece ben"}
          </button>
        </div>

        {/* metrikler — kutusuz StatRow */}
        <StatRow className="mb-12 grid-cols-3">
          <Stat label="Bugün" value={todayTasks.length} />
          <Stat label="Gecikmiş" value={overdue.length} />
          <Stat label="Tamamlanma" value={todayPct} suffix="%" />
        </StatRow>

        <div className="space-y-12">
          <Section
            title="Gecikmiş"
            tasks={overdue.sort(sortByDue)}
            onToggle={toggleTaskDone}
            emptyText="Gecikmiş görevin yok. Temiz."
          />
          <Section
            title="Bugün"
            tasks={todayTasks.sort(sortByDue)}
            onToggle={toggleTaskDone}
            emptyText="Bugüne planlı görev yok."
          />
          <Section
            title="Yakında · 7 gün"
            tasks={soon.sort(sortByDue)}
            onToggle={toggleTaskDone}
            emptyText="Önümüzdeki hafta için planlı görev yok."
          />
          <Section
            title="Tarihsiz"
            tasks={unscheduled}
            onToggle={toggleTaskDone}
            emptyText="Tarihsiz bekleyen görev yok."
          />
        </div>
      </div>
    </PageShell>
  );
}

function Section({
  title,
  tasks,
  onToggle,
  emptyText,
}: {
  title: string;
  tasks: Task[];
  onToggle: (id: string) => void;
  emptyText: string;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-[13px] font-semibold text-[var(--text-dim)]">{title}</h2>
        <span className="text-[12px] text-[var(--text-faint)]">{tasks.length}</span>
      </div>
      {tasks.length === 0 ? (
        <p className="py-2 text-[14px] text-[var(--text-faint)]">{emptyText}</p>
      ) : (
        <div>
          {tasks.map((t, i) => (
            <div key={t.id}>
              {i > 0 && <Divider />}
              <div className="group flex items-center gap-3 py-2.5">
                <TaskCheck task={t} onToggle={() => onToggle(t.id)} />
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-[14px] text-[var(--text)]",
                      t.status === "done" && "text-[var(--text-faint)] line-through"
                    )}
                  >
                    {t.title}
                  </p>
                  <TaskMeta task={t}>
                    <ProjectChip projectId={t.projectId} />
                  </TaskMeta>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <DueChip task={t} />
                  <PriorityBadge priority={t.priority} />
                  <AssigneeAvatar assigneeId={t.assigneeId} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
