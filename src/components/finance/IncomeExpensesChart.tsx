import { useState } from "react";
import { useContainerWidth } from "../../hooks/useContainerWidth";
import { barPath, niceTicks } from "../../lib/chart";
import { monthLabel } from "../../lib/date";
import type { FinanceRow } from "../../lib/finance";
import { eur, eurCompact } from "../../lib/money";
import { ChartTooltip } from "./ChartTooltip";

const H = 250;
const PAD = { l: 54, r: 14, t: 14, b: 28 };

export function IncomeExpensesChart({ rows }: { rows: FinanceRow[] }) {
  const [ref, width] = useContainerWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  if (!rows.length) {
    return (
      <div className="chart" ref={ref}>
        <p className="empty">No data yet.</p>
      </div>
    );
  }

  const W = Math.max(width, 320);
  const pw = W - PAD.l - PAD.r;
  const ph = H - PAD.t - PAD.b;
  const ticks = niceTicks(0, Math.max(...rows.map(r => Math.max(r.income, r.expenses)), 1));
  const hi = ticks[ticks.length - 1];
  const y = (v: number) => PAD.t + ph - (v / (hi || 1)) * ph;
  const gw = pw / rows.length;
  const inner = Math.min(50, gw * 0.7);
  const bw = (inner - 2) / 2;
  const labelStep = Math.ceil(rows.length / 8);
  const activeIdx = hover !== null && hover < rows.length ? hover : null;
  const hovered = activeIdx === null ? null : rows[activeIdx];

  return (
    <div className="chart" ref={ref}>
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Income versus expenses by month"
      >
        {ticks.map(t => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="var(--viz-grid)" />
            <text x={PAD.l - 8} y={y(t) + 4} textAnchor="end" className="tick">
              {eurCompact(t)}
            </text>
          </g>
        ))}
        <line x1={PAD.l} x2={W - PAD.r} y1={y(0)} y2={y(0)} stroke="var(--viz-axis)" />
        {rows.map((r, i) =>
          i % labelStep === 0 ? (
            <text key={r.month} x={PAD.l + i * gw + gw / 2} y={H - 8} textAnchor="middle">
              {monthLabel(r.month, i === 0 || r.month.endsWith("-01") ? "year" : undefined)}
            </text>
          ) : null,
        )}
        {rows.map((r, i) => {
          const x0 = PAD.l + i * gw + (gw - inner) / 2;
          return (
            <g key={r.month}>
              <path d={barPath(x0, y(0), bw, Math.max(y(0) - y(r.income), 1), 1)} fill="var(--viz-s1)" />
              <path
                d={barPath(x0 + bw + 2, y(0), bw, Math.max(y(0) - y(r.expenses), 1), 1)}
                fill="var(--viz-s2)"
              />
            </g>
          );
        })}
        {activeIdx !== null && (
          <rect
            x={PAD.l + activeIdx * gw}
            y={PAD.t}
            width={gw}
            height={ph}
            fill="var(--text)"
            opacity={0.05}
            pointerEvents="none"
          />
        )}
        {rows.map((r, i) => (
          <rect
            key={r.month}
            x={PAD.l + i * gw}
            y={PAD.t}
            width={gw}
            height={ph}
            fill="transparent"
            tabIndex={0}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
          />
        ))}
      </svg>
      {hovered && activeIdx !== null && (
        <ChartTooltip
          title={monthLabel(hovered.month, "long")}
          rows={[
            { value: eur(hovered.income), label: "income", color: "var(--viz-s1)" },
            { value: eur(hovered.expenses), label: "expenses", color: "var(--viz-s2)" },
            { value: eur(hovered.saved), label: hovered.saved >= 0 ? "saved" : "deficit" },
          ]}
          x={PAD.l + activeIdx * gw + gw / 2}
          y={PAD.t}
          chartWidth={W}
        />
      )}
    </div>
  );
}
