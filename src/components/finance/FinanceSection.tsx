import { useMemo } from "react";
import { useApp } from "../../hooks/useAppState";
import { financeSeries } from "../../lib/finance";
import type { FinanceRange } from "../../types";
import { EntriesCard } from "./EntriesCard";
import { FinanceKpis } from "./FinanceKpis";
import { IncomeExpensesChart } from "./IncomeExpensesChart";
import { NetWorthChart } from "./NetWorthChart";
import { SavingsChart } from "./SavingsChart";

const RANGES: { value: FinanceRange; label: string }[] = [
  { value: "6", label: "6M" },
  { value: "12", label: "12M" },
  { value: "all", label: "All" },
];

export function FinanceSection() {
  const { state, update } = useApp();
  const rows = useMemo(
    () => financeSeries(state.finance, state.financeRange),
    [state.finance, state.financeRange],
  );

  const setRange = (range: FinanceRange) => update(s => ({ ...s, financeRange: range }));

  return (
    <>
      <div className="view-head">
        <div>
          <h1 className="view-title">Finances</h1>
          <p className="view-sub">
            {state.finance.length
              ? `${state.finance.length} monthly entries`
              : "Track income, spending and net worth"}
          </p>
        </div>
        <div className="range-row">
          {RANGES.map(r => (
            <button
              key={r.value}
              className={`btn-ghost ${state.financeRange === r.value ? "active" : ""}`}
              onClick={() => setRange(r.value)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <FinanceKpis rows={rows} />
      <div className="grid fin-grid">
        <section className="card span2 chart-card">
          <h2>Net worth</h2>
          <NetWorthChart rows={rows} />
        </section>
        <section className="card chart-card">
          <h2>Monthly savings</h2>
          <div className="legend">
            <span>
              <i style={{ background: "var(--viz-s1)" }} />
              Saved
            </span>
            <span>
              <i style={{ background: "var(--viz-neg)" }} />
              Deficit
            </span>
          </div>
          <SavingsChart rows={rows} />
        </section>
        <section className="card span2 chart-card">
          <h2>Income vs expenses</h2>
          <div className="legend">
            <span>
              <i style={{ background: "var(--viz-s1)" }} />
              Income
            </span>
            <span>
              <i style={{ background: "var(--viz-s2)" }} />
              Expenses
            </span>
          </div>
          <IncomeExpensesChart rows={rows} />
        </section>
        <EntriesCard />
      </div>
    </>
  );
}
