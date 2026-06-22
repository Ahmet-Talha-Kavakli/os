import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date | null | undefined, opts?: Intl.DateTimeFormatOptions) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("tr-TR", opts ?? { day: "numeric", month: "short", year: "numeric" }).format(d);
}

export function daysUntil(date: string | Date | null | undefined): number | null {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}

export function relativeDay(date: string | Date | null | undefined): string {
  const d = daysUntil(date);
  if (d === null) return "—";
  if (d === 0) return "Bugün";
  if (d === 1) return "Yarın";
  if (d === -1) return "Dün";
  if (d < 0) return `${Math.abs(d)} gün geçti`;
  if (d < 7) return `${d} gün kaldı`;
  if (d < 30) return `${Math.round(d / 7)} hafta kaldı`;
  return `${Math.round(d / 30)} ay kaldı`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}
