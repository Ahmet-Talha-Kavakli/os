"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Avatar } from "@/components/ui/primitives";

const ACCOUNTS = [
  { id: "m1", name: "Sen", role: "Owner", color: "#2e7cf6" },
  { id: "m2", name: "Ortağım", role: "Üye", color: "#c69a3f" },
];

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/app";

  const [account, setAccount] = useState("m1");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!password) { setError("Şifre gerekli."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Giriş başarısız."); setLoading(false); return; }
      router.replace(next);
    } catch {
      setError("Bağlantı hatası.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      {/* sol: form */}
      <div className="flex flex-1 flex-col justify-center px-8 sm:px-16 lg:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)]">
              <Icon name="Hexagon" size={18} weight="fill" className="text-white" />
            </span>
            <span className="text-[16px] font-semibold text-[var(--text)]">Founder OS</span>
          </div>

          <h1 className="text-[28px] font-bold tracking-[-0.02em] text-[var(--text)]">Workspace'e gir</h1>
          <p className="mt-2 text-[14px] text-[var(--text-faint)]">Bu özel bir workspace. Sadece sen ve ortağın erişebilir.</p>

          <div className="mt-8">
            <div className="mb-2 text-[12px] font-medium uppercase tracking-wider text-[var(--text-faint)]">Hesap</div>
            <div className="grid grid-cols-2 gap-2">
              {ACCOUNTS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAccount(a.id)}
                  className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                    account === a.id ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]" : "border-[var(--border)] hover:bg-[var(--bg-hover)]"
                  }`}
                >
                  <Avatar name={a.name} color={a.color} size={28} />
                  <div className="leading-tight">
                    <div className="text-[13px] font-medium text-[var(--text)]">{a.name}</div>
                    <div className="text-[11px] text-[var(--text-faint)]">{a.role}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 text-[12px] font-medium uppercase tracking-wider text-[var(--text-faint)]">Şifre</div>
            <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-raised)] px-3">
              <Icon name="Lock" size={15} className="text-[var(--text-faint)]" />
              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="••••••••"
                className="flex-1 bg-transparent py-2.5 text-[14px] text-[var(--text)] outline-none placeholder:text-[var(--text-faint)]"
              />
            </div>
          </div>

          {error && <p className="mt-3 text-[13px] text-[var(--color-health-risk)]">{error}</p>}

          <Button variant="primary" size="lg" className="mt-6 w-full" onClick={submit} disabled={loading}>
            {loading ? "Giriş yapılıyor…" : <>Giriş Yap <Icon name="ArrowRight" size={16} /></>}
          </Button>

          <p className="mt-8 text-center text-[12px] text-[var(--text-faint)]">
            Yeni kayıt yok — bu workspace yalnızca iki kişiliktir.
          </p>
        </div>
      </div>

      {/* sağ: panel */}
      <div className="hidden flex-1 flex-col justify-center border-l border-[var(--border)] bg-[var(--sidebar-bg)] px-16 lg:flex">
        <div className="max-w-md">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent)]">
            <Icon name="Hexagon" size={22} weight="fill" className="text-white" />
          </span>
          <h2 className="mt-6 text-[32px] font-bold leading-tight tracking-[-0.02em] text-[var(--text)]">
            Şirketinin beyni.<br /><span className="text-[var(--text-faint)]">Dağınıklık bitti.</span>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--text-dim)]">
            20+ MVP'yi iki kişilik bir ekiple yayına taşımak için sakin, açık, tek komuta merkezi.
          </p>
          <div className="mt-8 grid grid-cols-3 divide-x divide-[var(--border)]">
            {[["20+", "proje"], ["2", "kişi"], ["0", "dağınıklık"]].map(([v, l], i) => (
              <div key={l} className={i === 0 ? "pr-4" : "px-4"}>
                <div className="text-[24px] font-bold text-[var(--text)]">{v}</div>
                <div className="text-[12px] text-[var(--text-faint)]">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
