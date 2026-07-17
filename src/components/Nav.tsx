import { useApp } from "../hooks/useAppState";
import type { View } from "../hooks/useView";
import { todayKey } from "../lib/date";
import { goalProgress } from "../lib/goals";

const TABS: { view: View; label: string }[] = [
  { view: "overview", label: "Overview" },
  { view: "goals", label: "Goals" },
  { view: "habits", label: "Habits" },
  { view: "tasks", label: "Tasks" },
  { view: "notes", label: "Notes" },
  { view: "finances", label: "Finances" },
];

export function Nav({ view, onNavigate }: { view: View; onNavigate: (v: View) => void }) {
  const { state } = useApp();
  const today = todayKey();
  const counts: Partial<Record<View, number>> = {
    goals: state.goals.filter(g => goalProgress(g) < 100).length,
    habits: state.habits.filter(h => !h.days.includes(today)).length,
    tasks: state.tasks.filter(t => !t.done).length,
    notes: state.notes.length,
  };

  return (
    <nav className="tabs">
      {TABS.map(tab => (
        <button
          key={tab.view}
          className={`tab ${view === tab.view ? "active" : ""}`}
          onClick={() => onNavigate(tab.view)}
        >
          {tab.label}
          {counts[tab.view] ? <span className="tab-count">{counts[tab.view]}</span> : null}
        </button>
      ))}
    </nav>
  );
}
