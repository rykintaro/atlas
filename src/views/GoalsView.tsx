import { GoalsCard } from "../components/GoalsCard";
import { HabitsCard } from "../components/HabitsCard";
import { useApp } from "../hooks/useAppState";
import { plural } from "../lib/date";

export function GoalsView() {
  const { state } = useApp();
  const active = state.goals.filter(g => g.progress < 100).length;

  return (
    <>
      <div className="view-head">
        <div>
          <h1 className="view-title">Goals & Habits</h1>
          <p className="view-sub">
            {plural(active, "active goal", "active goals")} ·{" "}
            {plural(state.habits.length, "habit", "habits")}
          </p>
        </div>
      </div>
      <div className="stack">
        <GoalsCard />
        <HabitsCard />
      </div>
    </>
  );
}
