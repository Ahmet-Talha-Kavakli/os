"use client";

import NumberFlow from "@number-flow/react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/*
  Stat — Notion ruhunda KUTUSUZ metrik.
  Dev kart yok: küçük silik etiket + büyük sade sayı, çizgiyle ayrılır.
  Birden çok Stat yan yana konursa StatRow ile ince dikey çizgilerle ayrılır.
*/
export function Stat({
  label,
  value,
  prefix,
  suffix,
  icon,
  trend,
  color,
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon?: ReactNode;
  trend?: { dir: "up" | "down"; value: string };
  color?: string;
}) {
  return (
    <div className="flex flex-col gap-1 px-1 py-1">
      <span className="flex items-center gap-1.5 text-[13px] text-[var(--text-faint)]">
        {label}
      </span>
      <div className="flex items-baseline gap-1 text-[26px] font-semibold tracking-tight text-[var(--text)]">
        {prefix && <span className="text-[18px] font-medium text-[var(--text-dim)]">{prefix}</span>}
        <NumberFlow value={value} />
        {suffix && <span className="text-[15px] font-normal text-[var(--text-faint)]">{suffix}</span>}
      </div>
      {trend && (
        <span className={cn("text-[12px] font-medium", trend.dir === "up" ? "text-[var(--color-health-good)]" : "text-[var(--color-health-risk)]")}>
          {trend.dir === "up" ? "↑" : "↓"} {trend.value}
        </span>
      )}
    </div>
  );
}

/* Statları yan yana koyup ince dikey çizgilerle ayıran konteyner (Notion gibi) */
export function StatRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid divide-x divide-[var(--border)]", className)}>
      {children}
    </div>
  );
}

/* Yükleme — sade, sessiz */
export function FluxLoader({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--text-faint)]" style={{ animationDuration: "0.7s" }} />
      {label && <span className="text-sm text-[var(--text-faint)]">{label}</span>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded bg-[var(--bg-hover)]", className)}
      style={{ animationDuration: "1.6s" }}
    />
  );
}
