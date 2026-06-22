"use client";

import { useStore } from "./store";
import { STAGES } from "./constants";

/** Workspace'in özetini AI'a bağlam olarak verir. */
export function buildWorkspaceContext(): string {
  const s = useStore.getState();
  const projects = s.projects.filter((p) => !p.archived);
  const lines: string[] = [];

  lines.push(`Projeler (${projects.length}):`);
  for (const p of projects) {
    const stage = STAGES.find((x) => x.id === p.stage)?.label ?? p.stage;
    const tasks = s.tasks.filter((t) => t.projectId === p.id);
    const openTasks = tasks.filter((t) => t.status !== "done").length;
    lines.push(
      `- ${p.name} [${stage}] sağlık:${p.health} ilerleme:%${p.progress} açık-görev:${openTasks} mrr:$${p.mrr} ${p.description}`
    );
  }

  const open = s.tasks.filter((t) => t.status !== "done");
  lines.push(`\nAçık görevler (${open.length}):`);
  for (const t of open.slice(0, 25)) {
    const proj = projects.find((p) => p.id === t.projectId)?.name ?? "—";
    lines.push(`- ${t.title} (proje:${proj}, öncelik:${t.priority}, durum:${t.status})`);
  }

  lines.push(`\nHedefler:`);
  for (const g of s.goals) {
    lines.push(`- ${g.title} [${g.status}] ${g.quarter}`);
  }

  return lines.join("\n");
}

export async function askAI(prompt: string, includeContext = true): Promise<string> {
  const context = includeContext ? buildWorkspaceContext() : undefined;
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, context }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "AI hatası");
  return data.text as string;
}

/** Çok hafif markdown → HTML (başlık, kalın, liste, kod). Bağımlılık yok. */
export function miniMarkdown(md: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const lines = md.split("\n");
  let html = "";
  let inList: "ul" | "ol" | null = null;
  const closeList = () => {
    if (inList) {
      html += `</${inList}>`;
      inList = null;
    }
  };

  const inline = (s: string) =>
    esc(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, '<code class="rounded bg-[var(--bg-hover)] px-1 py-0.5 text-[0.85em]">$1</code>');

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^### /.test(line)) { closeList(); html += `<h3 class="mt-3 mb-1 text-sm font-semibold">${inline(line.slice(4))}</h3>`; }
    else if (/^## /.test(line)) { closeList(); html += `<h2 class="mt-3 mb-1 text-base font-semibold">${inline(line.slice(3))}</h2>`; }
    else if (/^# /.test(line)) { closeList(); html += `<h1 class="mt-3 mb-1 text-lg font-semibold">${inline(line.slice(2))}</h1>`; }
    else if (/^[-*] /.test(line)) {
      if (inList !== "ul") { closeList(); html += '<ul class="my-1 ml-4 list-disc space-y-0.5">'; inList = "ul"; }
      html += `<li>${inline(line.slice(2))}</li>`;
    } else if (/^\d+\. /.test(line)) {
      if (inList !== "ol") { closeList(); html += '<ol class="my-1 ml-4 list-decimal space-y-0.5">'; inList = "ol"; }
      html += `<li>${inline(line.replace(/^\d+\. /, ""))}</li>`;
    } else if (line === "") {
      closeList();
    } else {
      closeList();
      html += `<p class="my-1">${inline(line)}</p>`;
    }
  }
  closeList();
  return html;
}
