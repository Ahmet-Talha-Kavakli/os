"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Avatar } from "@/components/ui/primitives";
import { useStore } from "@/lib/store";
import { cn, formatDate } from "@/lib/utils";
import * as Popover from "@radix-ui/react-popover";

export function Topbar({ title, crumbs }: { title?: string; crumbs?: { label: string; href?: string }[] }) {
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const notifications = useStore((s) => s.notifications);
  const markAllRead = useStore((s) => s.markAllRead);
  const markRead = useStore((s) => s.markRead);
  const unread = notifications.filter((n) => !n.read).length;
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="flex h-11 shrink-0 items-center gap-2 px-3">
      <div className="flex flex-1 items-center gap-1 text-[14px]">
        {crumbs?.map((c, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="px-0.5 text-[var(--text-faint)]">/</span>}
            <span className={cn("rounded px-1 py-0.5", i === crumbs.length - 1 ? "font-medium text-[var(--text)]" : "text-[var(--text-dim)] hover:bg-[var(--bg-hover)]")}>{c.label}</span>
          </span>
        ))}
        {!crumbs && title && <span className="font-medium text-[var(--text)]">{title}</span>}
      </div>

      <Link href="/app/ai" className="rounded-md px-1.5 py-1 text-[var(--text-dim)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text)]" title="AI Asistan">
        <Icon name="Sparkle" size={16} />
      </Link>

      <Popover.Root open={notifOpen} onOpenChange={setNotifOpen}>
        <Popover.Trigger asChild>
          <button className="relative rounded-md px-1.5 py-1 text-[var(--text-dim)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text)]">
            <Icon name="Bell" size={16} />
            {unread > 0 && (
              <span className="absolute right-0 top-0.5 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
            )}
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="end"
            sideOffset={6}
            className="z-50 w-[340px] rounded-lg border border-[var(--border)] bg-[var(--bg-raised)] p-1.5 shadow-[var(--shadow-pop)] animate-fade"
          >
            <div className="flex items-center justify-between px-1.5 py-1">
              <span className="text-[13px] font-semibold">Bildirimler</span>
              {unread > 0 && <button onClick={markAllRead} className="text-[12px] text-[var(--text-faint)] hover:text-[var(--text)]">Tümünü okundu işaretle</button>}
            </div>
            <div className="space-y-px">
              {notifications.length === 0 && <div className="px-2 py-6 text-center text-[13px] text-[var(--text-faint)]">Bildirim yok</div>}
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={cn("flex w-full gap-2.5 rounded-md px-1.5 py-2 text-left transition-colors hover:bg-[var(--bg-hover)]")}
                >
                  <Icon name={n.kind === "due" ? "Clock" : n.kind === "assign" ? "UserPlus" : n.kind === "mention" ? "At" : "Info"} size={15} className="mt-0.5 text-[var(--text-faint)]" />
                  <div className="flex-1">
                    <div className="text-[13px] font-medium text-[var(--text)]">{n.title}</div>
                    <div className="text-[12px] text-[var(--text-dim)]">{n.body}</div>
                    <div className="mt-0.5 text-[11px] text-[var(--text-faint)]">{formatDate(n.at, { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}</div>
                  </div>
                  {!n.read && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />}
                </button>
              ))}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <button onClick={toggleTheme} className="rounded-md px-1.5 py-1 text-[var(--text-dim)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text)]" title="Tema">
        <Icon name={theme === "dark" ? "Sun" : "Moon"} size={16} />
      </button>
    </header>
  );
}
