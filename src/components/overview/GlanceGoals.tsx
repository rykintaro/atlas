import { useApp } from "../../hooks/useAppState";
import type { View } from "../../hooks/useView";
import { goalPace, goalProgress, sortGoals } from "../../lib/goals";

export function GlanceGoals({ onNavigate }: { onNavigate: (v: View) => void }) {
  const { state } = useApp();
  const active = sortGoals(
    state.goals.filter(g => goalProgress(g) < 100),
    "deadline",
  ).slice(0, 4);

  return (
    <section className="card span2">
      <h2>
        Goals
        <button className="link-btn" onClick={() => onNavigate("goals")}>
          View all →
        </button>
      </h2>
      {active.length === 0 && (
        <p className="empty">No active goals — create your first one under Goals.</p>
      )}
      {active.map(g => {
        const progress = goalProgress(g);
        const pace = goalPace(g);
        return (
          <div className="goal" key={g.id}>
            <div className="goal-head">
              <span className="goal-title">{g.title}</span>
              <span className="goal-meta">
                <span className="tag">{g.cat}</span>
                {pace && <span className={`pace ${pace.status}`}>{pace.status.replace("-", " ")}</span>}
              </span>
            </div>
            <div className="goal-bar-row">
              <div className="bar">
                <div style={{ width: `${progress}%` }} />
                {pace && pace.expected > 2 && pace.expected < 98 && (
                  <span className="bar-pace" style={{ left: `${pace.expected}%` }} />
                )}
              </div>
              <span className="pct">{progress}%</span>
            </div>
          </div>
        );
      })}
    </section>
  );
}
