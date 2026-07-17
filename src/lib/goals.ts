import type { Goal, GoalSort } from "../types";
import { todayKey } from "./date";

export type PaceStatus = "ahead" | "on-track" | "behind";

export interface Pace {
  status: PaceStatus;
  expected: number;
  daysLeft: number;
}

export function goalProgress(goal: Goal): number {
  const milestones = goal.milestones;
  if (!milestones?.length) return goal.progress;
  const done = milestones.filter(m => m.done).length;
  return Math.round((done / milestones.length) * 100);
}

export function isMilestoneDriven(goal: Goal): boolean {
  return Boolean(goal.milestones?.length);
}

export function goalPace(goal: Goal): Pace | null {
  if (!goal.deadline) return null;
  const start = new Date(goal.created).getTime();
  const end = new Date(goal.deadline).getTime();
  const now = new Date(todayKey()).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;

  const expected = Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100));
  const progress = goalProgress(goal);
  const daysLeft = Math.ceil((end - now) / 86400000);
  const delta = progress - expected;
  const status: PaceStatus =
    progress >= 100 || delta >= 5 ? "ahead" : delta >= -10 ? "on-track" : "behind";

  return { status, expected, daysLeft };
}

export function sortGoals(goals: Goal[], sort: GoalSort): Goal[] {
  const copy = [...goals];
  if (sort === "progress") return copy.sort((a, b) => goalProgress(b) - goalProgress(a));
  if (sort === "created") return copy.sort((a, b) => (a.created < b.created ? 1 : -1));
  return copy.sort((a, b) => {
    if (a.deadline && b.deadline) return a.deadline < b.deadline ? -1 : 1;
    if (a.deadline) return -1;
    if (b.deadline) return 1;
    return 0;
  });
}
