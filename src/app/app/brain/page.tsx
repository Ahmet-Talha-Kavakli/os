"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Tabs from "@radix-ui/react-tabs";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useStore } from "@/lib/store";
import { PageShell } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Badge, Divider, EmptyState } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { formatDate, relativeDay, cn } from "@/lib/utils";
import type { Page, Snippet } from "@/lib/types";

const KIND_META: Record<string, { label: string; color: string; icon: string }> = {
  doc: { label: "Doküman", color: "#6f9bff", icon: "FileText" },
  wiki: { label: "Wiki", color: "#5bb98c", icon: "BookOpen" },
  meeting: { label: "Toplantı", color: "#c79a5b", icon: "Users" },
  decision: { label: "Karar", color: "#b07fd6", icon: "GitBranch" },
};

const SNIPPET_CATS: { id: Snippet["category"]; label: string; icon: string; color: string }[] = [
  { id: "code", label: "Kod", icon: "Code", color: "#6f9bff" },
  { id: "prompt", label: "Prompt", icon: "Sparkle", color: "#b07fd6" },
  { id: "copy", label: "Metin", icon: "TextAa", color: "#c79a5b" },
  { id: "asset", label: "Varlık", icon: "Image", color: "#5bb98c" },
];

function blockPreview(page: Page): string {
  const b = page.blocks.find((x) => x.content.trim() && x.type !== "h1");
  return b?.content ?? page.blocks.find((x) => x.content.trim())?.content ?? "Boş sayfa";
}

