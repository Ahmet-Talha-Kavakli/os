"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { ProjectAvatar } from "@/components/ui/project-avatar";
import { Avatar } from "@/components/ui/primitives";
import { useStore, useActiveProjects } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/app", label: "Komuta Merkezi", icon: "House" },
  { href: "/app/myday", label: "Bugünüm", icon: "Sun" },
  { href: "/app/projects", label: "Projeler", icon: "SquaresFour" },
  { href: "/app/tasks", label: "Görevler", icon: "CheckSquare" },
  { href: "/app/goals", label: "Hedefler", icon: "Target" },
  { href: "/app/ai", label: "AI Asistan", icon: "Sparkle" },
];

const NAV_WORK = [
  { href: "/app/launch", label: "Launch Merkezi", icon: "RocketLaunch" },
  { href: "/app/finance", label: "Finans", icon: "ChartPieSlice" },
  { href: "/app/growth", label: "Büyüme", icon: "TrendUp" },
  { href: "/app/automations", label: "Otomasyon", icon: "Lightning" },
  { href: "/app/analytics", label: "Analitik", icon: "ChartBar" },
];

const NAV_VAULT = [
  { href: "/app/brain", label: "İkinci Beyin", icon: "Brain" },
  { href: "/app/prompts", label: "Promptlar", icon: "ChatText" },
  { href: "/app/ideas", label: "Fikirler", icon: "Lightbulb" },
  { href: "/app/env", label: "Env Keyleri", icon: "Key" },
  { href: "/app/credentials", label: "Şifreler", icon: "Lock" },
];

function Row({
  href,
  icon,
  label,
  active,
  color,
  trailing,
  leading,
}: {
  href: string;
  icon: string;
  label: string;
  active: boolean;
  color?: string;
  trailing?: React.ReactNode;
  leading?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-2 rounded-md px-2 py-[5px] text-[14px] transition-colors",
        active
          ? "bg-[var(--bg-active)] font-medium text-[var(--text)]"
          : "text-[var(--text-dim)] hover:bg-[var(--bg-hover)]"
      )}
    >
      {leading ?? <Icon name={icon} size={16} style={{ color: color ?? (active ? "var(--text)" : "var(--text-faint)") }} />}
      <span className="flex-1 truncate">{label}</span>
      {trailing}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const projects = useActiveProjects();
  const pages = useStore((s) => s.pages);
  const members = useStore((s) => s.members);
  const me = useStore((s) => s.members.find((m) => m.id === s.currentUserId));
  const setCommandOpen = useStore((s) => s.setCommandOpen);

  const [projOpen, setProjOpen] = useState(true);
  const [pagesOpen, setPagesOpen] = useState(true);
  const favorites = pages.filter((p) => p.favorite);

  return (
    <aside className="flex h-full w-[248px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--sidebar-bg)]">
      {/* workspace header */}
      <button className="flex items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-[var(--bg-hover)]">
        <div className="flex h-[22px] w-[22px] items-center justify-center rounded-md bg-[var(--color-accent)] text-white">
          <Icon name="Hexagon" size={14} weight="fill" />
        </div>
        <span className="flex-1 text-[14px] font-semibold text-[var(--text)]">Founder OS</span>
        <Icon name="CaretUpDown" size={14} className="text-[var(--text-faint)]" />
      </button>

      {/* arama */}
      <div className="px-2 pb-1">
        <button
          onClick={() => setCommandOpen(true)}
          className="flex w-full items-center gap-2 rounded-md px-2 py-[5px] text-[14px] text-[var(--text-faint)] transition-colors hover:bg-[var(--bg-hover)]"
        >
          <Icon name="MagnifyingGlass" size={16} />
          <span className="flex-1 text-left">Ara</span>
          <kbd className="text-[11px] text-[var(--text-faint)]">⌘K</kbd>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        <div className="space-y-px">
          {NAV.map((n) => (
            <Row key={n.href} {...n} active={pathname === n.href} />
          ))}
        </div>

        <Section label="Operasyon">
          {NAV_WORK.map((n) => (
            <Row key={n.href} {...n} active={pathname === n.href} />
          ))}
        </Section>

        <Section label="Kasa">
          {NAV_VAULT.map((n) => (
            <Row key={n.href} {...n} active={pathname === n.href} />
          ))}
        </Section>

        {favorites.length > 0 && (
          <Section label="Favoriler">
            {favorites.map((p) => (
              <Row
                key={p.id}
                href={`/app/page/${p.id}`}
                icon={p.icon}
                label={p.title}
                active={pathname === `/app/page/${p.id}`}
              />
            ))}
          </Section>
        )}

        <Section
          label="Projeler"
          count={projects.length}
          collapsible
          open={projOpen}
          onToggle={() => setProjOpen((v) => !v)}
        >
          {projOpen &&
            projects.map((p) => (
              <Row
                key={p.id}
                href={`/app/projects/${p.id}`}
                icon={p.icon}
                label={p.name}
                color={p.color}
                active={pathname === `/app/projects/${p.id}`}
                leading={<ProjectAvatar project={p} size={16} />}
                trailing={<span className="h-1.5 w-1.5 rounded-full" style={{ background: `var(--color-health-${p.health})` }} />}
              />
            ))}
        </Section>

        <Section
          label="Sayfalar"
          count={pages.length}
          collapsible
          open={pagesOpen}
          onToggle={() => setPagesOpen((v) => !v)}
        >
          {pagesOpen &&
            pages.map((p) => (
              <Row
                key={p.id}
                href={`/app/page/${p.id}`}
                icon={p.icon}
                label={p.title}
                active={pathname === `/app/page/${p.id}`}
              />
            ))}
        </Section>
      </nav>

      {/* alt: arşiv + kullanıcı */}
      <div className="border-t border-[var(--border)] px-2 pt-1.5">
        <Row href="/app/archive" icon="Archive" label="Arşiv" active={pathname === "/app/archive"} />
      </div>
      <div className="flex items-center gap-2 px-3 py-2">
        {me && <Avatar name={me.name} color={me.avatarColor} size={22} />}
        <div className="flex flex-1 flex-col leading-tight">
          <span className="text-[13px] font-medium text-[var(--text)]">{me?.name}</span>
          <span className="text-[11px] text-[var(--text-faint)]">{members.length} üye</span>
        </div>
        <Link href="/app/settings" className="rounded-md p-1.5 text-[var(--text-faint)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text)]" title="Ayarlar">
          <Icon name="Gear" size={15} />
        </Link>
        <button
          onClick={async () => { await fetch("/api/auth", { method: "DELETE" }); window.location.href = "/login"; }}
          className="rounded-md p-1.5 text-[var(--text-faint)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text)]"
          title="Çıkış yap"
        >
          <Icon name="SignOut" size={15} />
        </button>
      </div>
    </aside>
  );
}

function Section({
  label,
  count,
  collapsible,
  open,
  onToggle,
  children,
}: {
  label: string;
  count?: number;
  collapsible?: boolean;
  open?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5">
      <button
        onClick={onToggle}
        disabled={!collapsible}
        className="group flex w-full items-center gap-1 px-2 pb-0.5 text-[12px] font-medium text-[var(--text-faint)] hover:text-[var(--text-dim)]"
      >
        {collapsible && (
          <Icon name="CaretRight" size={10} className={cn("transition-transform", open && "rotate-90")} />
        )}
        <span>{label}</span>
        {count !== undefined && <span className="ml-auto font-normal opacity-60">{count}</span>}
      </button>
      <div className="space-y-px">{children}</div>
    </div>
  );
}
