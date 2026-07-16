export type Theme = "dark" | "light";
export type Priority = "high" | "medium" | "low";
export type TaskFilter = "all" | "open" | "done";
export type FinanceRange = "6" | "12" | "all";
export type TimerMode = "focus" | "short" | "long";

export interface Goal {
  id: string;
  title: string;
  cat: string;
  deadline: string | null;
  progress: number;
  created: string;
}

export interface Task {
  id: string;
  title: string;
  prio: Priority;
  done: boolean;
  created: string;
}

export interface Habit {
  id: string;
  name: string;
  days: string[];
}

export interface Note {
  id: string;
  body: string;
  created: string;
}

export interface FinanceEntry {
  id: string;
  month: string;
  income: number;
  expenses: number;
  net: number | null;
}

export interface FocusLog {
  date: string;
  count: number;
}

export interface AppState {
  theme: Theme;
  goals: Goal[];
  tasks: Task[];
  habits: Habit[];
  notes: Note[];
  focus: FocusLog;
  mood: Record<string, number>;
  water: Record<string, number>;
  finance: FinanceEntry[];
  financeRange: FinanceRange;
  taskFilter: TaskFilter;
}
