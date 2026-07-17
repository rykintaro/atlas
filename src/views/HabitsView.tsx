import { HabitsCard } from "../components/habits/HabitsCard";
import { useApp } from "../hooks/useAppState";
import { plural, todayKey } from "../lib/date";

export function HabitsView() {
  const { state } = useApp();
  const today = todayKey();
  const doneToday = state.habits.filter(h => h.days.includes(today)).length;

  return (
    <>
      <div className="view-head">
        <div>
          <h1 className="view-title">Habits</h1>
          <p className="view-sub">
            {state.habits.length === 0
              ? "Small things, repeated"
              : `${doneToday} of ${plural(state.habits.length, "habit", "habits")} done today`}
          </p>
        </div>
      </div>
      <div className="stack">
        <HabitsCard />
      </div>
    </>
  );
}
