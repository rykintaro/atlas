import type { FinanceEntry, FinanceRange } from "../types";

export interface FinanceRow extends FinanceEntry {
  net: number;
  saved: number;
  rate: number | null;
}

export function computeFinance(entries: FinanceEntry[]): FinanceRow[] {
  const sorted = [...entries].sort((a, b) => (a.month < b.month ? -1 : 1));
  let carry = 0;
  return sorted.map(e => {
    const net = e.net ?? carry + e.income - e.expenses;
    carry = net;
    return {
      ...e,
      net,
      saved: e.income - e.expenses,
      rate: e.income > 0 ? ((e.income - e.expenses) / e.income) * 100 : null,
    };
  });
}

export function financeSeries(entries: FinanceEntry[], range: FinanceRange): FinanceRow[] {
  const rows = computeFinance(entries);
  return range === "all" ? rows : rows.slice(-Number(range));
}

export const SAMPLE_FINANCE: ReadonlyArray<
  readonly [string, number, number, number | null]
> = [
  ["2025-07", 3200, 2540, 9100],
  ["2025-08", 3200, 2710, null],
  ["2025-09", 3250, 2380, null],
  ["2025-10", 3250, 2650, null],
  ["2025-11", 3250, 2900, null],
  ["2025-12", 3300, 3720, null],
  ["2026-01", 3400, 2510, null],
  ["2026-02", 3400, 2440, null],
  ["2026-03", 3400, 2760, null],
  ["2026-04", 3500, 2590, null],
  ["2026-05", 3500, 2810, null],
  ["2026-06", 3550, 2480, null],
  ["2026-07", 3600, 2530, null],
];
