import type { Stage, Health, Priority, TaskStatus, ViewKind } from "./types";

export const STAGES: { id: Stage; label: string; color: string; icon: string }[] = [
  { id: "idea", label: "Fikir", color: "var(--color-stage-idea)", icon: "Lightbulb" },
  { id: "mvp", label: "MVP", color: "var(--color-stage-mvp)", icon: "Rocket" },
  { id: "payment", label: "Ödeme Entegrasyonu", color: "var(--color-stage-payment)", icon: "CreditCard" },
  { id: "beta", label: "Beta", color: "var(--color-stage-beta)", icon: "Flask" },
  { id: "live", label: "Yayında", color: "var(--color-stage-live)", icon: "CheckCircle" },
  { id: "archived", label: "Arşiv", color: "var(--color-stage-archived)", icon: "Archive" },
];

export const HEALTH: Record<Health, { label: string; color: string }> = {
  good: { label: "Sağlıklı", color: "var(--color-health-good)" },
  warn: { label: "Dikkat", color: "var(--color-health-warn)" },
  risk: { label: "Riskli", color: "var(--color-health-risk)" },
};

export const PRIORITIES: Record<Priority, { label: string; color: string; short: string }> = {
  p0: { label: "Acil", color: "#d96b6b", short: "P0" },
  p1: { label: "Yüksek", color: "#d4a85a", short: "P1" },
  p2: { label: "Orta", color: "#6f9bff", short: "P2" },
  p3: { label: "Düşük", color: "#8a93a3", short: "P3" },
};

export const TASK_STATUS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "backlog", label: "Backlog", color: "#6b7689" },
  { id: "todo", label: "Yapılacak", color: "#8a93a3" },
  { id: "in_progress", label: "Devam Eden", color: "#6f9bff" },
  { id: "review", label: "İncelemede", color: "#c79a5b" },
  { id: "done", label: "Bitti", color: "#5bb98c" },
];

export const VIEWS: { id: ViewKind; label: string; icon: string }[] = [
  { id: "board", label: "Pano", icon: "Kanban" },
  { id: "table", label: "Tablo", icon: "Table" },
  { id: "calendar", label: "Takvim", icon: "CalendarBlank" },
  { id: "timeline", label: "Zaman Çizelgesi", icon: "ChartGantt" },
  { id: "list", label: "Liste", icon: "ListBullets" },
  { id: "goals", label: "Hedefler", icon: "Target" },
];

export const AVATAR_COLORS = ["#5b8cff", "#c79a5b", "#b07fd6", "#5bb98c", "#d96b6b", "#6f9bff"];
