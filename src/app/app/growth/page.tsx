"use client";

import { useState, useMemo } from "react";
import { useActiveProjects } from "@/lib/store";
import { PageShell } from "@/components/shell/page-header";
import { Badge, Divider } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { formatDate, relativeDay, daysUntil } from "@/lib/utils";
import { nanoid } from "nanoid";

type ContentStatus = "idea" | "prep" | "planned" | "published";
interface ContentItem {
  id: string;
  title: string;
  projectId: string;
  status: ContentStatus;
}

const COLUMNS: { id: ContentStatus; label: string; color: string }[] = [
  { id: "idea", label: "Fikir", color: "#8a93a3" },
  { id: "prep", label: "Hazırlanıyor", color: "#c79a5b" },
  { id: "planned", label: "Planlandı", color: "#6f9bff" },
  { id: "published", label: "Yayınlandı", color: "#5bb98c" },
];

interface Metric {
  visitors: number;
  signups: number;
  conversion: number; // %
}

// ISO hafta numarası — lansman çakışması tespiti için
function weekKey(iso: string): string {
  const d = new Date(iso);
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
}

export default function GrowthPage() {
  const projects = useActiveProjects();

  // içerik planı (yerel state — store'da content tipi yok)
  const [content, setContent] = useState<ContentItem[]>(() => {
    const seed: ContentItem[] = [];
    projects.slice(0, 4).forEach((p, i) => {
      seed.push({ id: nanoid(6), title: `${p.name} tanıtım postu`, projectId: p.id, status: i % 4 === 0 ? "planned" : "idea" });
      seed.push({ id: nanoid(6), title: `${p.name} demo video`, projectId: p.id, status: i % 2 === 0 ? "prep" : "idea" });
    });
    if (projects[0]) seed.push({ id: nanoid(6), title: `${projects[0].name} Product Hunt lansmanı`, projectId: projects[0].id, status: "planned" });
    if (projects[1]) seed.push({ id: nanoid(6), title: `${projects[1].name} duyuru e-postası`, projectId: projects[1].id, status: "published" });
    return seed;
  });

  const [newTitle, setNewTitle] = useState("");
  const [newProject, setNewProject] = useState(projects[0]?.id ?? "");

  // metrikler (yerel state, düzenlenebilir)
  const [metrics, setMetrics] = useState<Record<string, Metric>>(() => {
    const m: Record<string, Metric> = {};
    projects.forEach((p, i) => {
      const base = p.stage === "live" ? 4200 : p.stage === "beta" ? 1100 : p.stage === "payment" ? 680 : 120;
      m[p.id] = {
        visitors: base + i * 90,
        signups: Math.round(base * 0.08),
        conversion: Math.round((p.mrr > 0 ? 3.2 : 1.1) * 10) / 10,
      };
    });
    return m;
  });

  const launches = useMemo(
    () =>
      projects
        .filter((p) => p.targetLaunch)
        .sort((a, b) => new Date(a.targetLaunch!).getTime() - new Date(b.targetLaunch!).getTime()),
    [projects]
  );

  // çakışma tespiti: aynı hafta içinde >1 lansman
  const weekCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    launches.forEach((p) => {
      const k = weekKey(p.targetLaunch!);
      counts[k] = (counts[k] || 0) + 1;
    });
    return counts;
  }, [launches]);

  function moveItem(id: string, dir: 1 | -1) {
    setContent((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const idx = COLUMNS.findIndex((col) => col.id === c.status);
        const next = COLUMNS[Math.min(COLUMNS.length - 1, Math.max(0, idx + dir))];
        return { ...c, status: next.id };
      })
    );
  }

  function addContent() {
    if (!newTitle.trim() || !newProject) return;
    setContent((prev) => [...prev, { id: nanoid(6), title: newTitle.trim(), projectId: newProject, status: "idea" }]);
    setNewTitle("");
  }

  function updateMetric(pid: string, key: keyof Metric, val: number) {
    setMetrics((m) => ({ ...m, [pid]: { ...m[pid], [key]: Math.max(0, val) } }));
  }

  // trafik karşılaştırması — proje başına ziyaretçi (ince yatay çubuk)
  const traffic = useMemo(() => {
    const rows = projects
      .map((p) => ({ p, visitors: metrics[p.id]?.visitors ?? 0, signups: metrics[p.id]?.signups ?? 0 }))
      .sort((a, b) => b.visitors - a.visitors);
    const max = Math.max(1, ...rows.map((r) => r.visitors));
    const totalVisitors = rows.reduce((a, r) => a + r.visitors, 0);
    const totalSignups = rows.reduce((a, r) => a + r.signups, 0);
    return { rows, max, totalVisitors, totalSignups };
  }, [projects, metrics]);

  const nf = useMemo(() => new Intl.NumberFormat("tr-TR"), []);

  return (
    <PageShell crumbs={[{ label: "Büyüme & Pazarlama" }]}>
      <div className="notion-width mx-auto px-12 pb-20 pt-4 animate-rise">
        <div className="mb-10">
          <h1 className="text-[34px] font-bold leading-tight tracking-[-0.02em] text-[var(--text)]">Büyüme & Pazarlama</h1>
          <p className="mt-1.5 text-[15px] text-[var(--text-faint)]">
            {launches.length} planlı lansman · {content.length} içerik kalemi · {nf.format(traffic.totalVisitors)} ziyaretçi
          </p>
        </div>

        <div className="space-y-12">
          {/* Launch takvimi */}
          <section>
            <h2 className="mb-3 text-[13px] font-semibold text-[var(--text-dim)]">Launch takvimi</h2>
            <div className="relative space-y-0 before:absolute before:left-[5px] before:top-3 before:bottom-3 before:w-px before:bg-[var(--border)]">
              {launches.map((p, i) => {
                const collision = weekCounts[weekKey(p.targetLaunch!)] > 1;
                const dd = daysUntil(p.targetLaunch);
                return (
                  <div key={p.id}>
                    {i > 0 && <Divider className="ml-7" />}
                    <div className="relative flex items-center gap-3 py-2.5 pl-7">
                      <span className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full ring-2 ring-[var(--bg)]" style={{ background: p.color }} />
                      <Icon name={p.icon} size={16} style={{ color: p.color }} />
                      <div className="flex-1">
                        <div className="text-[14px] font-medium text-[var(--text)]">{p.name}</div>
                        <div className="text-[13px] text-[var(--text-faint)]">{formatDate(p.targetLaunch)} · {relativeDay(p.targetLaunch)}</div>
                      </div>
                      {collision && (
                        <Badge color="var(--color-health-warn)" dot>Aynı hafta çakışma</Badge>
                      )}
                      {dd !== null && dd < 0 && <Badge color="var(--color-health-good)">Yayında</Badge>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* İçerik planı kanban */}
          <section>
            <h2 className="mb-3 text-[13px] font-semibold text-[var(--text-dim)]">İçerik planı</h2>
            <div className="mb-5 flex gap-2">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addContent()}
                placeholder="Yeni içerik fikri…"
                className="flex-1 rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-[14px] text-[var(--text)] outline-none focus:border-[var(--text-faint)]"
              />
              <select
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
                className="rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-[14px] text-[var(--text)] outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <Button variant="primary" size="sm" onClick={addContent}><Icon name="Plus" size={15} /> Ekle</Button>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-4">
              {COLUMNS.map((col) => {
                const items = content.filter((c) => c.status === col.id);
                return (
                  <div key={col.id}>
                    <div className="mb-3 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: col.color }} />
                      <span className="text-[12px] font-semibold text-[var(--text-dim)]">{col.label}</span>
                      <span className="ml-auto text-[12px] text-[var(--text-faint)]">{items.length}</span>
                    </div>
                    <div className="space-y-1">
                      {items.map((c) => {
                        const proj = projects.find((p) => p.id === c.projectId);
                        const idx = COLUMNS.findIndex((x) => x.id === col.id);
                        return (
                          <div key={c.id} className="group rounded-md px-2 py-2 transition-colors hover:bg-[var(--bg-hover)]">
                            <div className="mb-1.5 text-[13px] text-[var(--text)]">{c.title}</div>
                            <div className="flex items-center justify-between">
                              {proj ? (
                                <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-faint)]">
                                  <Icon name={proj.icon} size={11} style={{ color: proj.color }} />
                                  {proj.name}
                                </span>
                              ) : <span />}
                              <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                                <button disabled={idx === 0} onClick={() => moveItem(c.id, -1)} className="flex h-5 w-5 items-center justify-center rounded text-[var(--text-faint)] hover:bg-[var(--bg-active)] hover:text-[var(--text)] disabled:opacity-30">
                                  <Icon name="CaretLeft" size={11} />
                                </button>
                                <button disabled={idx === COLUMNS.length - 1} onClick={() => moveItem(c.id, 1)} className="flex h-5 w-5 items-center justify-center rounded text-[var(--text-faint)] hover:bg-[var(--bg-active)] hover:text-[var(--text)] disabled:opacity-30">
                                  <Icon name="CaretRight" size={11} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {items.length === 0 && <div className="px-2 py-3 text-[11px] text-[var(--text-faint)]">boş</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Trafik karşılaştırması — ince yatay çubuk */}
          <section>
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-[13px] font-semibold text-[var(--text-dim)]">Trafik (proje başına)</h2>
              <span className="text-[12px] text-[var(--text-faint)]">
                {nf.format(traffic.totalVisitors)} ziyaretçi · {nf.format(traffic.totalSignups)} kayıt
              </span>
            </div>
            <div className="space-y-3">
              {traffic.rows.map(({ p, visitors, signups }) => {
                const conv = visitors > 0 ? Math.round((signups / visitors) * 1000) / 10 : 0;
                return (
                  <div key={p.id} className="flex items-center gap-3">
                    <Icon name={p.icon} size={14} style={{ color: p.color }} className="shrink-0" />
                    <span className="w-32 shrink-0 truncate text-[13px] text-[var(--text)]">{p.name}</span>
                    <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--bg-active)]">
                      {/* ziyaretçi (silik) */}
                      <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(visitors / traffic.max) * 100}%`, background: "color-mix(in srgb, var(--color-accent) 22%, transparent)" }} />
                      {/* kayıt (aksan) — ziyaretçi içinde oranlı */}
                      <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(signups / traffic.max) * 100}%`, background: "var(--color-accent)" }} />
                    </div>
                    <span className="w-14 shrink-0 text-right text-[13px] tabular-nums text-[var(--text-dim)]">{nf.format(visitors)}</span>
                    <span className="w-10 shrink-0 text-right text-[12px] tabular-nums text-[var(--text-faint)]">%{conv}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-4 text-[11px] text-[var(--text-faint)]">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-3 rounded-full" style={{ background: "color-mix(in srgb, var(--color-accent) 22%, transparent)" }} /> Ziyaretçi
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-3 rounded-full" style={{ background: "var(--color-accent)" }} /> Kayıt
              </span>
              <span className="ml-auto">% = dönüşüm</span>
            </div>
          </section>

          {/* Metrikler — kutusuz satırlar */}
          <section>
            <h2 className="mb-1 text-[13px] font-semibold text-[var(--text-dim)]">Metrikler (proje başına)</h2>
            <div>
              {projects.map((p, i) => {
                const m = metrics[p.id];
                if (!m) return null;
                return (
                  <div key={p.id}>
                    {i > 0 && <Divider />}
                    <div className="flex items-center gap-4 py-3">
                      <div className="flex w-44 shrink-0 items-center gap-2">
                        <Icon name={p.icon} size={16} style={{ color: p.color }} />
                        <span className="truncate text-[14px] font-medium text-[var(--text)]">{p.name}</span>
                      </div>
                      <div className="flex flex-1 items-center justify-end gap-8">
                        <MetricCell label="Ziyaretçi" value={m.visitors} onChange={(v) => updateMetric(p.id, "visitors", v)} step={50} />
                        <MetricCell label="Kayıt" value={m.signups} onChange={(v) => updateMetric(p.id, "signups", v)} step={5} />
                        <MetricCell label="Dönüşüm" value={m.conversion} onChange={(v) => updateMetric(p.id, "conversion", v)} step={0.1} suffix="%" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}

function MetricCell({ label, value, onChange, step, suffix }: { label: string; value: number; onChange: (v: number) => void; step: number; suffix?: string }) {
  return (
    <div className="group/cell flex flex-col items-end gap-0.5">
      <span className="text-[11px] text-[var(--text-faint)]">{label}</span>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(value - step)} className="flex h-4 w-4 items-center justify-center rounded text-[var(--text-faint)] opacity-0 transition-opacity hover:bg-[var(--bg-hover)] hover:text-[var(--text)] group-hover/cell:opacity-100">
          <Icon name="Minus" size={9} />
        </button>
        <span className="min-w-[44px] text-right text-[15px] font-semibold text-[var(--text)]">{Math.round(value * 10) / 10}{suffix}</span>
        <button onClick={() => onChange(value + step)} className="flex h-4 w-4 items-center justify-center rounded text-[var(--text-faint)] opacity-0 transition-opacity hover:bg-[var(--bg-hover)] hover:text-[var(--text)] group-hover/cell:opacity-100">
          <Icon name="Plus" size={9} />
        </button>
      </div>
    </div>
  );
}
