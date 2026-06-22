"use client";

import { useState, useMemo } from "react";
import * as Switch from "@radix-ui/react-switch";
import { useStore, useActiveProjects } from "@/lib/store";
import { PageShell } from "@/components/shell/page-header";
import { Stat, StatRow } from "@/components/ui/stat";
import { Divider } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

const TRIGGERS = [
  "Görev → Bitti",
  "Deadline geçti",
  "Aşama → Yayında",
  "Yeni proje oluşturuldu",
  "Sağlık → Riskli",
  "Her Pazartesi 09:00",
];

const ACTIONS = [
  "Proje ilerlemesini yeniden hesapla",
  "Sağlık → Riskli",
  "Launch checklist'i tamamla",
  "Standup sayfası oluştur",
  "Bildirim gönder",
  "Slack'e mesaj at",
];

export default function AutomationsPage() {
  const automations = useStore((s) => s.automations);
  const projects = useActiveProjects();
  const addAutomation = useStore((s) => s.addAutomation);
  const updateAutomation = useStore((s) => s.updateAutomation);
  const deleteAutomation = useStore((s) => s.deleteAutomation);
  const toggleAutomation = useStore((s) => s.toggleAutomation);

  const [trigger, setTrigger] = useState(TRIGGERS[0]);
  const [action, setAction] = useState(ACTIONS[0]);

  const enabledCount = useMemo(() => automations.filter((a) => a.enabled).length, [automations]);
  const totalRuns = useMemo(() => automations.reduce((a, r) => a + r.runs, 0), [automations]);

  function createRule() {
    addAutomation({ name: `${trigger} → ${action}`, trigger, action });
  }

  const selectCls = "flex-1 bg-transparent text-[14px] text-[var(--text)] outline-none";

  return (
    <PageShell crumbs={[{ label: "Otomasyonlar" }]}>
      <div className="notion-width mx-auto px-12 pb-20 pt-4 animate-rise">
        <div className="mb-10">
          <h1 className="text-[34px] font-bold leading-tight tracking-[-0.02em] text-[var(--text)]">Otomasyonlar</h1>
          <p className="mt-1.5 text-[15px] text-[var(--text-faint)]">
            {enabledCount}/{automations.length} kural aktif · toplam {totalRuns} çalıştırma
          </p>
        </div>

        <StatRow className="mb-12 grid-cols-3">
          <Stat label="Aktif kural" value={enabledCount} />
          <Stat label="Toplam kural" value={automations.length} />
          <Stat label="Toplam çalıştırma" value={totalRuns} />
        </StatRow>

        <div className="space-y-12">
          {/* kural builder — sade vurgulu blok */}
          <section>
            <h2 className="mb-3 text-[13px] font-semibold text-[var(--text-dim)]">Yeni kural oluştur</h2>
            <div className="flex flex-col items-stretch gap-3 rounded-[var(--radius-card)] bg-[var(--bg-hover)] px-4 py-3 md:flex-row md:items-center">
              <div className="flex flex-1 items-center gap-2.5">
                <span className="rounded bg-[color-mix(in_srgb,var(--color-accent)_13%,transparent)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--color-accent)]">EĞER</span>
                <select value={trigger} onChange={(e) => setTrigger(e.target.value)} className={selectCls}>
                  {TRIGGERS.map((t) => <option key={t} value={t} className="bg-[var(--bg-raised)]">{t}</option>)}
                </select>
              </div>
              <Icon name="ArrowRight" size={16} className="mx-auto shrink-0 text-[var(--text-faint)]" />
              <div className="flex flex-1 items-center gap-2.5">
                <span className="rounded bg-[color-mix(in_srgb,var(--color-health-good)_13%,transparent)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--color-health-good)]">İSE</span>
                <select value={action} onChange={(e) => setAction(e.target.value)} className={selectCls}>
                  {ACTIONS.map((a) => <option key={a} value={a} className="bg-[var(--bg-raised)]">{a}</option>)}
                </select>
              </div>
              <Button variant="primary" onClick={createRule}><Icon name="Plus" size={16} /> Kural ekle</Button>
            </div>
          </section>

          {/* kural listesi — divider satırları */}
          <section>
            <h2 className="mb-3 text-[13px] font-semibold text-[var(--text-dim)]">Kurallar</h2>
            <div>
              {automations.length === 0 && (
                <p className="py-6 text-[14px] text-[var(--text-faint)]">Henüz kural yok. Yukarıdan ilk kuralını oluştur.</p>
              )}
              {automations.map((a, i) => (
                <RuleRow
                  key={a.id}
                  first={i === 0}
                  name={a.name}
                  trigger={a.trigger}
                  action={a.action}
                  runs={a.runs}
                  enabled={a.enabled}
                  onToggle={() => toggleAutomation(a.id)}
                  onRename={(name) => updateAutomation(a.id, { name })}
                  onDelete={() => deleteAutomation(a.id)}
                />
              ))}
            </div>
          </section>

          {/* GitHub entegrasyonu — divider satırları */}
          <section>
            <h2 className="mb-3 text-[13px] font-semibold text-[var(--text-dim)]">GitHub entegrasyonu</h2>
            <div>
              {projects.map((p, i) => {
                const connected = !!p.repoUrl;
                // makul sahte veri (her proje için tutarlı)
                const branches = ["main", "develop", "feat/payments", "fix/render"];
                const buildOk = i % 3 !== 2;
                const openPrs = (i * 2) % 4;
                const commitMins = (i + 1) * 23;
                return (
                  <div key={p.id}>
                    {i > 0 && <Divider />}
                    <div className="flex items-center gap-3 py-3">
                      <Icon name="GithubLogo" size={17} className="shrink-0 text-[var(--text-dim)]" />
                      <span className="w-36 shrink-0 truncate text-[14px] font-medium text-[var(--text)]">{p.name}</span>
                      {connected ? (
                        <>
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--color-health-good)" }} title="Bağlı" />
                          <span className="flex-1 items-center gap-4 text-[13px] text-[var(--text-faint)] sm:flex">
                            <span className="inline-flex items-center gap-1.5"><Icon name="GitCommit" size={13} /> {commitMins} dk · {branches[i % branches.length]}</span>
                            <span className="inline-flex items-center gap-1.5" style={{ color: buildOk ? "var(--color-health-good)" : "var(--color-health-risk)" }}>
                              <Icon name={buildOk ? "CheckCircle" : "XCircle"} size={13} /> {buildOk ? "Build OK" : "Build hata"}
                            </span>
                            <span className="inline-flex items-center gap-1.5"><Icon name="GitPullRequest" size={13} /> {openPrs} PR</span>
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 truncate text-[13px] text-[var(--text-faint)]">henüz repo bağlanmadı</span>
                          <Button variant="ghost" size="sm"><Icon name="Plug" size={14} /> Bağla</Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-[12px] text-[var(--text-faint)]">
              Bu panel bir iskelettir — gerçek GitHub API bağlantısı henüz aktif değil.
            </p>
          </section>
        </div>
      </div>
    </PageShell>
  );
}

function RuleRow({
  name, trigger, action, runs, enabled, first, onToggle, onRename, onDelete,
}: {
  name: string; trigger: string; action: string; runs: number; enabled: boolean; first: boolean; onToggle: () => void; onRename: (v: string) => void; onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  return (
    <>
      {!first && <Divider />}
      <div className="group flex items-center gap-3 py-3.5">
        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              autoFocus value={name}
              onChange={(e) => onRename(e.target.value)}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-raised)] px-2 py-1 text-[14px] font-medium text-[var(--text)] outline-none"
            />
          ) : (
            <button onClick={() => setEditing(true)} className="block text-left text-[14px] font-medium text-[var(--text)] hover:text-[var(--color-accent)]" title="Adı düzenle">{name}</button>
          )}
          <div className="mt-1 flex items-center gap-2 text-[12px]">
            <span className="text-[var(--color-accent)]">EĞER</span>
            <span className="text-[var(--text-faint)]">{trigger}</span>
            <Icon name="ArrowRight" size={12} className="text-[var(--text-faint)]" />
            <span className="text-[var(--color-health-good)]">İSE</span>
            <span className="text-[var(--text-faint)]">{action}</span>
          </div>
        </div>
        <span className="shrink-0 text-[12px] text-[var(--text-faint)]">{runs} kez</span>
        <Switch.Root
          checked={enabled}
          onCheckedChange={onToggle}
          className="relative h-5 w-9 shrink-0 cursor-pointer rounded-full bg-[var(--bg-active)] transition-colors data-[state=checked]:bg-[var(--color-accent)]"
        >
          <Switch.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform duration-200 data-[state=checked]:translate-x-[18px]" />
        </Switch.Root>
        <button onClick={onDelete} className="shrink-0 rounded-md p-1 text-[var(--text-faint)] opacity-0 transition-opacity hover:text-[var(--color-health-risk)] group-hover:opacity-100" title="Sil">
          <Icon name="Trash" size={14} />
        </button>
      </div>
    </>
  );
}
