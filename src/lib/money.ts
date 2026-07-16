const fmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function eur(n: number): string {
  return (n < 0 ? "−€" : "€") + fmt.format(Math.abs(Math.round(n)));
}

export function eurCompact(n: number): string {
  const sign = n < 0 ? "−" : "";
  const a = Math.abs(n);
  if (a >= 1e6) return `${sign}€${+(a / 1e6).toFixed(1)}M`;
  if (a >= 1e3) return `${sign}€${+(a / 1e3).toFixed(1)}K`;
  return `${sign}€${Math.round(a)}`;
}
