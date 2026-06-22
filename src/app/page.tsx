"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

/* ---- Scroll reveal — çok ölçülü ---- */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(14px)",
        transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ---- Veri ---- */
const NAV = [
  { href: "#urun", label: "Ürün" },
  { href: "#ozellikler", label: "Özellikler" },
  { href: "#neden", label: "Neden" },
  { href: "#fiyat", label: "Fiyat" },
];

const FEATURES = [
  {
    icon: "Stack",
    title: "Projeler & yaşam döngüsü",
    desc: "Fikirden yayına: idea → mvp → ödeme → beta → live. Her projenin sağlığı tek bakışta.",
  },
  {
    icon: "TextAa",
    title: "Notion-kalite editör",
    desc: "Blok tabanlı sayfalar, karar kayıtları ve wiki. Hızlı, sessiz, dağılmadan.",
  },
  {
    icon: "SquaresFour",
    title: "Tüm görünümler",
    desc: "Board, Tablo, Takvim ve Timeline. Aynı veri, sana uygun her açıdan.",
  },
  {
    icon: "ChartLineUp",
    title: "Finans & MRR",
    desc: "Abonelikler, aylık maliyet ve gelir. Hangi ürün kazandırıyor, hemen gör.",
  },
  {
    icon: "Target",
    title: "Hedefler / OKR",
    desc: "Çeyreklik hedefler ve key result'lar. Projeler hedefe bağlı ilerlesin.",
  },
  {
    icon: "Command",
    title: "Cmd+K hızı",
    desc: "Her şeye klavyeden ulaş. Tıklama yok, akış var. Founder hızında çalış.",
  },
];

const PREVIEW_PROJECTS = [
  { name: "1Lookup", stage: "Ödeme", color: "#c69a3f", progress: 78, health: "good" },
  { name: "Adspirer", stage: "Beta", color: "#9778c4", progress: 64, health: "good" },
  { name: "Vidai", stage: "MVP", color: "#4a8bd4", progress: 45, health: "warn" },
  { name: "Yaak", stage: "MVP", color: "#5a9e6f", progress: 52, health: "good" },
  { name: "Postly", stage: "Fikir", color: "#908e88", progress: 18, health: "warn" },
];

const PREVIEW_TODAY = [
  { title: "Stripe ödeme entegrasyonu", proj: "1Lookup", color: "#c69a3f", due: "Bugün", late: true },
  { title: "MCP araç şemalarını yaz", proj: "Adspirer", color: "#9778c4", due: "Yarın" },
  { title: "Landing hero görseli", proj: "Vidai", color: "#4a8bd4", due: "2 gün" },
];

const PREVIEW_GOALS = [
  { title: "Q2: 3 ürünü yayına al", pct: 66, color: "var(--color-health-good)" },
  { title: "Toplam MRR $2.5K", pct: 48, color: "var(--color-health-warn)" },
];

const PREVIEW_NAV = [
  { icon: "House", label: "Komuta Merkezi", active: true },
  { icon: "Stack", label: "Projeler" },
  { icon: "CheckSquare", label: "Görevler" },
  { icon: "Calendar", label: "Takvim" },
  { icon: "Target", label: "Hedefler" },
  { icon: "ChartLineUp", label: "Finans" },
];

