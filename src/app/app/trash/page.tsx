"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { PageShell, PageHero } from "@/components/shell/page-header";
import { Card, Badge, EmptyState, SectionTitle } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { relativeDay } from "@/lib/utils";

const KIND_META: Record<"project" | "task" | "page", { label: string; icon: string; color: string }> = {
  project: { label: "Projeler", icon: "SquaresFour", color: "var(--color-accent)" },
  task: { label: "Görevler", icon: "CheckSquare", color: "var(--color-stage-payment)" },
  page: { label: "Sayfalar", icon: "FileText", color: "var(--color-stage-beta)" },
};

const ORDER: ("project" | "task" | "page")[] = ["project", "task", "page"];

export default function TrashPage() {
  const trash = useStore((s) => s.trash);
  const restore = useStore((s) => s.restore);
  const emptyTrash = useStore((s) => s.emptyTrash);
  const [confirming, setConfirming] = useState(false);

  const grouped = ORDER.map((kind) => ({
    kind,
    items: trash.filter((t) => t.kind === kind),
  })).filter((g) => g.items.length > 0);

  return (
    <PageShell crumbs={[{ label: "Çöp Kutusu" }]}>
      <div className="mx-auto max-w-4xl px-6 py-6 animate-rise">
        <PageHero
          title="Çöp Kutusu"
          subtitle={
            trash.length > 0
              ? `${trash.length} öğe silindi · geri yüklenebilir`
              : "Silinen öğeler burada birikir"
          }
          icon={
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-hover)]">
              <Icon name="Trash" size={20} style={{ color: "var(--color-health-risk)" }} />
            </div>
          }
          actions={
            trash.length > 0 ? (
              confirming ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-faint)]">Emin misin?</span>
                  <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                    Vazgeç
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      emptyTrash();
                      setConfirming(false);
                    }}
                  >
                    <Icon name="Trash" size={14} /> Kalıcı sil
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setConfirming(true)}>
                  <Icon name="Trash" size={14} /> Çöpü boşalt
                </Button>
              )
            ) : undefined
          }
        />

        {trash.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Icon name="Trash" size={40} />}
              title="Çöp kutusu boş"
              desc="Sildiğin projeler, görevler ve sayfalar buraya düşer. Buradan geri yükleyebilir veya kalıcı silebilirsin."
            />
          </Card>
        ) : (
          <div className="space-y-6">
            {grouped.map((g) => {
              const meta = KIND_META[g.kind];
              return (
                <div key={g.kind}>
                  <SectionTitle>
                    <span className="flex items-center gap-1.5">
                      <Icon name={meta.icon} size={13} style={{ color: meta.color }} />
                      {meta.label} · {g.items.length}
                    </span>
                  </SectionTitle>
                  <Card className="p-1.5">
                    <div className="divide-y divide-[var(--border)]">
                      {g.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-[var(--bg-hover)]"
                        >
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                            style={{ background: `color-mix(in srgb, ${meta.color} 14%, transparent)` }}
                          >
                            <Icon name={meta.icon} size={16} style={{ color: meta.color }} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-[var(--text)]">
                              {item.label}
                            </div>
                            <div className="text-xs text-[var(--text-faint)]">
                              {relativeDay(item.deletedAt)} silindi
                            </div>
                          </div>
                          <Badge>{meta.label.slice(0, -3)}</Badge>
                          <Button variant="subtle" size="sm" onClick={() => restore(item.id)}>
                            <Icon name="ArrowCounterClockwise" size={14} /> Geri yükle
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              );
            })}

            <p className="px-1 text-xs text-[var(--text-faint)]">
              <Icon name="Info" size={12} className="-mt-0.5 mr-1 inline" />
              Çöpü boşaltmak geri alınamaz. Geri yüklemek için tek tek{" "}
              <Link href="/app" className="text-[var(--color-accent)] hover:underline">
                komuta merkezine
              </Link>{" "}
              de dönebilirsin.
            </p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
