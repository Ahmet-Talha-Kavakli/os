# Founder OS — Geliştirici Sözleşmesi (NOTION-SADAKATLİ tasarım)

Next.js 16 + React 19 + Tailwind v4 + TypeScript. Backend yok — veri `src/lib/store.ts` (zustand+localStorage).

## ⚠️ TASARIM DİLİ — "Notion kalitesi" (kullanıcı ilk AI-jenerik halini reddetti)
Hedef: gerçek Notion gibi AÇIK, SADE, KUTUSUZ, BOL BOŞLUKLU, NEREDEYSE RENKSİZ.
- **KUTU KULLANMA.** Border'lı kart kalabalığı YASAK. Bunun yerine: ince `<Divider/>` çizgileri + boşluk ile ayır. Satır-tabanlı listeler kullan (her satır `flex`, aralarda Divider).
- **BOL BOŞLUK.** Sıkışıklık yok. Bölümler arası `space-y-12`, sayfa içeriği `notion-width mx-auto px-12 pt-4`. Nefes alsın.
- **NEREDEYSE RENKSİZ.** Gri tonları + TEK vurgu (var(--color-accent)). Az badge. Renkleri sadece küçük ikon/nokta için kullan, zemin için değil.
- **GÜÇLÜ TİPOGRAFİ.** Sayfa başlığı `text-[34px] font-bold tracking-[-0.02em]`. Bölüm başlığı `text-[13px] font-semibold text-[var(--text-dim)]`. Gövde `text-[14px]`. Silik metin `text-[var(--text-faint)]`.
- **METRİK = kutu değil.** `Stat` artık kutusuz (etiket+sayı). Yan yana için `StatRow` (ince dikey çizgi `divide-x` ile ayırır). Dev renkli stat-kutu YAPMA.
- Dashboard `src/app/app/page.tsx` ALTIN REFERANSTIR — onu aç, birebir o dili izle.

## CSS değişkenleri (SADECE bunları kullan)
Zemin: --bg, --bg-raised, --bg-hover, --bg-active. Sidebar: --sidebar-bg.
Metin: --text, --text-dim, --text-faint. Çizgi: --border. Vurgu: --color-accent, --color-accent-soft.
Sağlık: --color-health-good|warn|risk. Aşama: --color-stage-*. Etiket: --color-tag-*.
Tailwind arbitrary ile: `text-[var(--text)]`, `bg-[var(--bg-hover)]`, `border-[var(--border)]`, `text-[13px]`.
Yardımcı sınıf: `notion-width` (max 980px), `notion-narrow` (720px), `animate-rise`, `animate-fade`, `<Divider/>`.

## Hazır component'ler (TEKRAR YAZMA)
- `@/components/ui/button` → Button (variant: primary|glass|outline|subtle|ghost|danger, size: sm|md|lg|icon|iconsm). Varsayılan sade.
- `@/components/ui/primitives` → Badge (yumuşak pastel, küçük), Avatar, Card (KUTUSUZ varsayılan; bordered prop'u SADECE gerekince), Divider, ProgressBar (ince), Kbd, EmptyState, SectionTitle
- `@/components/ui/stat` → Stat (kutusuz metrik), StatRow (divide-x), FluxLoader, Skeleton
- `@/components/ui/icon` → Icon (regular weight, ince)
- `@/components/shell/page-header` → PageShell (Topbar+scroll), PageHero

## Sayfa deseni (referans: dashboard)
```tsx
"use client";
import { useStore, useActiveProjects } from "@/lib/store";
import { PageShell } from "@/components/shell/page-header";
export default function X() {
  return (
    <PageShell crumbs={[{ label: "Modül" }]}>
      <div className="notion-width mx-auto px-12 pb-20 pt-4 animate-rise">
        <div className="mb-10">
          <h1 className="text-[34px] font-bold leading-tight tracking-[-0.02em] text-[var(--text)]">Başlık</h1>
          <p className="mt-1.5 text-[15px] text-[var(--text-faint)]">alt bilgi</p>
        </div>
        {/* bölümler: <section> + h2(13px font-semibold text-dim) + Divider'lı satır listeleri, space-y-12 */}
      </div>
    </PageShell>
  );
}
```
Geniş tablo/board sayfaları için `notion-width` yerine daha geniş `max-w-[1200px]` veya `w-full` kullanılabilir ama px-12 ve sadelik kalsın.

## Store API
veri: members, projects, tasks, pages, goals, checklists, expenses, automations, activities, notifications, snippets, trash
hook: useActiveProjects(), useProjectTasks(id) — DİKKAT: useStore selector'ı inline .filter/.map ile YENİ DİZİ döndürürse sonsuz render olur; ham seç + useMemo kullan.
aksiyonlar: addProject/updateProject/deleteProject, addTask/updateTask/deleteTask/toggleTaskDone, addPage/updatePage/updatePageBlocks/deletePage, updateGoal, toggleChecklistItem/addChecklistFromTemplate, addExpense/deleteExpense, toggleAutomation, markAllRead/markRead, restore/emptyTrash, logActivity, toggleTheme
tipler: src/lib/types.ts · sabitler: src/lib/constants.ts (STAGES, HEALTH, PRIORITIES, TASK_STATUS, VIEWS) · yardımcı: src/lib/utils.ts

Türkçe arayüz. Apple/Linear/Notion ince işçiliği. "premium ve az-AI duran".
