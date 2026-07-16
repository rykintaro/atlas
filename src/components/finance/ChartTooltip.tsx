import type { CSSProperties } from "react";

export interface TipRow {
  value: string;
  label: string;
  color?: string;
}

interface Props {
  title: string;
  rows: TipRow[];
  x: number;
  y: number;
  chartWidth: number;
}

export function ChartTooltip({ title, rows, x, y, chartWidth }: Props) {
  const flip = x > chartWidth * 0.55;
  const style: CSSProperties = flip
    ? { left: x - 14, top: Math.max(0, y), transform: "translateX(-100%)" }
    : { left: x + 14, top: Math.max(0, y) };

  return (
    <div className="viz-tip" style={style}>
      <div className="tip-title">{title}</div>
      {rows.map(row => (
        <div className="tip-row" key={row.label}>
          {row.color && <i style={{ background: row.color }} />}
          <b>{row.value}</b>
          <span>{row.label}</span>
        </div>
      ))}
    </div>
  );
}
