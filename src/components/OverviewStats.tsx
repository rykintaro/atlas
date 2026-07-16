import { useApp } from "../hooks/useAppState";
import { todayKey } from "../lib/date";

export function OverviewStats() {
  const { state } = useApp();
  const today = todayKey();
  const activeGoals = state.goals.filter(g => g.progress < 100).length;
  const openTasks = state.tasks.filter(t => !t.done).length;
  const habitsDone = state.habits.filter(h => h.days.includes(today)).length;
  const focusToday = state.focus.date === today ? state.focus.count : 0;

  return (
    <section className="stats">
      <div className="stat">
        <div className="num">{activeGoals}</div>
        <div className="lbl">Active goals</div>
      </div>
      <div className="stat">
        <div className="num">{openTasks}</div>
        <div className="lbl">Open tasks</div>
      </div>
      <div className="stat">
        <div className="num">
          {habitsDone}/{state.habits.length}
        </div>
        <div className="lbl">Habits today</div>
      </div>
      <div className="stat">
        <div className="num">{focusToday}</div>
        <div className="lbl">Focus sessions today</div>
      </div>
    </section>
  );
}
