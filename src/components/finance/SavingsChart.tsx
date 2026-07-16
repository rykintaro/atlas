import { useState } from "react";
import { useContainerWidth } from "../../hooks/useContainerWidth";
import { barPath, niceTicks } from "../../lib/chart";
import { monthLabel } from "../../lib/date";
import type { FinanceRow } from "../../lib/finance";
import { eur, eurCompact } from "../../lib/money";
import { ChartTooltip } from "./ChartTooltip";

const H = 250;
const PAD = { l: 48, r: 10, t: 14, b: 28 };

export function SavingsChart({ rows }: { rows: FinanceRow[] }) {
  const [ref, width] = useContainerWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  if (!rows.length) {
    return (
      <div className="chart" ref={ref}>
        <p className="empty">No data yet.</p>
      </div>
    );
  }

  const W = Math.max(width, 260);
  const pw = W - PAD.l - PAD.r;
  const ph = H - PAD.t - PAD.b;
  const values = rows.map(r => r.saved);
  const ticks = niceTicks(Math.min(0, ...values), Math.max(0, ...values));
  const lo = ticks[0];
  const hi = ticks[ticks.length - 1];
  const y = (v: number) => PAD.t + ph - ((v - lo) / (hi - lo || 1)) * ph;
  const gw = pw / rows.length;
  const bw = Math.min(24, gw * 0.55);
  const labelStep = Math.ceil(rows.length / 5);
  const activeIdx = hover !== null && hover < rows.length ? hover : null;
  const hovered = activeIdx === null ? null : rows[activeIdx];

  return (
    <div className="chart" ref={ref}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Monthly savings">
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
          const cx = PAD.l + i * gw + gw / 2;
          const h = Math.max(Math.abs(y(r.saved) - y(0)), 1);
          return (
            <path
              key={r.month}
              d={barPath(cx - bw / 2, y(0), bw, h, r.saved >= 0 ? 1 : -1)}
              fill={r.saved >= 0 ? "var(--viz-s1)" : "var(--viz-neg)"}
              className={r.saved >= 0 ? "bar-grow" : "bar-grow-down"}
              style={{ animationDelay: `${i * 45}ms` }}
            />
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
            {
              value: eur(hovered.saved),
              label: hovered.saved >= 0 ? "saved" : "deficit",
              color: hovered.saved >= 0 ? "var(--viz-s1)" : "var(--viz-neg)",
            },
            {
              value: hovered.rate === null ? "—" : `${Math.round(hovered.rate)}%`,
              label: "savings rate",
            },
          ]}
          x={PAD.l + activeIdx * gw + gw / 2}
          y={PAD.t}
          chartWidth={W}
        />
      )}
    </div>
  );
}
