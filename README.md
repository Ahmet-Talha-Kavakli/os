# Founder OS — Şirketinin Beyni

20+ MVP'yi 2 kişilik bir ekiple yayına taşımak için tasarlanmış, Notion kalitesinde
ama daha hızlı bir komuta merkezi. Apple koyu-sinematik tasarım, tek nötr vurgu.

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

`.env.local` içinde `GEMINI_API_KEY` tanımlı (AI asistan için).

## Teknik

- **Next.js 16 + React 19 + Tailwind v4 + TypeScript**
- **Zustand + localStorage** persist (`src/lib/store.ts`) — tüm veri buradan akar.
  Bu katman bir "repository" gibidir; ileride Supabase'e tek noktadan geçilebilir.
- **Phosphor** ikonlar, **@number-flow** animasyonlu sayılar, **cmdk** komut paleti.
- **Gemini** (`gemini-flash-latest`) AI asistan — `src/app/api/ai/route.ts`.

## Modüller

- **Komuta Merkezi** (dashboard) — bugün, sağlık, hedefler, aktivite
- **Bugünüm** — kişisel odak ekranı
- **Projeler** — 5 görünüm: Pano (Kanban, drag&drop), Tablo, Takvim, Zaman Çizelgesi, Liste
- **Proje detayı** — görevler, launch checklist, bilgi, aktivite + slide-to-confirm danger zone
- **Görevler** — Kanban + liste, alt görev, bağımlılık, çekmece düzenleme
- **Hedefler** — OKR / Key Results
- **Launch Merkezi** — yayın & şirketleşme checklist şablonları
- **Finans** — MRR, gider/abonelik, runway, kategori dağılımı
- **Büyüme** — launch takvimi, içerik planı, metrikler
- **İkinci Beyin** — Notion-kalite blok editör, wiki, karar kaydı, snippet'ler
- **Otomasyon** — kurallar + GitHub entegrasyon iskeleti
- **Analitik** — verimlilik, ısı haritası, haftalık özet
- **AI Asistan** — workspace'i tanıyan Gemini asistanı
- **Ayarlar / Çöp Kutusu / Bildirimler**

## Tasarım sözleşmesi

Geliştirme kuralları `AGENTS.md` içinde. Özet: sadece CSS değişkenleri ile tema,
sıfır neon, sakin/cam/materyal, Türkçe arayüz, veriye sadece `useStore` ile eriş.

> Sonraki adım: Supabase ile gerçek login + bulut + 2 kişi realtime (store katmanı
> bunun için hazır soyutlandı).