export default function SecondBrain() {
  const router = useRouter();
  const pages = useStore((s) => s.pages);
  const snippets = useStore((s) => s.snippets);
  const projects = useStore((s) => s.projects);
  const addPage = useStore((s) => s.addPage);

  const [query, setQuery] = useState("");
  const q = query.toLowerCase().trim();

  const filteredPages = useMemo(
    () =>
      !q
        ? pages
        : pages.filter(
            (p) =>
              p.title.toLowerCase().includes(q) ||
              p.blocks.some((b) => b.content.toLowerCase().includes(q))
          ),
    [pages, q]
  );

  const filteredSnippets = useMemo(
    () =>
      !q
        ? snippets
        : snippets.filter(
            (s) =>
              s.title.toLowerCase().includes(q) ||
              s.body.toLowerCase().includes(q) ||
              s.tags.some((t) => t.includes(q))
          ),
    [snippets, q]
  );

  const wikiPages = filteredPages.filter((p) => p.kind === "wiki");
  const decisionPages = filteredPages
    .filter((p) => p.kind === "decision")
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));

  const createPage = async (kind: Page["kind"] = "doc") => {
    const page = addPage({ kind });
    router.push(`/app/page/${page.id}`);
  };

  const tabCls =
    "relative -mb-px flex items-center gap-1.5 px-1 pb-2.5 text-[14px] font-medium text-[var(--text-faint)] outline-none transition-colors hover:text-[var(--text-dim)] data-[state=active]:text-[var(--text)] after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:bg-[var(--text)] after:opacity-0 data-[state=active]:after:opacity-100";

  return (
    <PageShell crumbs={[{ label: "İkinci Beyin" }]}>
      <div className="notion-width mx-auto px-12 pb-20 pt-4 animate-rise">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[34px] font-bold leading-tight tracking-[-0.02em] text-[var(--text)]">İkinci Beyin</h1>
            <p className="mt-1.5 text-[15px] text-[var(--text-faint)]">
              {pages.length} sayfa · {snippets.length} snippet · tüm bilgi tek yerde
            </p>
          </div>
          <Button variant="primary" onClick={() => createPage("doc")}>
            <Icon name="Plus" size={16} /> Yeni sayfa
          </Button>
        </div>

        {/* arama — sade satır */}
        <div className="mb-8 flex items-center gap-2.5 border-b border-[var(--border)] pb-2.5">
          <Icon name="MagnifyingGlass" size={16} className="text-[var(--text-faint)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sayfalar ve snippetlerde ara…"
            className="flex-1 border-0 bg-transparent text-[14px] text-[var(--text)] outline-none placeholder:text-[var(--text-faint)]"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-[var(--text-faint)] hover:text-[var(--text)]">
              <Icon name="X" size={14} />
            </button>
          )}
        </div>

        <Tabs.Root defaultValue="pages">
          <Tabs.List className="mb-8 flex items-center gap-6 border-b border-[var(--border)]">
            <Tabs.Trigger value="pages" className={tabCls}>Sayfalar</Tabs.Trigger>
            <Tabs.Trigger value="wiki" className={tabCls}>Wiki</Tabs.Trigger>
            <Tabs.Trigger value="decisions" className={tabCls}>Kararlar</Tabs.Trigger>
            <Tabs.Trigger value="snippets" className={tabCls}>Snippetler</Tabs.Trigger>
          </Tabs.List>

          {/* ---- Sayfalar ---- */}
          <Tabs.Content value="pages" className="outline-none animate-fade">
            {filteredPages.length === 0 ? (
              <EmptyState
                icon={<Icon name="FileDashed" size={44} />}
                title={q ? "Eşleşen sayfa yok" : "Henüz sayfa yok"}
                desc={q ? "Aramanı değiştir." : "İlk sayfanı oluştur."}
                action={!q ? <Button variant="outline" onClick={() => createPage("doc")}><Icon name="Plus" size={15} /> Yeni sayfa</Button> : undefined}
              />
            ) : (
              <div>
                {filteredPages.map((p, i) => (
                  <PageRow key={p.id} page={p} project={projects.find((x) => x.id === p.projectId)} first={i === 0} />
                ))}
              </div>
            )}
          </Tabs.Content>

          {/* ---- Wiki ---- */}
          <Tabs.Content value="wiki" className="outline-none animate-fade">
            {wikiPages.length === 0 ? (
              <EmptyState
                icon={<Icon name="BookOpen" size={44} />}
                title="Wiki sayfası yok"
                desc="Kalıcı bilgi için bir wiki sayfası oluştur."
                action={<Button variant="outline" onClick={() => createPage("wiki")}><Icon name="Plus" size={15} /> Wiki sayfası</Button>}
              />
            ) : (
              <div>
                {wikiPages.map((p, i) => (
                  <PageRow key={p.id} page={p} project={projects.find((x) => x.id === p.projectId)} first={i === 0} />
                ))}
              </div>
            )}
          </Tabs.Content>

          {/* ---- Kararlar (timeline) ---- */}
          <Tabs.Content value="decisions" className="outline-none animate-fade">
            {decisionPages.length === 0 ? (
              <EmptyState
                icon={<Icon name="GitBranch" size={44} />}
                title="Karar kaydı yok"
                desc="Neden-böyle-yaptık kararlarını kayıt altına al."
                action={<Button variant="outline" onClick={() => createPage("decision")}><Icon name="Plus" size={15} /> Karar ekle</Button>}
              />
            ) : (
              <div className="relative pl-6">
                <div className="absolute left-[5px] top-2 bottom-2 w-px bg-[var(--border)]" />
                <div className="space-y-6">
                  {decisionPages.map((p) => (
                    <div key={p.id} className="relative">
                      <span className="absolute -left-[23px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--bg)]" style={{ background: "#b07fd6" }} />
                      <Link href={`/app/page/${p.id}`} className="group block">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2 text-[14px] font-medium text-[var(--text)] group-hover:text-[var(--color-accent)]">
                            <Icon name={p.icon} size={15} style={{ color: "#b07fd6" }} />
                            {p.title || "Adsız"}
                          </span>
                          <span className="shrink-0 text-[12px] text-[var(--text-faint)]">{formatDate(p.updatedAt)}</span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-[13px] text-[var(--text-faint)]">{blockPreview(p)}</p>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Tabs.Content>

          {/* ---- Snippetler ---- */}
          <Tabs.Content value="snippets" className="outline-none animate-fade">
            {filteredSnippets.length === 0 ? (
              <EmptyState icon={<Icon name="Code" size={44} />} title={q ? "Eşleşen snippet yok" : "Snippet yok"} />
            ) : (
              <div className="space-y-10">
                {SNIPPET_CATS.map((cat) => {
                  const items = filteredSnippets.filter((s) => s.category === cat.id);
                  if (items.length === 0) return null;
                  return (
                    <div key={cat.id}>
                      <div className="mb-3 flex items-center gap-2">
                        <Icon name={cat.icon} size={14} style={{ color: cat.color }} />
                        <h3 className="text-[13px] font-semibold text-[var(--text-dim)]">{cat.label}</h3>
                        <span className="text-[12px] text-[var(--text-faint)]">{items.length}</span>
                      </div>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {items.map((s) => (
                          <SnippetCard key={s.id} snippet={s} accent={cat.color} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </PageShell>
  );
}

function PageRow({ page, project, first }: { page: Page; project?: { name: string; icon: string; color: string }; first: boolean }) {
  const kind = KIND_META[page.kind] ?? KIND_META.doc;
  const updatePage = useStore((s) => s.updatePage);
  const deletePage = useStore((s) => s.deletePage);
  return (
    <>
      {!first && <Divider />}
      <div className="group relative">
        <Link href={`/app/page/${page.id}`} className="flex items-center gap-3 py-3 pr-9">
          <Icon name={page.icon} size={17} style={{ color: kind.color }} className="shrink-0" />
          <span className="w-48 shrink-0 truncate text-[14px] font-medium text-[var(--text)] group-hover:text-[var(--color-accent)]">{page.title || "Adsız"}</span>
          {page.favorite && <Icon name="Star" weight="fill" size={13} style={{ color: "#d4a85a" }} className="shrink-0" />}
          <span className="hidden flex-1 truncate text-[13px] text-[var(--text-faint)] md:block">{blockPreview(page)}</span>
          <Badge color={kind.color} dot>{kind.label}</Badge>
          {project && (
            <span className="hidden w-28 shrink-0 items-center gap-1 truncate text-[12px] text-[var(--text-faint)] lg:flex">
              <Icon name={project.icon} size={11} style={{ color: project.color }} />
              {project.name}
            </span>
          )}
          <span className="w-16 shrink-0 text-right text-[12px] text-[var(--text-faint)]">{relativeDay(page.updatedAt)}</span>
        </Link>

        {/* hover aksiyonları */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 data-[open]:opacity-100">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-faint)] outline-none hover:bg-[var(--bg-hover)] hover:text-[var(--text)]" title="Daha fazla">
                <Icon name="DotsThree" size={16} />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content sideOffset={4} align="end"
                className="z-50 min-w-48 rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] p-1 shadow-[var(--shadow-pop)] animate-fade">
                <DropdownMenu.Item
                  onSelect={() => updatePage(page.id, { favorite: !page.favorite })}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm text-[var(--text-dim)] outline-none data-[highlighted]:bg-[var(--bg-hover)] data-[highlighted]:text-[var(--text)]">
                  <Icon name="Star" size={15} weight={page.favorite ? "fill" : "regular"} style={{ color: page.favorite ? "#d4a85a" : undefined }} />
                  {page.favorite ? "Favorilerden çıkar" : "Favorilere ekle"}
                </DropdownMenu.Item>
                <div className="my-1 h-px bg-[var(--border)]" />
                <DropdownMenu.Item
                  onSelect={() => deletePage(page.id)}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm text-[var(--color-health-risk)] outline-none data-[highlighted]:bg-[color-mix(in_srgb,var(--color-health-risk)_12%,transparent)]">
                  <Icon name="Trash" size={15} />
                  Sayfayı sil
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </>
  );
}

function SnippetCard({ snippet, accent }: { snippet: Snippet; accent: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* sessiz */
    }
  };
  return (
    <div className="flex flex-col">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[14px] font-medium text-[var(--text)]">{snippet.title}</div>
          <div className="flex items-center gap-1.5 text-[12px] text-[var(--text-faint)]">
            <span className="font-mono text-[10px]" style={{ color: accent }}>{snippet.lang}</span>
            {snippet.tags.slice(0, 2).map((t) => (
              <span key={t}>#{t}</span>
            ))}
          </div>
        </div>
        <Button variant="ghost" size="iconsm" onClick={copy} title="Kopyala">
          <Icon name={copied ? "Check" : "Copy"} size={15} style={copied ? { color: "var(--color-health-good)" } : undefined} />
        </Button>
      </div>
      <pre className="overflow-x-auto rounded-lg bg-[var(--bg-hover)] px-3 py-2.5 font-mono text-[12px] leading-relaxed text-[var(--text-dim)]">
        <code className={cn("whitespace-pre-wrap break-words")}>{snippet.body}</code>
      </pre>
    </div>
  );
}
