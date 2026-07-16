import { useState, type KeyboardEvent, type PointerEvent } from "react";
import { useContainerWidth } from "../../hooks/useContainerWidth";
import { niceTicks } from "../../lib/chart";
import { monthLabel } from "../../lib/date";
import type { FinanceRow } from "../../lib/finance";
import { eur, eurCompact } from "../../lib/money";
import { ChartTooltip } from "./ChartTooltip";

const H = 250;
const PAD = { l: 54, r: 64, t: 14, b: 28 };

export function NetWorthChart({ rows }: { rows: FinanceRow[] }) {
  const [ref, width] = useContainerWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  if (rows.length < 2) {
    return (
      <div className="chart" ref={ref}>
        <p className="empty">Add at least two monthly entries to see your net-worth trend.</p>
      </div>
    );
  }

  const W = Math.max(width, 320);
  const pw = W - PAD.l - PAD.r;
  const ph = H - PAD.t - PAD.b;
  const nets = rows.map(r => r.net);
  const ticks = niceTicks(Math.min(0, ...nets), Math.max(...nets));
  const lo = ticks[0];
  const hi = ticks[ticks.length - 1];
  const x = (i: number) => PAD.l + (i * pw) / (rows.length - 1);
  const y = (v: number) => PAD.t + ph - ((v - lo) / (hi - lo || 1)) * ph;

  const points = rows.map((r, i) => [x(i), y(r.net)] as const);
  const lineD = points.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join("");
  const base = y(Math.min(Math.max(0, lo), hi));
  const areaD = `${lineD} L${points[points.length - 1][0]},${base} L${points[0][0]},${base} Z`;
  const last = points[points.length - 1];
  const labelStep = Math.ceil(rows.length / 6);

  const indexFromPointer = (e: PointerEvent<SVGRectElement>) => {
    const box = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
    const i = Math.round((e.clientX - box.left - PAD.l) / (pw / (rows.length - 1)));
    return Math.max(0, Math.min(rows.length - 1, i));
  };

  const onKeyDown = (e: KeyboardEvent<SVGRectElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    setHover(h => {
      const current = h ?? rows.length - 1;
      return e.key === "ArrowLeft"
        ? Math.max(0, current - 1)
        : Math.min(rows.length - 1, current + 1);
    });
  };

  const activeIdx = hover !== null && hover < rows.length ? hover : null;
  const hovered = activeIdx === null ? null : rows[activeIdx];

  return (
    <div className="chart" ref={ref}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Net worth over time">
        {ticks.map(t => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="var(--viz-grid)" />
            <text x={PAD.l - 8} y={y(t) + 4} textAnchor="end" className="tick">
              {eurCompact(t)}
            </text>
          </g>
        ))}
        {rows.map((r, i) =>
          i % labelStep === 0 ? (
            <text key={r.month} x={x(i)} y={H - 8} textAnchor="middle">
              {monthLabel(r.month, i === 0 || r.month.endsWith("-01") ? "year" : undefined)}
            </text>
          ) : null,
        )}
        <path d={areaD} fill="var(--viz-s1)" opacity={0.1} />
        <path
          d={lineD}
          fill="none"
          stroke="var(--viz-s1)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle cx={last[0]} cy={last[1]} r={5} fill="var(--viz-s1)" stroke="var(--surface)" strokeWidth={2} />
        <text x={last[0] + 9} y={last[1] + 4} className="dlabel">
          {eurCompact(rows[rows.length - 1].net)}
        </text>
        {activeIdx !== null && hovered && (
          <>
            <line
              x1={x(activeIdx)}
              x2={x(activeIdx)}
              y1={PAD.t}
              y2={PAD.t + ph}
              stroke="var(--viz-axis)"
            />
            <circle
              cx={x(activeIdx)}
              cy={y(hovered.net)}
              r={5}
              fill="var(--viz-s1)"
              stroke="var(--surface)"
              strokeWidth={2}
            />
          </>
        )}
        <rect
          x={PAD.l}
          y={PAD.t}
          width={pw}
          height={ph}
          fill="transparent"
          tabIndex={0}
          style={{ cursor: "crosshair" }}
          onPointerMove={e => setHover(indexFromPointer(e))}
          onPointerLeave={() => setHover(null)}
          onFocus={() => setHover(rows.length - 1)}
          onBlur={() => setHover(null)}
          onKeyDown={onKeyDown}
        />
      </svg>
      {hovered && activeIdx !== null && (
        <ChartTooltip
          title={monthLabel(hovered.month, "long")}
          rows={[
            { value: eur(hovered.net), label: "net worth", color: "var(--viz-s1)" },
            { value: eur(hovered.saved), label: hovered.saved >= 0 ? "saved" : "deficit" },
          ]}
          x={x(activeIdx)}
          y={PAD.t}
          chartWidth={W}
        />
      )}
    </div>
  );
}
