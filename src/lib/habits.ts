import type { Habit } from "../types";
import { addDays, startOfWeek, todayKey } from "./date";

export const DEFAULT_TARGET = 7;
export const HEATMAP_WEEKS = 12;

export interface HeatCell {
  key: string;
  done: boolean;
  future: boolean;
}

export function habitTarget(habit: Habit): number {
  return habit.target ?? DEFAULT_TARGET;
}

export function currentStreak(habit: Habit): number {
  const days = new Set(habit.days);
  let streak = 0;
  let d = new Date();
  if (!days.has(todayKey(d))) d = addDays(d, -1);
  while (days.has(todayKey(d))) {
    streak++;
    d = addDays(d, -1);
  }
  return streak;
}

export function longestStreak(habit: Habit): number {
  const sorted = [...new Set(habit.days)].sort();
  if (!sorted.length) return 0;
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const gap = Math.round(
      (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86400000,
    );
    run = gap === 1 ? run + 1 : 1;
    if (run > best) best = run;
  }
  return best;
}

export function weekCount(habit: Habit, monday: Date): number {
  const days = new Set(habit.days);
  let count = 0;
  for (let i = 0; i < 7; i++) if (days.has(todayKey(addDays(monday, i)))) count++;
  return count;
}

export function adherence(habit: Habit, windowDays = 30): { rate: number; window: number } {
  const days = new Set(habit.days);
  if (!days.size) return { rate: 0, window: 0 };

  const first = [...days].sort()[0];
  const since =
    Math.floor((new Date(todayKey()).getTime() - new Date(first).getTime()) / 86400000) + 1;
  const window = Math.min(windowDays, Math.max(1, since));

  let hits = 0;
  for (let i = 0; i < window; i++) if (days.has(todayKey(addDays(new Date(), -i)))) hits++;

  const expected = (window * habitTarget(habit)) / 7;
  return { rate: Math.min(100, Math.round((hits / expected) * 100)), window };
}

export function heatmap(habit: Habit, weeks = HEATMAP_WEEKS): HeatCell[][] {
  const start = addDays(startOfWeek(), -7 * (weeks - 1));
  const days = new Set(habit.days);
  const today = todayKey();
  return Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const key = todayKey(addDays(start, w * 7 + d));
      return { key, done: days.has(key), future: key > today };
    }),
  );
}

export function monthMarkers(cells: HeatCell[][]): (string | null)[] {
  let last = "";
  return cells.map(week => {
    const month = week[0].key.slice(0, 7);
    if (month === last) return null;
    last = month;
    return new Date(week[0].key).toLocaleDateString("en-US", { month: "short" });
  });
}
