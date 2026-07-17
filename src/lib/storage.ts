import type { AppState } from "../types";
import { todayKey } from "./date";

export const STORE_KEY = "atlas-data-v1";

export function defaultState(): AppState {
  return {
    theme: "dark",
    goals: [],
    tasks: [],
    habits: [],
    notes: [],
    focus: { date: todayKey(), count: 0 },
    mood: {},
    water: {},
    finance: [],
    financeRange: "12",
    taskFilter: "all",
    goalFilter: "all",
    goalSort: "deadline",
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...(JSON.parse(raw) as Partial<AppState>) };
  } catch {
    return defaultState();
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
