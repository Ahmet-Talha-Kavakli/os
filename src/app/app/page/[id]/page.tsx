"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Popover from "@radix-ui/react-popover";
import { useStore } from "@/lib/store";
import { PageShell } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { BlockEditor } from "@/components/editor/block-editor";
import { formatDate, cn } from "@/lib/utils";
import type { Block, Page } from "@/lib/types";

const KIND_META: Record<string, { label: string; color: string; icon: string }> = {
  doc: { label: "Doküman", color: "#6f9bff", icon: "FileText" },
  wiki: { label: "Wiki", color: "#5bb98c", icon: "BookOpen" },
  meeting: { label: "Toplantı", color: "#c79a5b", icon: "Users" },
  decision: { label: "Karar", color: "#b07fd6", icon: "GitBranch" },
};

const PAGE_KINDS: Page["kind"][] = ["doc", "wiki", "meeting", "decision"];

const ICON_CHOICES = [
  "Rocket", "Globe", "Camera", "Lightning", "Brain", "Code",
  "ChartLineUp", "Megaphone", "FilmSlate", "GridFour", "MagnifyingGlass", "Eye",
  "ArrowsOut", "Cube", "Sparkle", "Database",
];

export default function PageView() {
  const params = useParams();
  const id = String(params.id);
  const router = useRouter();

  const page = useStore((s) => s.pages.find((p) => p.id === id));
  const projects = useStore((s) => s.projects);
  const members = useStore((s) => s.members);
  const updatePage = useStore((s) => s.updatePage);
  const updatePageBlocks = useStore((s) => s.updatePageBlocks);
  const deletePage = useStore((s) => s.deletePage);
  const hydrated = useStore((s) => s.hydrated);

  if (!page) {
    return (
      <PageShell crumbs={[{ label: "İkinci Beyin", href: "/app/brain" }, { label: "Sayfa" }]}>
        <div className="notion-narrow mx-auto px-12 py-20">
          <EmptyState
            icon={<Icon name="FileDashed" size={48} />}
            title={hydrated ? "Sayfa bulunamadı" : "Yükleniyor…"}
            desc={hydrated ? "Bu sayfa silinmiş ya da hiç var olmamış olabilir." : undefined}
            action={
              hydrated ? (
                <Button variant="outline" asChild>
                  <Link href="/app/brain"><Icon name="ArrowLeft" size={15} /> İkinci Beyin'e dön</Link>
                </Button>
              ) : undefined
            }
          />
        </div>
      </PageShell>
    );
  }

  const kind = KIND_META[page.kind] ?? KIND_META.doc;
  const project = page.projectId ? projects.find((p) => p.id === page.projectId) : undefined;
  const author = members.find((m) => m.id === page.authorId);

  const handleBlocks = (blocks: Block[]) => updatePageBlocks(page.id, blocks);

  return (
    <PageShell
      crumbs={[
        { label: "İkinci Beyin", href: "/app/brain" },
        ...(project ? [{ label: project.name }] : []),
        { label: page.title || "Adsız" },
      ]}
    >
      <div className="animate-rise">
        <div className="notion-narrow mx-auto px-12 pb-32 pt-12">
          {/* ikon + favori + aksiyon menüsü — minimal chrome */}
          <div className="mb-4 flex items-start justify-between">
            {/* ikon seçici */}
            <Popover.Root>
              <Popover.Trigger asChild>
                <button className="-ml-1 rounded-xl p-1 outline-none transition-colors hover:bg-[var(--bg-hover)]" title="İkon değiştir">
                  <Icon name={page.icon} size={52} style={{ color: kind.color }} />
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content sideOffset={6} align="start"
                  className="z-50 w-[232px] rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] p-2 shadow-[var(--shadow-pop)] animate-fade">
                  <div className="grid grid-cols-6 gap-1">
                    {ICON_CHOICES.map((name) => (
                      <Popover.Close asChild key={name}>
                        <button
                          onClick={() => updatePage(page.id, { icon: name })}
                          title={name}
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg outline-none transition-colors hover:bg-[var(--bg-hover)]",
                            name === page.icon && "bg-[var(--bg-active)]"
                          )}
                        >
                          <Icon name={name} size={18} style={{ color: name === page.icon ? kind.color : "var(--text-dim)" }} />
                        </button>
                      </Popover.Close>
                    ))}
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="iconsm"
                onClick={() => updatePage(page.id, { favorite: !page.favorite })}
                title={page.favorite ? "Favorilerden çıkar" : "Favorile"}
              >
                <Icon
                  name="Star"
                  weight={page.favorite ? "fill" : "regular"}
                  size={16}
                  style={{ color: page.favorite ? "#d4a85a" : "var(--text-dim)" }}
                />
              </Button>

              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <Button variant="ghost" size="iconsm" title="Daha fazla">
                    <Icon name="DotsThree" size={18} />
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content sideOffset={6} align="end"
                    className="z-50 min-w-52 rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] p-1 shadow-[var(--shadow-pop)] animate-fade">
                    <DropdownMenu.Item
                      onSelect={() => updatePage(page.id, { favorite: !page.favorite })}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm text-[var(--text-dim)] outline-none data-[highlighted]:bg-[var(--bg-hover)] data-[highlighted]:text-[var(--text)]">
                      <Icon name="Star" size={15} weight={page.favorite ? "fill" : "regular"} style={{ color: page.favorite ? "#d4a85a" : undefined }} />
                      {page.favorite ? "Favorilerden çıkar" : "Favorilere ekle"}
                    </DropdownMenu.Item>

                    {/* kind alt menü */}
                    <DropdownMenu.Sub>
                      <DropdownMenu.SubTrigger className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm text-[var(--text-dim)] outline-none data-[highlighted]:bg-[var(--bg-hover)] data-[highlighted]:text-[var(--text)]">
                        <Icon name={kind.icon} size={15} style={{ color: kind.color }} />
                        Tür: {kind.label}
                        <Icon name="CaretRight" size={13} className="ml-auto text-[var(--text-faint)]" />
                      </DropdownMenu.SubTrigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.SubContent sideOffset={4}
                          className="z-50 min-w-40 rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] p-1 shadow-[var(--shadow-pop)] animate-fade">
                          {PAGE_KINDS.map((k) => {
                            const km = KIND_META[k];
                            return (
                              <DropdownMenu.Item key={k} onSelect={() => updatePage(page.id, { kind: k })}
                                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm text-[var(--text-dim)] outline-none data-[highlighted]:bg-[var(--bg-hover)] data-[highlighted]:text-[var(--text)]">
                                <Icon name={km.icon} size={15} style={{ color: km.color }} />
                                {km.label}
                                {k === page.kind && <Icon name="Check" size={14} className="ml-auto text-[var(--color-accent)]" />}
                              </DropdownMenu.Item>
                            );
                          })}
                        </DropdownMenu.SubContent>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Sub>

                    <div className="my-1 h-px bg-[var(--border)]" />

                    <DropdownMenu.Item
                      onSelect={() => { deletePage(page.id); router.push("/app/brain"); }}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm text-[var(--color-health-risk)] outline-none data-[highlighted]:bg-[color-mix(in_srgb,var(--color-health-risk)_12%,transparent)]">
                      <Icon name="Trash" size={15} />
                      Sayfayı sil
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </div>

          {/* başlık — editlenebilir */}
          <TitleInput
            value={page.title}
            onChange={(v) => updatePage(page.id, { title: v })}
          />

          {/* meta satırı */}
          <div className="mb-1 mt-2 flex flex-wrap items-center gap-2 text-[13px] text-[var(--text-faint)]">
            <Badge color={kind.color} dot>{kind.label}</Badge>
            {project && (
              <span className="flex items-center gap-1">
                <Icon name={project.icon} size={12} style={{ color: project.color }} />
                {project.name}
              </span>
            )}
            <span>·</span>
            <span>Güncellendi {formatDate(page.updatedAt)}</span>
            {author && <><span>·</span><span>{author.name}</span></>}
          </div>

          <div className="mb-8 mt-1 flex items-center gap-1.5 text-[12px] text-[var(--text-faint)]">
            <kbd className="rounded border border-[var(--border)] px-1 text-[10px]">/</kbd>
            ile blok ekle · Markdown kısayolları çalışır
          </div>

          {/* blok editör — merkez parça */}
          <BlockEditor blocks={page.blocks} onChange={handleBlocks} />
        </div>
      </div>
    </PageShell>
  );
}

function TitleInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.preventDefault();
      }}
      rows={1}
      spellCheck={false}
      placeholder="Adsız"
      className={cn(
        "w-full resize-none border-0 bg-transparent text-[40px] font-bold leading-tight tracking-[-0.02em] text-[var(--text)]",
        "outline-none placeholder:text-[var(--text-faint)]"
      )}
    />
  );
}
