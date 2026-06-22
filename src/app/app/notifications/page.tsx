"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { PageShell, PageHero } from "@/components/shell/page-header";
import { Card, EmptyState, SectionTitle } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { relativeDay, cn } from "@/lib/utils";
import type { Notification } from "@/lib/types";

const KIND_META: Record<Notification["kind"], { label: string; icon: string; color: string }> = {
  mention: { label: "Bahsetme", icon: "At", color: "var(--color-accent)" },
  assign: { label: "Atama", icon: "UserPlus", color: "var(--color-stage-payment)" },
  due: { label: "Deadline", icon: "Clock", color: "var(--color-health-warn)" },
  system: { label: "Sistem", icon: "Gear", color: "var(--text-faint)" },
};

const FILTERS: { id: "all" | Notification["kind"]; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "mention", label: "Bahsetme" },
  { id: "assign", label: "Atama" },
  { id: "due", label: "Deadline" },
  { id: "system", label: "Sistem" },
];

export default function NotificationsPage() {
  const notifications = useStore((s) => s.notifications);
  const markRead = useStore((s) => s.markRead);
  const markAllRead = useStore((s) => s.markAllRead);
  const [filter, setFilter] = useState<"all" | Notification["kind"]>("all");

  const filtered =
    filter === "all" ? notifications : notifications.filter((n) => n.kind === filter);
  const unread = filtered.filter((n) => !n.read);
  const read = filtered.filter((n) => n.read);
  const unreadTotal = notifications.filter((n) => !n.read).length;

  return (
    <PageShell crumbs={[{ label: "Bildirimler" }]}>
      <div className="mx-auto max-w-3xl px-6 py-6 animate-rise">
        <PageHero
          title="Bildirimler"
          subtitle={
            unreadTotal > 0 ? `${unreadTotal} okunmamış bildirim` : "Hepsi okundu, temiz"
          }
          icon={
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-hover)]">
              <Icon name="Bell" size={20} style={{ color: "var(--color-accent)" }} />
            </div>
          }
          actions={
            unreadTotal > 0 ? (
              <Button variant="subtle" size="sm" onClick={markAllRead}>
                <Icon name="Checks" size={14} /> Tümünü okundu işaretle
              </Button>
            ) : undefined
          }
        />

        {/* filtre çubuğu */}
        <div className="mb-5 flex flex-wrap gap-1.5">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  active
                    ? "bg-[var(--color-accent)] text-white"
                    : "bg-[var(--bg-hover)] text-[var(--text-dim)] hover:bg-[var(--glass-strong)] hover:text-[var(--text)]"
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Icon name="BellSlash" size={40} />}
              title={filter === "all" ? "Bildirim yok" : "Bu türde bildirim yok"}
              desc="Atamalar, bahsetmeler ve yaklaşan deadline'lar burada toplanır."
            />
          </Card>
        ) : (
          <div className="space-y-6">
            {unread.length > 0 && (
              <div>
                <SectionTitle>Okunmamış · {unread.length}</SectionTitle>
                <Card className="p-1.5">
                  <div className="divide-y divide-[var(--border)]">
                    {unread.map((n) => (
                      <Row key={n.id} n={n} onRead={() => markRead(n.id)} />
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {read.length > 0 && (
              <div>
                <SectionTitle>Okundu · {read.length}</SectionTitle>
                <Card className="p-1.5">
                  <div className="divide-y divide-[var(--border)]">
                    {read.map((n) => (
                      <Row key={n.id} n={n} onRead={() => markRead(n.id)} />
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}

function Row({ n, onRead }: { n: Notification; onRead: () => void }) {
  const meta = KIND_META[n.kind];
  return (
    <button
      onClick={onRead}
      className="flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-[var(--bg-hover)]"
    >
      <div
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ background: `color-mix(in srgb, ${meta.color} 14%, transparent)` }}
      >
        <Icon name={meta.icon} size={16} style={{ color: meta.color }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm",
              n.read ? "font-medium text-[var(--text-dim)]" : "font-semibold text-[var(--text)]"
            )}
          >
            {n.title}
          </span>
          {!n.read && (
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--color-accent)" }} />
          )}
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs text-[var(--text-faint)]">{n.body}</p>
      </div>
      <span className="mt-0.5 shrink-0 text-[10px] text-[var(--text-faint)]">{relativeDay(n.at)}</span>
    </button>
  );
}
