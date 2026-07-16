import { useApp } from "../../hooks/useAppState";
import type { View } from "../../hooks/useView";

export function GlanceGoals({ onNavigate }: { onNavigate: (v: View) => void }) {
  const { state } = useApp();
  const active = state.goals
    .filter(g => g.progress < 100)
    .sort((a, b) => {
      if (a.deadline && b.deadline) return a.deadline < b.deadline ? -1 : 1;
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      return b.progress - a.progress;
    })
    .slice(0, 4);

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
      {active.map(g => (
        <div className="goal" key={g.id}>
          <div className="goal-head">
            <span className="goal-title">{g.title}</span>
            <span className="goal-meta">
              <span className="tag">{g.cat}</span>
            </span>
          </div>
          <div className="goal-bar-row">
            <div className="bar">
              <div style={{ width: `${g.progress}%` }} />
            </div>
            <span className="pct">{g.progress}%</span>
          </div>
        </div>
      ))}
    </section>
  );
}
