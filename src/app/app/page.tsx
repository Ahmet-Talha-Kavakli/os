"use client";

import Link from "next/link";
import { useStore, useActiveProjects } from "@/lib/store";
import { PageShell } from "@/components/shell/page-header";
import { Stat, StatRow } from "@/components/ui/stat";
import { Badge, ProgressBar, Avatar, Divider } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { ProjectAvatar } from "@/components/ui/project-avatar";
import { STAGES } from "@/lib/constants";
import { relativeDay, daysUntil, cn } from "@/lib/utils";

export default function Dashboard() {
  const projects = useActiveProjects();
  const tasks = useStore((s) => s.tasks);
  const goals = useStore((s) => s.goals);
  const activities = useStore((s) => s.activities);
  const members = useStore((s) => s.members);
  const toggleTaskDone = useStore((s) => s.toggleTaskDone);

  const live = projects.filter((p) => p.stage === "live").length;
  const totalMrr = projects.reduce((a, p) => a + p.mrr, 0);
  const totalCost = projects.reduce((a, p) => a + p.monthlyCost, 0);
  const openTasks = tasks.filter((t) => t.status !== "done").length;

  const myToday = tasks
    .filter((t) => t.status !== "done" && t.dueDate && daysUntil(t.dueDate)! <= 2)
    .sort((a, b) => daysUntil(a.dueDate)! - daysUntil(b.dueDate)!);

  const hour = new Date().getHours();
  const greeting = hour < 6 ? "İyi geceler" : hour < 12 ? "Günaydın" : hour < 18 ? "İyi günler" : "İyi akşamlar";

  return (
    <PageShell crumbs={[{ label: "Komuta Merkezi" }]}>
      <div className="notion-width mx-auto px-12 pb-20 pt-4 animate-rise">
        <div className="mb-10">
          <h1 className="text-[34px] font-bold leading-tight tracking-[-0.02em] text-[var(--text)]">{greeting}</h1>
          <p className="mt-1.5 text-[15px] text-[var(--text-faint)]">
            {projects.length} aktif proje · {openTasks} açık görev · {live} yayında
          </p>
        </div>

        <StatRow className="mb-10 grid-cols-4">
          <Stat label="Aktif proje" value={projects.length} />
          <Stat label="Aylık gelir" value={totalMrr} prefix="$" />
          <Stat label="Aylık gider" value={totalCost} prefix="$" />
          <Stat label="Açık görev" value={openTasks} />
        </StatRow>

        {/* pipeline şeridi — projelerin aşama dağılımı (boşsa gizle) */}
        {projects.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-2 text-[13px] font-semibold text-[var(--text-dim)]">Pipeline</h2>
          <div className="flex h-1.5 gap-px overflow-hidden rounded-full bg-[var(--bg-active)]">
            {STAGES.filter((s) => s.id !== "archived").map((s) => {
              const n = projects.filter((p) => p.stage === s.id).length;
              if (n === 0) return null;
              return (
                <div
                  key={s.id}
                  className="h-full first:rounded-l-full last:rounded-r-full"
                  style={{ width: `${(n / projects.length) * 100}%`, background: s.color }}
                  title={`${s.label}: ${n}`}
                />
              );
            })}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {STAGES.filter((s) => s.id !== "archived").map((s) => {
              const n = projects.filter((p) => p.stage === s.id).length;
              if (n === 0) return null;
              return (
                <span key={s.id} className="flex items-center gap-1.5 text-[12px] text-[var(--text-faint)]">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
                  {s.label} <span className="text-[var(--text-dim)]">{n}</span>
                </span>
              );
            })}
          </div>
        </section>
        )}

        {/* boş başlangıç — hızlı başlangıç kartları */}
        {projects.length === 0 && (
          <section className="mb-12">
            <h2 className="mb-3 text-[13px] font-semibold text-[var(--text-dim)]">Başla</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {[
                { icon: "SquaresFour", label: "İlk projeni ekle", href: "/app/projects" },
                { icon: "CheckSquare", label: "Bir görev oluştur", href: "/app/tasks" },
                { icon: "FileText", label: "Bir sayfa yaz", href: "/app/brain" },
              ].map((c) => (
                <Link key={c.href} href={c.href} className="flex items-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-raised)] px-3.5 py-3 text-[14px] text-[var(--text-dim)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text)]">
                  <Icon name={c.icon} size={17} style={{ color: "var(--color-accent)" }} />
                  {c.label}
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 gap-x-14 gap-y-12 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-12">
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-[var(--text-dim)]">Bugün odaklan</h2>
                <Link href="/app/myday" className="text-[13px] text-[var(--text-faint)] hover:text-[var(--text)]">Tümü</Link>
              </div>
              {myToday.length === 0 ? (
                <p className="py-6 text-[14px] text-[var(--text-faint)]">Yaklaşan deadline'ı olan iş yok. İyi gidiyorsun.</p>
              ) : (
                <div>
                  {myToday.map((t, i) => {
                    const proj = projects.find((p) => p.id === t.projectId);
                    const dd = daysUntil(t.dueDate);
                    return (
                      <div key={t.id}>
                        {i > 0 && <Divider />}
                        <div className="group flex items-center gap-3 py-2.5">
                          <button onClick={() => toggleTaskDone(t.id)} className="shrink-0 text-[var(--text-faint)] transition-colors hover:text-[var(--color-accent)]">
                            <Icon name="Circle" size={17} />
                          </button>
                          <span className="flex-1 text-[14px] text-[var(--text)]">{t.title}</span>
                          {proj && (
                            <span className="flex items-center gap-1.5 text-[13px] text-[var(--text-faint)]">
                              <Icon name={proj.icon} size={13} style={{ color: proj.color }} />
                              {proj.name}
                            </span>
                          )}
                          <span className={cn("w-24 text-right text-[13px]", dd! <= 0 ? "text-[var(--color-health-risk)]" : "text-[var(--text-faint)]")}>
                            {relativeDay(t.dueDate)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-[var(--text-dim)]">Projeler</h2>
                <Link href="/app/projects" className="text-[13px] text-[var(--text-faint)] hover:text-[var(--text)]">Tümü</Link>
              </div>
              <div>
                {projects.slice(0, 7).map((p, i) => {
                  const stage = STAGES.find((s) => s.id === p.stage)!;
                  return (
                    <div key={p.id}>
                      {i > 0 && <Divider />}
                      <Link href={`/app/projects/${p.id}`} className="group flex items-center gap-3 py-2.5">
                        <ProjectAvatar project={p} size={18} rounded="lg" />
                        <span className="w-32 shrink-0 truncate text-[14px] font-medium text-[var(--text)] group-hover:text-[var(--color-accent)]">{p.name}</span>
                        <Badge color={stage.color}>{stage.label}</Badge>
                        <div className="flex flex-1 items-center gap-2">
                          <ProgressBar value={p.progress} color={p.color} />
                          <span className="w-9 text-right text-[12px] text-[var(--text-faint)]">%{p.progress}</span>
                        </div>
                        {p.targetLaunch && <span className="w-20 text-right text-[13px] text-[var(--text-faint)]">{relativeDay(p.targetLaunch)}</span>}
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: `var(--color-health-${p.health})` }} />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="space-y-12">
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-[var(--text-dim)]">Çeyrek hedefleri</h2>
                <Link href="/app/goals" className="text-[13px] text-[var(--text-faint)] hover:text-[var(--text)]">Tümü</Link>
              </div>
              <div className="space-y-4">
                {goals.map((g) => {
                  const kr = g.keyResults[0];
                  const pct = kr ? Math.round((kr.current / kr.target) * 100) : 0;
                  return (
                    <Link key={g.id} href="/app/goals" className="block">
                      <div className="mb-1.5 flex items-center gap-2">
                        <span className="flex-1 truncate text-[14px] text-[var(--text)]">{g.title}</span>
                        <span className="text-[12px] text-[var(--text-faint)]">%{pct}</span>
                      </div>
                      <ProgressBar value={pct} color={g.status === "on_track" ? "var(--color-health-good)" : g.status === "at_risk" ? "var(--color-health-warn)" : "var(--color-health-risk)"} />
                    </Link>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-[13px] font-semibold text-[var(--text-dim)]">Son aktivite</h2>
              <div className="space-y-3">
                {activities.slice(0, 7).map((a) => {
                  const actor = members.find((m) => m.id === a.actorId);
                  return (
                    <div key={a.id} className="flex items-center gap-2.5">
                      {actor && <Avatar name={actor.name} color={actor.avatarColor} size={20} />}
                      <span className="flex-1 text-[13px] text-[var(--text-dim)]">
                        <span className="font-medium text-[var(--text)]">{actor?.name}</span> {a.verb}{" "}
                        <span className="text-[var(--text)]">{a.targetLabel}</span>
                      </span>
                      <span className="text-[12px] text-[var(--text-faint)]">{relativeDay(a.at)}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
