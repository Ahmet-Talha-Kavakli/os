"use client";

import { useState, useMemo } from "react";
import { useStore, useActiveProjects } from "@/lib/store";
import { PageShell } from "@/components/shell/page-header";
import { Stat, StatRow } from "@/components/ui/stat";
import { Badge, Divider } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { formatCurrency, relativeDay } from "@/lib/utils";

const CAT: Record<string, string> = { infra: "Altyapı", api: "API", domain: "Domain", tooling: "Araçlar", tax: "Vergi/Mali", other: "Diğer" };
const CADENCE: Record<string, string> = { monthly: "Aylık", yearly: "Yıllık", once: "Tek seferlik" };

// kategori renkleri — sakin, tek-aksanlı paletten türetilen tonlar
const CAT_COLOR: Record<string, string> = {
  infra: "var(--color-accent)",
  api: "#6f9bff",
  domain: "#5bb98c",
  tooling: "#c79a5b",
  tax: "#b07fd6",
  other: "#8a93a3",
};

const monthlyOf = (amount: number, cadence: string) => (cadence === "yearly" ? amount / 12 : cadence === "once" ? 0 : amount);

export default function FinancePage() {
  const projects = useActiveProjects();
  const expenses = useStore((s) => s.expenses);
  const addExpense = useStore((s) => s.addExpense);
  const updateExpense = useStore((s) => s.updateExpense);
  const deleteExpense = useStore((s) => s.deleteExpense);

  const [budget, setBudget] = useState(1000);
  const [editBudget, setEditBudget] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", amount: "", category: "infra", cadence: "monthly" });
  const [editing, setEditing] = useState<string | null>(null);

  const totalMrr = projects.reduce((a, p) => a + p.mrr, 0);
  const monthlyCost = useMemo(() => Math.round(expenses.reduce((a, e) => a + monthlyOf(e.amount, e.cadence), 0)), [expenses]);
  const net = totalMrr - monthlyCost;
  const budgetLeft = budget - monthlyCost;
  const budgetPct = Math.min(100, Math.round((monthlyCost / budget) * 100));

  const earners = projects.filter((p) => p.mrr > 0).sort((a, b) => b.mrr - a.mrr);
  const preRevenue = projects.filter((p) => p.mrr === 0).length;
  const maxMrr = Math.max(1, ...earners.map((e) => e.mrr));

  const upcoming = useMemo(
    () => expenses.filter((e) => e.nextDue).sort((a, b) => new Date(a.nextDue!).getTime() - new Date(b.nextDue!).getTime()).slice(0, 5),
    [expenses]
  );

  // kategori kırılımı — aylıklaştırılmış gider toplamları
  const catBreakdown = useMemo(() => {
    const totals: Record<string, number> = {};
    expenses.forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + monthlyOf(e.amount, e.cadence);
    });
    const sum = Object.values(totals).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(totals)
      .filter(([, v]) => v > 0)
      .map(([cat, value]) => ({ cat, value: Math.round(value), pct: Math.round((value / sum) * 100) }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const submit = () => {
    if (!form.name.trim()) return;
    addExpense({ name: form.name.trim(), amount: Number(form.amount) || 0, category: form.category as any, cadence: form.cadence as any });
    setForm({ name: "", amount: "", category: "infra", cadence: "monthly" });
    setAdding(false);
  };

  return (
    <PageShell crumbs={[{ label: "Finans" }]}>
      <div className="notion-width mx-auto px-12 pb-20 pt-4 animate-rise">
        <div className="mb-8">
          <h1 className="text-[34px] font-bold leading-tight tracking-[-0.02em] text-[var(--text)]">Finans</h1>
          <p className="mt-1.5 text-[15px] text-[var(--text-faint)]">Aylık net {net >= 0 ? "+" : ""}{formatCurrency(net)} · {expenses.length} gider kalemi</p>
        </div>

        <StatRow className="mb-12 grid-cols-4">
          <Stat label="Aylık gelir (MRR)" value={totalMrr} prefix="$" />
          <Stat label="Aylık gider" value={monthlyCost} prefix="$" />
          <Stat label="Net" value={net} prefix="$" />
          <Stat label="Bütçe kalan" value={budgetLeft} prefix="$" />
        </StatRow>

        {/* bütçe */}
        <section className="mb-12">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-[var(--text-dim)]">Aylık bütçe</h2>
            {editBudget ? (
              <input
                autoFocus type="number" value={budget}
                onChange={(e) => setBudget(Number(e.target.value) || 0)}
                onBlur={() => setEditBudget(false)}
                onKeyDown={(e) => e.key === "Enter" && setEditBudget(false)}
                className="w-24 rounded-md border border-[var(--border)] bg-[var(--bg-raised)] px-2 py-0.5 text-right text-[13px] text-[var(--text)] outline-none"
              />
            ) : (
              <button onClick={() => setEditBudget(true)} className="text-[13px] text-[var(--text-faint)] hover:text-[var(--text)]">{formatCurrency(budget)} <Icon name="PencilSimple" size={11} className="inline" /></button>
            )}
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-active)]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${budgetPct}%`,
                background: budgetPct > 90 ? "var(--color-health-risk)" : budgetPct > 70 ? "var(--color-health-warn)" : "var(--color-health-good)",
              }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[12px] text-[var(--text-faint)]">
            <span>{formatCurrency(monthlyCost)} harcandı (%{budgetPct})</span>
            <span>{formatCurrency(Math.max(0, budgetLeft))} kaldı</span>
          </div>

          {/* kategori kırılımı — ince yatay yığılı çubuk + düzenli legend */}
          {catBreakdown.length > 0 && (
            <div className="mt-6">
              <div className="mb-2.5 flex h-1.5 overflow-hidden rounded-full bg-[var(--bg-active)]">
                {catBreakdown.map(({ cat, pct }) => (
                  <div
                    key={cat}
                    className="h-full first:rounded-l-full last:rounded-r-full"
                    style={{ width: `${pct}%`, background: CAT_COLOR[cat] ?? "var(--text-faint)" }}
                    title={`${CAT[cat]}: %${pct}`}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {catBreakdown.map(({ cat, value, pct }) => (
                  <span key={cat} className="flex items-center gap-1.5 text-[12px] text-[var(--text-faint)]">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: CAT_COLOR[cat] ?? "var(--text-faint)" }} />
                    {CAT[cat]}
                    <span className="tabular-nums text-[var(--text-dim)]">{formatCurrency(value)}</span>
                    <span className="tabular-nums opacity-60">%{pct}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 gap-x-14 gap-y-12 lg:grid-cols-[1.4fr_1fr]">
          {/* sol: giderler */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-[var(--text-dim)]">Giderler / Abonelikler</h2>
              <button onClick={() => setAdding((v) => !v)} className="text-[13px] text-[var(--color-accent)] hover:underline">+ Ekle</button>
            </div>

            {adding && (
              <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg bg-[var(--bg-hover)] p-2.5">
                <input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ad" className="flex-1 rounded-md border border-[var(--border)] bg-[var(--bg-raised)] px-2 py-1 text-[13px] text-[var(--text)] outline-none" />
                <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="$" type="number" className="w-20 rounded-md border border-[var(--border)] bg-[var(--bg-raised)] px-2 py-1 text-[13px] text-[var(--text)] outline-none" />
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)] px-2 py-1 text-[13px] text-[var(--text)] outline-none">
                  {Object.entries(CAT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <select value={form.cadence} onChange={(e) => setForm({ ...form, cadence: e.target.value })} className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)] px-2 py-1 text-[13px] text-[var(--text)] outline-none">
                  {Object.entries(CADENCE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <Button variant="primary" size="sm" onClick={submit}>Ekle</Button>
              </div>
            )}

            <div>
              {expenses.map((e, i) => (
                <div key={e.id}>
                  {i > 0 && <Divider />}
                  {editing === e.id ? (
                    <div className="flex flex-wrap items-center gap-2 py-2">
                      <input
                        autoFocus value={e.name}
                        onChange={(ev) => updateExpense(e.id, { name: ev.target.value })}
                        className="flex-1 rounded-md border border-[var(--border)] bg-[var(--bg-raised)] px-2 py-1 text-[13px] text-[var(--text)] outline-none"
                      />
                      <input
                        type="number" value={e.amount}
                        onChange={(ev) => updateExpense(e.id, { amount: Number(ev.target.value) || 0 })}
                        className="w-20 rounded-md border border-[var(--border)] bg-[var(--bg-raised)] px-2 py-1 text-[13px] text-[var(--text)] outline-none"
                      />
                      <select value={e.category} onChange={(ev) => updateExpense(e.id, { category: ev.target.value as any })} className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)] px-2 py-1 text-[13px] text-[var(--text)] outline-none">
                        {Object.entries(CAT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <select value={e.cadence} onChange={(ev) => updateExpense(e.id, { cadence: ev.target.value as any })} className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)] px-2 py-1 text-[13px] text-[var(--text)] outline-none">
                        {Object.entries(CADENCE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <Button variant="subtle" size="sm" onClick={() => setEditing(null)}>Bitti</Button>
                    </div>
                  ) : (
                    <div className="group flex items-center gap-3 py-2.5">
                      <span className="flex-1 text-[14px] text-[var(--text)]">{e.name}</span>
                      <Badge>{CAT[e.category]}</Badge>
                      <button onClick={() => setEditing(e.id)} className="w-20 text-right text-[13px] text-[var(--text-dim)] hover:text-[var(--text)]" title="Düzenle">{formatCurrency(e.amount)}</button>
                      <span className="w-14 text-right text-[12px] text-[var(--text-faint)]">{e.cadence === "monthly" ? "/ay" : e.cadence === "yearly" ? "/yıl" : "tek"}</span>
                      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <button onClick={() => setEditing(e.id)} className="rounded-md p-1 text-[var(--text-faint)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]" title="Düzenle">
                          <Icon name="PencilSimple" size={13} />
                        </button>
                        <button onClick={() => deleteExpense(e.id)} className="rounded-md p-1 text-[var(--text-faint)] hover:text-[var(--color-health-risk)]" title="Sil">
                          <Icon name="X" size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <Divider />
              <div className="flex items-center justify-between py-2.5 text-[14px]">
                <span className="font-medium text-[var(--text)]">Aylık toplam</span>
                <span className="font-semibold text-[var(--text)]">{formatCurrency(monthlyCost)}</span>
              </div>
            </div>
          </div>

          {/* sağ: gelir + yaklaşan */}
          <div className="space-y-12">
            <section>
              <h2 className="mb-2 text-[13px] font-semibold text-[var(--text-dim)]">Gelir (projelere göre)</h2>
              {earners.length === 0 ? (
                <p className="py-4 text-[14px] text-[var(--text-faint)]">Henüz gelir üreten proje yok. {preRevenue} proje gelir öncesi.</p>
              ) : (
                <div className="space-y-3.5">
                  {earners.map((p) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <Icon name={p.icon} size={14} style={{ color: p.color }} className="shrink-0" />
                      <span className="w-24 shrink-0 truncate text-[13px] text-[var(--text)]">{p.name}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--bg-active)]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${(p.mrr / maxMrr) * 100}%`, background: "var(--color-health-good)" }}
                        />
                      </div>
                      <span className="w-14 shrink-0 text-right text-[13px] font-medium tabular-nums text-[var(--text)]">{formatCurrency(p.mrr)}</span>
                    </div>
                  ))}
                  {preRevenue > 0 && <p className="pt-1 text-[12px] text-[var(--text-faint)]">+ {preRevenue} proje gelir öncesi</p>}
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-2 text-[13px] font-semibold text-[var(--text-dim)]">Yaklaşan ödemeler</h2>
              <div>
                {upcoming.map((e, i) => (
                  <div key={e.id}>
                    {i > 0 && <Divider />}
                    <div className="flex items-center gap-2 py-2">
                      <span className="flex-1 text-[14px] text-[var(--text)]">{e.name}</span>
                      <span className="text-[13px] text-[var(--text-dim)]">{formatCurrency(e.amount)}</span>
                      <span className="w-24 text-right text-[12px] text-[var(--text-faint)]">{relativeDay(e.nextDue)}</span>
                    </div>
                  </div>
                ))}
                {upcoming.length === 0 && <p className="py-3 text-[14px] text-[var(--text-faint)]">Yaklaşan ödeme yok.</p>}
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
