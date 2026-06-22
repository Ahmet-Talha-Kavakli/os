"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Icon } from "@/components/ui/icon";
import { useStore } from "@/lib/store";

export function CommandPalette() {
  const router = useRouter();
  const open = useStore((s) => s.commandOpen);
  const setOpen = useStore((s) => s.setCommandOpen);
  const projects = useStore((s) => s.projects);
  const pages = useStore((s) => s.pages);
  const tasks = useStore((s) => s.tasks);
  const addProject = useStore((s) => s.addProject);
  const addTask = useStore((s) => s.addTask);
  const addPage = useStore((s) => s.addPage);
  const toggleTheme = useStore((s) => s.toggleTheme);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(!open);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "q") {
        e.preventDefault();
        const t = addTask({ title: "Yeni görev" });
        router.push("/app/tasks");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen, addTask, router]);

  const go = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Komut paleti"
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
    >
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-panel)] shadow-[var(--shadow-pop)] animate-rise">
        {/* glowing search bar ruhu */}
        <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-4">
          <Icon name="MagnifyingGlass" size={18} className="text-[var(--color-accent)]" />
          <Command.Input
            autoFocus
            placeholder="Ara veya bir komut yaz…"
            className="h-13 flex-1 bg-transparent py-4 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-faint)]"
          />
          <kbd className="rounded border border-[var(--border-strong)] px-1.5 py-0.5 text-[10px] text-[var(--text-faint)]">ESC</kbd>
        </div>

        <Command.List className="max-h-[55vh] overflow-y-auto p-2">
          <Command.Empty className="py-8 text-center text-sm text-[var(--text-faint)]">Sonuç bulunamadı.</Command.Empty>

          <Command.Group heading="Hızlı Aksiyonlar" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--text-faint)]">
            <Item icon="Plus" label="Yeni proje oluştur" onSelect={() => { const p = addProject(); go(`/app/projects/${p.id}`); }} />
            <Item icon="CheckSquare" label="Yeni görev ekle" shortcut="⌘Q" onSelect={() => { addTask({ title: "Yeni görev" }); go("/app/tasks"); }} />
            <Item icon="FileText" label="Yeni sayfa oluştur" onSelect={() => { const p = addPage(); go(`/app/page/${p.id}`); }} />
            <Item icon="MoonStars" label="Temayı değiştir" onSelect={() => { toggleTheme(); }} />
          </Command.Group>

          <Command.Group heading="Git" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--text-faint)]">
            <Item icon="House" label="Komuta Merkezi" onSelect={() => go("/app")} />
            <Item icon="Sun" label="Bugünüm" onSelect={() => go("/app/myday")} />
            <Item icon="SquaresFour" label="Projeler" onSelect={() => go("/app/projects")} />
            <Item icon="CheckSquare" label="Görevler" onSelect={() => go("/app/tasks")} />
            <Item icon="Target" label="Hedefler" onSelect={() => go("/app/goals")} />
            <Item icon="Sparkle" label="AI Asistan" onSelect={() => go("/app/ai")} />
            <Item icon="RocketLaunch" label="Launch Merkezi" onSelect={() => go("/app/launch")} />
            <Item icon="ChartPieSlice" label="Finans" onSelect={() => go("/app/finance")} />
            <Item icon="TrendUp" label="Büyüme" onSelect={() => go("/app/growth")} />
            <Item icon="Lightning" label="Otomasyon" onSelect={() => go("/app/automations")} />
            <Item icon="ChartBar" label="Analitik" onSelect={() => go("/app/analytics")} />
            <Item icon="Brain" label="İkinci Beyin" onSelect={() => go("/app/brain")} />
            <Item icon="ChatText" label="Promptlar" onSelect={() => go("/app/prompts")} />
            <Item icon="Lightbulb" label="Fikirler" onSelect={() => go("/app/ideas")} />
            <Item icon="Key" label="Env Keyleri" onSelect={() => go("/app/env")} />
            <Item icon="Lock" label="Şifreler" onSelect={() => go("/app/credentials")} />
            <Item icon="Archive" label="Arşiv" onSelect={() => go("/app/archive")} />
            <Item icon="Gear" label="Ayarlar" onSelect={() => go("/app/settings")} />
          </Command.Group>

          <Command.Group heading="Projeler" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--text-faint)]">
            {projects.slice(0, 8).map((p) => (
              <Item key={p.id} icon={p.icon} iconColor={p.color} label={p.name} onSelect={() => go(`/app/projects/${p.id}`)} />
            ))}
          </Command.Group>

          <Command.Group heading="Görevler" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--text-faint)]">
            {tasks.slice(0, 6).map((t) => (
              <Item key={t.id} icon="CheckSquare" label={t.title} onSelect={() => go("/app/tasks")} />
            ))}
          </Command.Group>

          <Command.Group heading="Sayfalar" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--text-faint)]">
            {pages.map((p) => (
              <Item key={p.id} icon={p.icon} label={p.title} onSelect={() => go(`/app/page/${p.id}`)} />
            ))}
          </Command.Group>
        </Command.List>
      </div>
    </Command.Dialog>
  );
}

function Item({ icon, iconColor, label, shortcut, onSelect }: { icon: string; iconColor?: string; label: string; shortcut?: string; onSelect: () => void }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-[var(--text-dim)] aria-selected:bg-[var(--glass-strong)] aria-selected:text-[var(--text)]"
    >
      <Icon name={icon} size={16} style={{ color: iconColor }} />
      <span className="flex-1">{label}</span>
      {shortcut && <kbd className="rounded border border-[var(--border-strong)] px-1.5 py-0.5 text-[10px] text-[var(--text-faint)]">{shortcut}</kbd>}
    </Command.Item>
  );
}
