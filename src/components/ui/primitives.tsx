"use client";

import { cn, initials } from "@/lib/utils";
import type { ReactNode } from "react";

/* Badge — Notion etiketi: yumuşak pastel zemin, küçük, ölçülü */
export function Badge({
  children,
  color,
  className,
  dot,
}: {
  children: ReactNode;
  color?: string;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[12px] font-medium leading-none",
        className
      )}
      style={
        color
          ? { background: `color-mix(in srgb, ${color} 13%, transparent)`, color: `color-mix(in srgb, ${color} 78%, var(--text))` }
          : { background: "var(--bg-hover)", color: "var(--text-dim)" }
      }
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: color ?? "currentColor" }} />}
      {children}
    </span>
  );
}

export function Avatar({ name, color, size = 22 }: { name: string; color: string; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-medium text-white"
      style={{ width: size, height: size, background: color, fontSize: size * 0.42 }}
      title={name}
    >
      {initials(name)}
    </span>
  );
}

/*
  Card — Notion ruhunda KUTUSUZ konteyner.
  Varsayılan: hiç border/gölge yok, sadece içerik. hover ile çok hafif zemin.
  bordered prop'u SADECE gerçekten gerekince ince çizgi verir.
*/
export function Card({
  children,
  className,
  hover,
  bordered,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  bordered?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-[var(--radius-card)]",
        bordered && "border border-[var(--border)] bg-[var(--bg-raised)]",
        hover && "transition-colors duration-150 hover:bg-[var(--bg-hover)]",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

/* İnce ayraç — Notion kutu yerine çizgi kullanır */
export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-[var(--border)]", className)} />;
}

export function ProgressBar({ value, color }: { value: number; color?: string }) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--bg-active)]">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color ?? "var(--text-faint)" }}
      />
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-[var(--border)] px-1 text-[10px] font-medium text-[var(--text-faint)]">
      {children}
    </kbd>
  );
}

export function EmptyState({
  icon,
  title,
  desc,
  action,
}: {
  icon?: ReactNode;
  title: string;
  desc?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center animate-fade">
      {icon && <div className="text-[var(--text-faint)] opacity-50">{icon}</div>}
      <div className="text-[15px] font-medium text-[var(--text)]">{title}</div>
      {desc && <div className="max-w-sm text-sm text-[var(--text-faint)]">{desc}</div>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/* Bölüm başlığı — Notion'da küçük, silik, harf aralıklı değil */
export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h2 className="text-[13px] font-semibold text-[var(--text-dim)]">{children}</h2>
      {action}
    </div>
  );
}
