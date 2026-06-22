"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { PageShell } from "@/components/shell/page-header";
import { Divider, EmptyState } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { STAGES } from "@/lib/constants";
import { cn, relativeDay } from "@/lib/utils";

export default function ArchivePage() {
  const allProjects = useStore((s) => s.projects);
  const trash = useStore((s) => s.trash);
  const updateProject = useStore((s) => s.updateProject);
  const deleteProject = useStore((s) => s.deleteProject);
  const restore = useStore((s) => s.restore);
  const emptyTrash = useStore((s) => s.emptyTrash);

  const archived = useMemo(() => allProjects.filter((p) => p.archived), [allProjects]);
  const [tab, setTab] = useState<"archive" | "trash">("archive");

  const tabCls = (active: boolean) =>
    cn("relative -mb-px px-1 pb-2.5 text-[14px] font-medium outline-none transition-colors",
      active ? "text-[var(--text)] after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:bg-[var(--text)]" : "text-[var(--text-faint)] hover:text-[var(--text-dim)]");

  return (
    <PageShell crumbs={[{ label: "Arşiv" }]}>
      <div className="notion-width mx-auto px-12 pb-20 pt-4 animate-rise">
        <div className="mb-6">
          <h1 className="text-[34px] font-bold leading-tight tracking-[-0.02em] text-[var(--text)]">Arşiv</h1>
          <p className="mt-1.5 text-[15px] text-[var(--text-faint)]">Arşivlediğin projeler ve sildiğin her şey burada.</p>
        </div>

        <div className="mb-6 flex items-center gap-5 border-b border-[var(--border)]">
          <button className={tabCls(tab === "archive")} onClick={() => setTab("archive")}>Arşivlenenler {archived.length > 0 && <span className="text-[var(--text-faint)]">{archived.length}</span>}</button>
          <button className={tabCls(tab === "trash")} onClick={() => setTab("trash")}>Çöp Kutusu {trash.length > 0 && <span className="text-[var(--text-faint)]">{trash.length}</span>}</button>
        </div>

        {tab === "archive" ? (
          archived.length === 0 ? (
            <EmptyState icon={<Icon name="Archive" size={40} />} title="Arşiv boş" desc="Bir projeyi arşivlediğinde burada görünür." />
          ) : (
            <div>
              {archived.map((p, i) => {
                const stage = STAGES.find((s) => s.id === p.stage);
                return (
                  <div key={p.id}>
                    {i > 0 && <Divider />}
                    <div className="group flex items-center gap-3 py-3">
                      <Icon name={p.icon} size={18} style={{ color: p.color }} />
                      <div className="flex-1">
                        <div className="text-[14px] font-medium text-[var(--text)]">{p.name}</div>
                        <div className="text-[12px] text-[var(--text-faint)]">{stage?.label} · başladı {relativeDay(p.startedAt)}</div>
                      </div>
                      <Button variant="subtle" size="sm" onClick={() => updateProject(p.id, { archived: false })}>
                        <Icon name="ArrowCounterClockwise" size={14} /> Geri yükle
                      </Button>
                      <button onClick={() => deleteProject(p.id)} className="rounded-md p-1.5 text-[var(--text-faint)] opacity-0 transition-opacity hover:bg-[var(--bg-hover)] hover:text-[var(--color-health-risk)] group-hover:opacity-100" title="Çöpe taşı">
                        <Icon name="Trash" size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : trash.length === 0 ? (
          <EmptyState icon={<Icon name="Trash" size={40} />} title="Çöp kutusu boş" desc="Sildiğin öğeler buraya düşer, geri alabilirsin." />
        ) : (
          <div>
            <div className="mb-3 flex justify-end">
              <Button variant="ghost" size="sm" onClick={emptyTrash}><Icon name="TrashSimple" size={14} /> Çöpü boşalt</Button>
            </div>
            {trash.map((t, i) => (
              <div key={t.id}>
                {i > 0 && <Divider />}
                <div className="group flex items-center gap-3 py-3">
                  <Icon name={t.kind === "project" ? "SquaresFour" : t.kind === "task" ? "CheckSquare" : "FileText"} size={16} className="text-[var(--text-faint)]" />
                  <div className="flex-1">
                    <div className="text-[14px] text-[var(--text)]">{t.label}</div>
                    <div className="text-[12px] text-[var(--text-faint)]">{t.kind === "project" ? "Proje" : t.kind === "task" ? "Görev" : "Sayfa"} · silindi {relativeDay(t.deletedAt)}</div>
                  </div>
                  <Button variant="subtle" size="sm" onClick={() => restore(t.id)}>
                    <Icon name="ArrowCounterClockwise" size={14} /> Geri yükle
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
