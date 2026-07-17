import { useApp } from "../hooks/useAppState";
import { useCountUp } from "../hooks/useCountUp";
import { todayKey } from "../lib/date";
import { goalProgress } from "../lib/goals";

export function OverviewStats() {
  const { state } = useApp();
  const today = todayKey();
  const activeGoals = useCountUp(state.goals.filter(g => goalProgress(g) < 100).length);
  const openTasks = useCountUp(state.tasks.filter(t => !t.done).length);
  const habitsDone = useCountUp(state.habits.filter(h => h.days.includes(today)).length);
  const focusToday = useCountUp(state.focus.date === today ? state.focus.count : 0);

  return (
    <section className="stats">
      <div className="stat">
        <div className="num">{Math.round(activeGoals)}</div>
        <div className="lbl">Active goals</div>
      </div>
      <div className="stat">
        <div className="num">{Math.round(openTasks)}</div>
        <div className="lbl">Open tasks</div>
      </div>
      <div className="stat">
        <div className="num">
          {Math.round(habitsDone)}/{state.habits.length}
        </div>
        <div className="lbl">Habits today</div>
      </div>
      <div className="stat">
        <div className="num">{Math.round(focusToday)}</div>
        <div className="lbl">Focus sessions today</div>
      </div>
    </section>
  );
}
