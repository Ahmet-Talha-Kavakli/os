"use client";

import type { ReactNode } from "react";
import { useStore } from "@/lib/store";
import { Badge, Avatar } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { PRIORITIES, TASK_STATUS } from "@/lib/constants";
import { relativeDay, daysUntil, cn } from "@/lib/utils";
import type { Task } from "@/lib/types";

/** Görev tamamlandı kutusu */
export function TaskCheck({ task, onToggle }: { task: Task; onToggle: () => void }) {
  const done = task.status === "done";
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        "grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[6px] border transition-all",
        done
          ? "border-[var(--color-health-good)] bg-[var(--color-health-good)] text-white"
          : "border-[var(--border)] text-transparent hover:border-[var(--color-accent)]"
      )}
      title={done ? "Geri al" : "Tamamla"}
    >
      <Icon name="Check" size={12} weight="bold" />
    </button>
  );
}

/** Proje çipi (ikon + isim) */
export function ProjectChip({ projectId }: { projectId?: string }) {
  const project = useStore((s) => (projectId ? s.projects.find((p) => p.id === projectId) : undefined));
  if (!project) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-faint)]">
        <Icon name="Tray" size={12} /> Genel
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-dim)]">
      <Icon name={project.icon} size={12} style={{ color: project.color }} />
      {project.name}
    </span>
  );
}

/** Atanan avatarı */
export function AssigneeAvatar({ assigneeId, size = 18 }: { assigneeId?: string; size?: number }) {
  const member = useStore((s) => (assigneeId ? s.members.find((m) => m.id === assigneeId) : undefined));
  if (!member) return null;
  return <Avatar name={member.name} color={member.avatarColor} size={size} />;
}

/** Bitiş tarihi rozeti — gecikmişse kırmızı */
export function DueChip({ task }: { task: Task }) {
  if (!task.dueDate) return null;
  const dd = daysUntil(task.dueDate);
  const done = task.status === "done";
  const overdue = !done && dd !== null && dd < 0;
  const soon = !done && dd !== null && dd <= 1 && dd >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-medium",
        overdue
          ? "text-[var(--color-health-risk)]"
          : soon
            ? "text-[var(--color-health-warn)]"
            : "text-[var(--text-faint)]"
      )}
    >
      <Icon name={overdue ? "WarningCircle" : "CalendarBlank"} size={12} />
      {relativeDay(task.dueDate)}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Task["priority"] }) {
  const p = PRIORITIES[priority];
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--text-faint)]">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
      {p.short}
    </span>
  );
}

export function StatusBadge({ status }: { status: Task["status"] }) {
  const s = TASK_STATUS.find((x) => x.id === status)!;
  return (
    <Badge color={s.color} dot>
      {s.label}
    </Badge>
  );
}

/** Etiketler + recurring + bağımlılık göstergeleri */
export function TaskMeta({ task, children }: { task: Task; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      {children}
      {task.tags.map((t) => (
        <span key={t} className="text-[10px] text-[var(--text-faint)]">
          #{t}
        </span>
      ))}
      {task.recurring && (
        <span className="inline-flex items-center gap-0.5 text-[10px] text-[var(--text-faint)]" title="Tekrarlayan görev">
          <Icon name="ArrowsClockwise" size={11} />
        </span>
      )}
      {task.dependsOn.length > 0 && (
        <span
          className="inline-flex items-center gap-0.5 text-[10px] text-[var(--text-faint)]"
          title={`${task.dependsOn.length} bağımlılık`}
        >
          <Icon name="LinkSimple" size={11} />
          {task.dependsOn.length}
        </span>
      )}
    </div>
  );
}
