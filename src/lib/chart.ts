export function niceTicks(lo: number, hi: number, target = 4): number[] {
  const raw = (hi - lo || 1) / target;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
  const start = Math.floor(lo / step) * step;
  const out: number[] = [];
  for (let v = start; v <= hi + step / 2; v += step) out.push(v);
  return out;
}

export function barPath(x: number, base: number, w: number, h: number, dir: 1 | -1): string {
  if (h <= 0) return "";
  const r = Math.min(4, w / 2, h);
  if (dir > 0) {
    const top = base - h;
    return (
      `M${x},${base} L${x},${top + r} Q${x},${top} ${x + r},${top}` +
      ` L${x + w - r},${top} Q${x + w},${top} ${x + w},${top + r} L${x + w},${base} Z`
    );
  }
  const bot = base + h;
  return (
    `M${x},${base} L${x},${bot - r} Q${x},${bot} ${x + r},${bot}` +
    ` L${x + w - r},${bot} Q${x + w},${bot} ${x + w},${bot - r} L${x + w},${base} Z`
  );
}
