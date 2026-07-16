import { useApp } from "../../hooks/useAppState";
import type { View } from "../../hooks/useView";
import type { Priority } from "../../types";

const PRIO_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export function GlanceTasks({ onNavigate }: { onNavigate: (v: View) => void }) {
  const { state, update } = useApp();
  const open = state.tasks
    .filter(t => !t.done)
    .sort((a, b) => PRIO_ORDER[a.prio] - PRIO_ORDER[b.prio])
    .slice(0, 5);

  const toggle = (id: string) =>
    update(s => ({
      ...s,
      tasks: s.tasks.map(t => (t.id === id ? { ...t, done: !t.done } : t)),
    }));

  return (
    <section className="card">
      <h2>
        Tasks
        <button className="link-btn" onClick={() => onNavigate("tasks")}>
          View all →
        </button>
      </h2>
      {open.length === 0 && <p className="empty">All clear — nothing open.</p>}
      {open.map(t => (
        <div className="task" key={t.id}>
          <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
          <span className={`prio ${t.prio}`} title={`Priority: ${t.prio}`} />
          <span className="t-title">{t.title}</span>
        </div>
      ))}
    </section>
  );
}
