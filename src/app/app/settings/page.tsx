"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as Tabs from "@radix-ui/react-tabs";
import { useStore } from "@/lib/store";
import { PageShell } from "@/components/shell/page-header";
import { Badge, Avatar, Divider } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ACCENT_KEY = "fos-accent";
const ACCENTS: { id: string; name: string; value: string }[] = [
  { id: "default", name: "Gümüş-Mavi", value: "#5b8cff" },
  { id: "slate", name: "Soğuk Çelik", value: "#7d8aa3" },
  { id: "sage", name: "Adaçayı", value: "#5bb98c" },
  { id: "amber", name: "Kehribar", value: "#c79a5b" },
  { id: "mauve", name: "Leylak", value: "#b07fd6" },
];

const TAB_LIST: { id: string; label: string }[] = [
  { id: "genel", label: "Genel" },
  { id: "uyeler", label: "Üyeler" },
  { id: "gorunum", label: "Görünüm" },
  { id: "veri", label: "Veri" },
  { id: "hakkinda", label: "Hakkında" },
];

export default function SettingsPage() {
  const members = useStore((s) => s.members);
  const me = useStore((s) => s.currentUserId);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);

  const tabCls =
    "relative -mb-px flex items-center px-1 pb-2.5 text-[14px] font-medium text-[var(--text-faint)] outline-none transition-colors hover:text-[var(--text-dim)] data-[state=active]:text-[var(--text)] after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:bg-[var(--text)] after:opacity-0 data-[state=active]:after:opacity-100";

  return (
    <PageShell crumbs={[{ label: "Ayarlar" }]}>
      <div className="notion-narrow mx-auto px-12 pb-20 pt-4 animate-rise">
        <div className="mb-10">
          <h1 className="text-[34px] font-bold leading-tight tracking-[-0.02em] text-[var(--text)]">Ayarlar</h1>
          <p className="mt-1.5 text-[15px] text-[var(--text-faint)]">Çalışma alanını, ekibini ve görünümü yönet</p>
        </div>

        <Tabs.Root defaultValue="genel" className="flex flex-col">
          <Tabs.List className="mb-10 flex items-center gap-6 border-b border-[var(--border)]">
            {TAB_LIST.map((t) => (
              <Tabs.Trigger key={t.id} value={t.id} className={tabCls}>
                {t.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {/* GENEL */}
          <Tabs.Content value="genel" className="animate-fade space-y-12 outline-none">
            <section>
              <h2 className="mb-3 text-[13px] font-semibold text-[var(--text-dim)]">Çalışma alanı</h2>
              <div>
                <FieldRow label="Çalışma alanı adı" hint="Bu kişisel kurucu paneli için sabit." first>
                  <div className="flex items-center gap-2.5">
                    <Icon name="Rocket" size={16} style={{ color: "var(--color-accent)" }} />
                    <span className="text-[14px] font-semibold text-[var(--text)]">Founder OS</span>
                  </div>
                </FieldRow>
                <FieldRow label="Tema" hint="Koyu sinematik tema önerilir.">
                  <ThemeToggle theme={theme} setTheme={setTheme} />
                </FieldRow>
              </div>
            </section>
          </Tabs.Content>

          {/* ÜYELER */}
          <Tabs.Content value="uyeler" className="animate-fade space-y-12 outline-none">
            <section>
              <h2 className="mb-3 text-[13px] font-semibold text-[var(--text-dim)]">Ekip · {members.length} kişi</h2>
              <div>
                {members.map((m, i) => (
                  <div key={m.id}>
                    {i > 0 && <Divider />}
                    <div className="flex items-center gap-3 py-3">
                      <Avatar name={m.name} color={m.avatarColor} size={34} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-[14px] font-medium text-[var(--text)]">{m.name}</span>
                          {m.id === me && (
                            <span className="text-[11px] text-[var(--text-faint)]">sen</span>
                          )}
                        </div>
                        <div className="truncate text-[13px] text-[var(--text-faint)]">{m.email}</div>
                      </div>
                      <Badge color={m.role === "owner" ? "var(--color-accent)" : undefined} dot={m.role === "owner"}>
                        {m.role === "owner" ? "Sahip" : "Üye"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-[13px] font-semibold text-[var(--text-dim)]">Üye davet et</h2>
              <InviteRow />
              <p className="mt-3 text-[13px] text-[var(--text-faint)]">
                Bu 2 kişilik bir ekip. Davetler şu an yalnızca yerel olarak taklit edilir — gerçek
                e-posta gönderilmez.
              </p>
            </section>
          </Tabs.Content>

          {/* GÖRÜNÜM */}
          <Tabs.Content value="gorunum" className="animate-fade space-y-12 outline-none">
            <section>
              <h2 className="mb-3 text-[13px] font-semibold text-[var(--text-dim)]">Tema</h2>
              <ThemeToggle theme={theme} setTheme={setTheme} />
            </section>
            <section>
              <h2 className="mb-3 text-[13px] font-semibold text-[var(--text-dim)]">Vurgu rengi</h2>
              <AccentSwatches />
              <p className="mt-4 text-[13px] text-[var(--text-faint)]">
                Founder OS bilinçli olarak tek nötr vurgu kullanır. Hepsi sakin, düşük doygunluklu
                tonlar — neon yok. Seçimin tarayıcına kaydedilir.
              </p>
            </section>
          </Tabs.Content>

          {/* VERİ */}
          <Tabs.Content value="veri" className="animate-fade space-y-12 outline-none">
            <section>
              <h2 className="mb-3 text-[13px] font-semibold text-[var(--text-dim)]">Veri yönetimi</h2>
              <div>
                <FieldRow label="Dışa aktar" hint="Tüm çalışma alanını JSON dosyası olarak indir." first>
                  <ExportButton />
                </FieldRow>
                <FieldRow label="Çöp kutusu" hint="Silinen öğeleri görüntüle ve geri yükle.">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/app/trash">
                      <Icon name="Trash" size={14} /> Çöp kutusuna git
                    </Link>
                  </Button>
                </FieldRow>
                <FieldRow label="Verileri sıfırla" hint="Tüm yerel veriyi siler ve başlangıç durumuna döner.">
                  <ResetButton />
                </FieldRow>
              </div>
            </section>
          </Tabs.Content>

          {/* HAKKINDA */}
          <Tabs.Content value="hakkinda" className="animate-fade space-y-5 outline-none">
            <div className="mb-3 flex items-center gap-3">
              <Icon name="Rocket" size={22} style={{ color: "var(--color-accent)" }} />
              <div>
                <div className="text-[16px] font-semibold text-[var(--text)]">Founder OS</div>
                <div className="text-[13px] text-[var(--text-faint)]">Tek kişilik kurucu için komuta merkezi</div>
              </div>
            </div>
            <p className="text-[14px] leading-relaxed text-[var(--text-dim)]">
              Founder OS; projelerini, görevlerini, dokümanlarını, hedeflerini ve finansını tek bir
              sakin panelde toplar. Fikirden yayına kadar her ürünün yaşam döngüsünü takip etmen,
              neyin riskli olduğunu görmen ve odağı kaybetmemen için tasarlandı.
            </p>
            <div className="flex items-center gap-5 text-[13px] text-[var(--text-faint)]">
              <span className="flex items-center gap-1.5">
                <Icon name="Tag" size={13} /> v1.0
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="HardDrives" size={13} /> Yerel-öncelikli · backend yok
              </span>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </PageShell>
  );
}

function FieldRow({
  label,
  hint,
  first,
  children,
}: {
  label: string;
  hint?: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      {!first && <Divider />}
      <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[14px] font-medium text-[var(--text)]">{label}</div>
          {hint && <div className="mt-0.5 text-[13px] text-[var(--text-faint)]">{hint}</div>}
        </div>
        <div className="shrink-0">{children}</div>
      </div>
    </>
  );
}

function ThemeToggle({
  theme,
  setTheme,
}: {
  theme: "dark" | "light";
  setTheme: (t: "dark" | "light") => void;
}) {
  const opts: { id: "dark" | "light"; label: string; icon: string }[] = [
    { id: "dark", label: "Koyu", icon: "Moon" },
    { id: "light", label: "Açık", icon: "Sun" },
  ];
  return (
    <div className="inline-flex rounded-lg bg-[var(--bg-hover)] p-0.5">
      {opts.map((o) => {
        const active = theme === o.id;
        return (
          <button
            key={o.id}
            onClick={() => setTheme(o.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
              active
                ? "bg-[var(--bg-raised)] text-[var(--text)] shadow-[var(--shadow-soft)]"
                : "text-[var(--text-faint)] hover:text-[var(--text)]"
            )}
          >
            <Icon name={o.icon} size={14} />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function AccentSwatches() {
  const [active, setActive] = useState<string>(ACCENTS[0].value);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(ACCENT_KEY) : null;
    if (saved) {
      setActive(saved);
      applyAccent(saved);
    }
  }, []);

  function applyAccent(value: string) {
    document.documentElement.style.setProperty("--color-accent", value);
    document.documentElement.style.setProperty("--color-accent-soft", `${value}22`);
  }

  function pick(value: string) {
    setActive(value);
    applyAccent(value);
    try {
      localStorage.setItem(ACCENT_KEY, value);
    } catch {
      /* yoksay */
    }
  }

  return (
    <div className="flex flex-wrap gap-5">
      {ACCENTS.map((a) => {
        const selected = active === a.value;
        return (
          <button
            key={a.id}
            onClick={() => pick(a.value)}
            title={a.name}
            className="flex flex-col items-center gap-2"
          >
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full transition-all",
                selected && "ring-2 ring-offset-2 ring-offset-[var(--bg)]"
              )}
              style={{ background: a.value, ...(selected ? { boxShadow: `0 0 0 2px ${a.value}` } : {}) }}
            >
              {selected && <Icon name="Check" size={16} weight="bold" color="#fff" />}
            </span>
            <span className="text-[11px] text-[var(--text-faint)]">{a.name}</span>
          </button>
        );
      })}
    </div>
  );
}

function InviteRow() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function invite() {
    if (!email.trim()) return;
    setSent(true);
    setEmail("");
    setTimeout(() => setSent(false), 2500);
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && invite()}
        placeholder="ekip@founder.os"
        className="h-9 flex-1 rounded-lg border border-[var(--border)] bg-transparent px-3 text-[14px] text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-faint)] focus:border-[var(--border-strong)]"
      />
      <Button variant="primary" size="sm" onClick={invite}>
        {sent ? (
          <>
            <Icon name="Check" size={14} /> Davet edildi
          </>
        ) : (
          <>
            <Icon name="PaperPlaneTilt" size={14} /> Davet et
          </>
        )}
      </Button>
    </div>
  );
}

function ExportButton() {
  function exportData() {
    try {
      const raw = localStorage.getItem("founder-os-v2") ?? "{}";
      const pretty = JSON.stringify(JSON.parse(raw), null, 2);
      const blob = new Blob([pretty], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `founder-os-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* yoksay */
    }
  }
  return (
    <Button variant="subtle" size="sm" onClick={exportData}>
      <Icon name="DownloadSimple" size={14} /> JSON indir
    </Button>
  );
}

function ResetButton() {
  const [confirming, setConfirming] = useState(false);

  function reset() {
    try {
      localStorage.removeItem("founder-os-v2");
      localStorage.removeItem(ACCENT_KEY);
    } catch {
      /* yoksay */
    }
    window.location.reload();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
          Vazgeç
        </Button>
        <Button variant="danger" size="sm" onClick={reset}>
          <Icon name="Warning" size={14} /> Evet, sıfırla
        </Button>
      </div>
    );
  }
  return (
    <Button variant="outline" size="sm" onClick={() => setConfirming(true)}>
      <Icon name="ArrowsClockwise" size={14} /> Verileri sıfırla
    </Button>
  );
}
