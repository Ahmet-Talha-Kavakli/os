"use client";

import { Sidebar } from "@/components/shell/sidebar";
import { CommandPalette } from "@/components/shell/command-palette";
import { ThemeSync } from "@/components/shell/theme-sync";
import { useStore } from "@/lib/store";
import { FluxLoader } from "@/components/ui/stat";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const hydrated = useStore((s) => s.hydrated);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
      <ThemeSync />
      <CommandPalette />
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        {hydrated ? children : <FluxLoader label="Workspace yükleniyor…" />}
      </main>
    </div>
  );
}