/* ---- Ürün önizleme: gerçek dashboard'un sade kopyası ---- */
function ProductPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] shadow-[var(--shadow-pop)]">
      {/* Pencere çubuğu */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#e0625b]/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#d4a85a]/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#5a9e6f]/70" />
        <span className="ml-3 text-[11px] text-[var(--text-faint)]">founder-os · Komuta Merkezi</span>
      </div>

      <div className="flex">
        {/* Sidebar dilimi */}
        <aside className="hidden w-[176px] shrink-0 border-r border-[var(--border)] bg-[var(--sidebar-bg)] p-3 sm:block">
          <div className="mb-4 flex items-center gap-2 px-1">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-[var(--color-accent)]">
              <Icon name="Brain" size={12} className="text-white" />
            </span>
            <span className="text-[12px] font-semibold text-[var(--text)]">Founder OS</span>
          </div>
          <div className="space-y-0.5">
            {PREVIEW_NAV.map((n) => (
              <div
                key={n.label}
                className={`flex items-center gap-2 rounded px-2 py-1.5 text-[12px] ${
                  n.active
                    ? "bg-[var(--bg-active)] font-medium text-[var(--text)]"
                    : "text-[var(--text-dim)]"
                }`}
              >
                <Icon name={n.icon} size={14} style={n.active ? { color: "var(--color-accent)" } : undefined} />
                {n.label}
              </div>
            ))}
          </div>
        </aside>

        {/* İçerik */}
        <div className="min-w-0 flex-1 p-5 sm:p-6">
          <div className="mb-5">
            <div className="text-[18px] font-bold tracking-[-0.02em] text-[var(--text)]">Günaydın</div>
            <div className="mt-0.5 text-[11px] text-[var(--text-faint)]">
              5 aktif proje · 12 açık görev · 2 yayında
            </div>
          </div>

          {/* Boksuz stat satırı — divide-x */}
          <div className="mb-6 grid grid-cols-4 divide-x divide-[var(--border)]">
            {[
              { l: "Aktif proje", v: "5" },
              { l: "Aylık gelir", v: "$1.2K" },
              { l: "Aylık gider", v: "$340" },
              { l: "Açık görev", v: "12" },
            ].map((s, i) => (
              <div key={s.l} className={i === 0 ? "pr-3" : "px-3"}>
                <div className="text-[10px] text-[var(--text-faint)]">{s.l}</div>
                <div className="mt-0.5 text-[18px] font-semibold tracking-[-0.02em] text-[var(--text)]">{s.v}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
            {/* Sol: bugün + projeler */}
            <div className="space-y-6">
              <section>
                <div className="mb-2 text-[11px] font-semibold text-[var(--text-dim)]">Bugün odaklan</div>
                <div>
                  {PREVIEW_TODAY.map((t, i) => (
                    <div key={t.title}>
                      {i > 0 && <div className="h-px w-full bg-[var(--border)]" />}
                      <div className="flex items-center gap-2 py-1.5">
                        <Icon name="Circle" size={13} className="shrink-0 text-[var(--text-faint)]" />
                        <span className="flex-1 truncate text-[12px] text-[var(--text)]">{t.title}</span>
                        <span className="flex shrink-0 items-center gap-1 text-[11px] text-[var(--text-faint)]">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: t.color }} />
                          {t.proj}
                        </span>
                        <span
                          className={`w-12 shrink-0 text-right text-[11px] ${
                            t.late ? "text-[var(--color-health-risk)]" : "text-[var(--text-faint)]"
                          }`}
                        >
                          {t.due}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-2 text-[11px] font-semibold text-[var(--text-dim)]">Projeler</div>
                <div>
                  {PREVIEW_PROJECTS.map((p, i) => (
                    <div key={p.name}>
                      {i > 0 && <div className="h-px w-full bg-[var(--border)]" />}
                      <div className="flex items-center gap-2.5 py-1.5">
                        <Icon name="Cube" size={13} style={{ color: p.color }} className="shrink-0" />
                        <span className="w-16 shrink-0 truncate text-[12px] font-medium text-[var(--text)]">{p.name}</span>
                        <span
                          className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium leading-none"
                          style={{
                            background: `color-mix(in srgb, ${p.color} 13%, transparent)`,
                            color: `color-mix(in srgb, ${p.color} 78%, var(--text))`,
                          }}
                        >
                          {p.stage}
                        </span>
                        <div className="flex flex-1 items-center gap-2">
                          <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--bg-active)]">
                            <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: p.color }} />
                          </div>
                          <span className="w-6 text-right text-[10px] text-[var(--text-faint)]">%{p.progress}</span>
                        </div>
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: `var(--color-health-${p.health})` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sağ: hedefler */}
            <section>
              <div className="mb-2 text-[11px] font-semibold text-[var(--text-dim)]">Çeyrek hedefleri</div>
              <div className="space-y-3.5">
                {PREVIEW_GOALS.map((g) => (
                  <div key={g.title}>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="flex-1 truncate text-[12px] text-[var(--text)]">{g.title}</span>
                      <span className="text-[10px] text-[var(--text-faint)]">%{g.pct}</span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--bg-active)]">
                      <div className="h-full rounded-full" style={{ width: `${g.pct}%`, background: g.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* ---- Nav ---- */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_85%,transparent)] backdrop-blur-md">
        <nav className="mx-auto flex h-14 max-w-[1080px] items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--color-accent)]">
              <Icon name="Brain" size={14} className="text-white" />
            </span>
            <span className="text-[14px] font-semibold tracking-tight">Founder OS</span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="text-[13px] text-[var(--text-dim)] transition-colors hover:text-[var(--text)]"
              >
                {n.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/login">Giriş</Link>
            </Button>
            <Button asChild variant="primary" size="sm">
              <Link href="/app">
                Uygulamayı Aç
                <Icon name="ArrowRight" size={14} />
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* ---- Hero: asimetrik, sol-hizalı ---- */}
      <section className="relative overflow-hidden">
        {/* çok hafif grid zemin */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(ellipse 80% 50% at 50% 0%, #000 40%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 50% at 50% 0%, #000 40%, transparent 80%)",
          }}
        />

        <div className="relative mx-auto max-w-[1080px] px-6 pb-8 pt-20 sm:pt-28">
          <div className="max-w-3xl animate-rise">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-raised)] py-1 pl-1.5 pr-3 text-[12px] text-[var(--text-dim)]">
              <span className="rounded-full bg-[var(--color-accent-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-accent)]">
                Yeni
              </span>
              2 kişilik ekip, 20+ proje, tek komuta merkezi
            </div>

            <h1 className="text-balance text-[40px] font-bold leading-[1.04] tracking-[-0.03em] text-[var(--text)] sm:text-[58px]">
              Şirketinin beyni.
              <br />
              <span className="text-[var(--text-faint)]">20 projeyi tek ekranda topla.</span>
            </h1>

            <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-[var(--text-dim)] sm:text-[17px]">
              Projeler, görevler, finans, hedefler ve şirketleşme — hepsi sakin, açık ve
              dağılmayan bir komuta merkezinde. Founder hızında çalış, dağınıklığı bitir.
            </p>

            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Button asChild variant="primary" size="lg">
                <Link href="/app">
                  Uygulamayı Aç
                  <Icon name="ArrowRight" size={16} />
                </Link>
              </Button>
              <Button asChild variant="glass" size="lg">
                <a href="#urun">
                  <Icon name="Play" size={15} />
                  Ürünü gör
                </a>
              </Button>
            </div>

            <p className="mt-5 text-[13px] text-[var(--text-faint)]">
              Kredi kartı yok · Kendi aracımız · Sonsuza dek ücretsiz
            </p>
          </div>
        </div>
      </section>

      {/* ---- Ürün önizleme ---- */}
      <section id="urun" className="relative mx-auto max-w-[1080px] px-6 pb-24 pt-6">
        <Reveal delay={80}>
          <ProductPreview />
        </Reveal>
      </section>

      {/* ---- Özellikler ---- */}
      <section id="ozellikler" className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-[1080px] px-6 py-24">
          <Reveal className="mb-16 max-w-2xl">
            <div className="text-[13px] font-semibold text-[var(--color-accent)]">Tek araçta her şey</div>
            <h2 className="mt-3 text-balance text-[32px] font-bold tracking-[-0.02em] sm:text-[38px]">
              Bir founder'ın günlük işlettiği ne varsa
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-[var(--text-dim)]">
              Klasör klasör dolaşmayı, on farklı sekme arasında kaybolmayı bırak. Her şey
              burada, birbirine bağlı.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 70}>
                <div>
                  <Icon name={f.icon} size={20} style={{ color: "var(--color-accent)" }} />
                  <h3 className="mt-3 text-[15px] font-semibold tracking-tight text-[var(--text)]">{f.title}</h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--text-faint)]">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Neden ---- */}
      <section id="neden" className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-[1080px] px-6 py-24">
          <Reveal className="mb-16 max-w-2xl">
            <div className="text-[13px] font-semibold text-[var(--color-accent)]">Neden Founder OS</div>
            <h2 className="mt-3 text-balance text-[32px] font-bold tracking-[-0.02em] sm:text-[38px]">
              Dağınıklık değil, sakin kontrol
            </h2>
          </Reveal>

          <div className="space-y-0">
            {[
              {
                pain: "Dağınık klasörler",
                painDesc: "20 proje, 20 ayrı klasör. Hangisi nerede kaldı, hangi adım eksik — kimse bilmiyor.",
                sol: "Tek envanter",
                solDesc: "Tüm projeler tek listede; aşama, sağlık ve sonraki adım her zaman görünür.",
              },
              {
                pain: "Yavaş Notion",
                painDesc: "Sayfa açılması beklenen saniyeler. Founder hızına yetişemeyen ağır bir araç.",
                sol: "Anında & yerel",
                solDesc: "Yerel-öncelikli, sıfır gecikme. Cmd+K ile her yere bir saniyede.",
              },
              {
                pain: "Kopuk araçlar",
                painDesc: "Görevler bir yerde, finans başka yerde, hedefler hiçbir yerde. Bütün resim yok.",
                sol: "Bağlı sistem",
                solDesc: "Görev → proje → hedef → finans birbirine bağlı. Tek karar, her yerde güncel.",
              },
            ].map((c, i) => (
              <Reveal key={c.pain} delay={i * 60}>
                <div>
                  {i > 0 && <div className="h-px w-full bg-[var(--border)]" />}
                  <div className="grid grid-cols-1 items-baseline gap-4 py-8 md:grid-cols-[1fr_1.4fr]">
                    <div className="flex items-center gap-2 text-[15px] text-[var(--text-faint)]">
                      <Icon name="XCircle" size={17} style={{ color: "var(--color-health-risk)" }} />
                      <span className="line-through">{c.pain}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-[16px] font-semibold text-[var(--text)]">
                        <Icon name="CheckCircle" size={17} style={{ color: "var(--color-health-good)" }} />
                        {c.sol}
                      </div>
                      <p className="mt-1.5 pl-[25px] text-[14px] leading-relaxed text-[var(--text-dim)]">{c.solDesc}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Fiyat ---- */}
      <section id="fiyat" className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-[1080px] px-6 py-24">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_1fr]">
            <Reveal>
              <div className="text-[13px] font-semibold text-[var(--color-accent)]">Fiyat</div>
              <h2 className="mt-3 text-balance text-[32px] font-bold tracking-[-0.02em] sm:text-[38px]">
                Dürüst olalım: bu bizim aracımız
              </h2>
              <p className="mt-4 max-w-md text-[16px] leading-relaxed text-[var(--text-dim)]">
                Founder OS'u kendi 20+ projemizi yönetmek için yaptık. Senin için de açık.
                Şimdilik tamamen ücretsiz.
              </p>
            </Reveal>

            <Reveal delay={100}>
              <div className="flex items-end gap-2">
                <span className="text-[52px] font-bold leading-none tracking-[-0.03em]">$0</span>
                <span className="mb-2 text-[14px] text-[var(--text-faint)]">/ sonsuza dek</span>
              </div>
              <div className="mt-7 space-y-0">
                {[
                  "Sınırsız proje, görev ve sayfa",
                  "Board / Tablo / Takvim / Timeline",
                  "Finans, hedef ve launch merkezi",
                  "Cmd+K ile her şeye anında erişim",
                  "Yerel-öncelikli, veri senin cihazında",
                ].map((f, i) => (
                  <div key={f}>
                    {i > 0 && <div className="h-px w-full bg-[var(--border)]" />}
                    <div className="flex items-center gap-3 py-2.5 text-[14px] text-[var(--text-dim)]">
                      <Icon name="Check" size={15} style={{ color: "var(--color-health-good)" }} />
                      {f}
                    </div>
                  </div>
                ))}
              </div>
              <Button asChild variant="primary" size="lg" className="mt-7">
                <Link href="/app">
                  Hemen Başla
                  <Icon name="ArrowRight" size={16} />
                </Link>
              </Button>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---- Final CTA ---- */}
      <section className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-[1080px] px-6 py-28">
          <Reveal className="max-w-2xl">
            <h2 className="text-balance text-[34px] font-bold leading-[1.08] tracking-[-0.02em] sm:text-[44px]">
              Beynini bir araca devret.
            </h2>
            <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-[var(--text-dim)]">
              20 projeyi tek ekranda topla, dağınıklığı bitir, yayına odaklan.
            </p>
            <Button asChild variant="primary" size="lg" className="mt-8">
              <Link href="/app">
                Uygulamayı Aç
                <Icon name="ArrowRight" size={16} />
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="border-t border-[var(--border)]">
        <div className="mx-auto flex max-w-[1080px] flex-col items-center justify-between gap-5 px-6 py-10 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--color-accent)]">
              <Icon name="Brain" size={14} className="text-white" />
            </span>
            <span className="text-[14px] font-semibold">Founder OS</span>
          </div>

          <div className="flex items-center gap-6 text-[13px] text-[var(--text-faint)]">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="hover:text-[var(--text)]">
                {n.label}
              </a>
            ))}
            <Link href="/app" className="hover:text-[var(--text)]">
              Uygulama
            </Link>
          </div>

          <div className="text-[12px] text-[var(--text-faint)]">
            © {new Date().getFullYear()} Founder OS
          </div>
        </div>
      </footer>
    </main>
  );
}
