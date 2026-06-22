"use client";

import * as Popover from "@radix-ui/react-popover";
import { useActiveProjects } from "@/lib/store";
import { Icon } from "./icon";
import { cn } from "@/lib/utils";

const GENERAL_COLOR = "var(--color-tag-gray)";

/** Bir kaydı "Genel" ya da bir projeye atayan renkli seçici. */
export function ScopePicker({
  projectId,
  onChange,
}: {
  projectId?: string;
  onChange: (projectId: string | undefined) => void;
}) {
  const projects = useActiveProjects();
  const current = projects.find((p) => p.id === projectId);
  const color = current?.color ?? GENERAL_COLOR;
  const label = current?.name ?? "Genel";

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          className="inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[12px] font-medium outline-none transition-colors hover:brightness-95"
          style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color: `color-mix(in srgb, ${color} 78%, var(--text))` }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
          {current ? <Icon name={current.icon} size={11} /> : null}
          {label}
          <Icon name="CaretDown" size={10} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-50 max-h-72 w-52 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] p-1 shadow-[var(--shadow-pop)] animate-fade"
        >
          <Popover.Close asChild>
            <button
              onClick={() => onChange(undefined)}
              className={cn("flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] outline-none hover:bg-[var(--bg-hover)]", !projectId && "bg-[var(--bg-hover)]")}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: GENERAL_COLOR }} />
              <span className="flex-1 text-[var(--text)]">Genel</span>
              {!projectId && <Icon name="Check" size={13} style={{ color: "var(--color-accent)" }} />}
            </button>
          </Popover.Close>
          {projects.length > 0 && <div className="my-1 h-px bg-[var(--border)]" />}
          {projects.map((p) => (
            <Popover.Close asChild key={p.id}>
              <button
                onClick={() => onChange(p.id)}
                className={cn("flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] outline-none hover:bg-[var(--bg-hover)]", projectId === p.id && "bg-[var(--bg-hover)]")}
              >
                <Icon name={p.icon} size={14} style={{ color: p.color }} />
                <span className="flex-1 truncate text-[var(--text)]">{p.name}</span>
                {projectId === p.id && <Icon name="Check" size={13} style={{ color: "var(--color-accent)" }} />}
              </button>
            </Popover.Close>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/** Kartın solundaki renkli kapsam şeridi rengi */
export function scopeColor(projectId: string | undefined, projects: { id: string; color: string }[]): string {
  return projects.find((p) => p.id === projectId)?.color ?? GENERAL_COLOR;
}
