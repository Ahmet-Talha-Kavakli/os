"use client";

import type { ReactNode } from "react";
import { Topbar } from "./topbar";

export function PageShell({
  crumbs,
  title,
  children,
}: {
  crumbs?: { label: string; href?: string }[];
  title?: string;
  children: ReactNode;
}) {
  return (
    <>
      <Topbar crumbs={crumbs} title={title} />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </>
  );
}

export function PageHero({
  title,
  subtitle,
  icon,
  actions,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <h1 className="text-[32px] font-bold leading-tight tracking-[-0.02em] text-[var(--text)]">{title}</h1>
          {subtitle && <p className="mt-1 text-[14px] text-[var(--text-faint)]">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
