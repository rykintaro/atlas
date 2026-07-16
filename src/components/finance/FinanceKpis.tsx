import { useCountUp } from "../../hooks/useCountUp";
import type { FinanceRow } from "../../lib/finance";
import { eur } from "../../lib/money";

function deltaClass(d: number): string {
  return `delta ${d > 0 ? "up" : d < 0 ? "down" : "flat"}`;
}

function signedEur(d: number): string {
  return `${d >= 0 ? "+" : "−"}€${Math.abs(Math.round(d)).toLocaleString("en-US")}`;
}

export function FinanceKpis({ rows }: { rows: FinanceRow[] }) {
  const latest = rows[rows.length - 1];
  const prev = rows[rows.length - 2];
  const mean = rows.length ? rows.reduce((s, r) => s + r.saved, 0) / rows.length : 0;
  const net = useCountUp(latest?.net ?? 0);
  const rate = useCountUp(latest?.rate ?? 0);
  const avg = useCountUp(mean);

  return (
    <section className="stats fin-stats">
      <div className="stat">
        <div className="num">{latest ? eur(net) : "—"}</div>
        <div className="lbl">Net worth</div>
        {latest && prev && (
          <div className={deltaClass(latest.net - prev.net)}>
            {signedEur(latest.net - prev.net)} vs prev. month
          </div>
        )}
      </div>
      <div className="stat">
        <div className="num">{latest && latest.rate !== null ? `${Math.round(rate)}%` : "—"}</div>
        <div className="lbl">Savings rate</div>
        {latest && prev && latest.rate !== null && prev.rate !== null && (
          <div className={deltaClass(latest.rate - prev.rate)}>
            {`${latest.rate - prev.rate >= 0 ? "+" : "−"}${Math.abs(latest.rate - prev.rate).toFixed(1)} pp vs prev. month`}
          </div>
        )}
      </div>
      <div className="stat">
        <div className="num">{latest ? eur(avg) : "—"}</div>
        <div className="lbl">Avg monthly savings</div>
        {latest && (
          <div className="delta flat">{`over ${rows.length} month${rows.length === 1 ? "" : "s"}`}</div>
        )}
      </div>
    </section>
  );
}
