import { useState, type FormEvent } from "react";
import { useApp } from "../../hooks/useAppState";
import { uid } from "../../lib/storage";
import type { Goal, Milestone } from "../../types";

export function MilestoneList({ goal }: { goal: Goal }) {
  const { update } = useApp();
  const [title, setTitle] = useState("");
  const milestones = goal.milestones ?? [];

  const patch = (next: Milestone[]) =>
    update(s => ({
      ...s,
      goals: s.goals.map(g => (g.id === goal.id ? { ...g, milestones: next } : g)),
    }));

  const add = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    patch([...milestones, { id: uid(), title: trimmed, done: false }]);
    setTitle("");
  };

  const toggle = (id: string) =>
    patch(milestones.map(m => (m.id === id ? { ...m, done: !m.done } : m)));

  const remove = (id: string) => patch(milestones.filter(m => m.id !== id));

  return (
    <div className="milestones">
      <div className="detail-lbl">
        Milestones
        {milestones.length > 0 && (
          <span className="detail-count">
            {milestones.filter(m => m.done).length} / {milestones.length}
          </span>
        )}
      </div>
      {milestones.length === 0 && (
        <p className="detail-hint">
          Break this goal into steps — progress is then tracked automatically.
        </p>
      )}
      {milestones.map(m => (
        <div className={`milestone ${m.done ? "done" : ""}`} key={m.id}>
          <input type="checkbox" checked={m.done} onChange={() => toggle(m.id)} />
          <span className="m-title">{m.title}</span>
          <button className="icon-btn" onClick={() => remove(m.id)} title="Remove milestone">
            ✕
          </button>
        </div>
      ))}
      <form className="milestone-form" onSubmit={add}>
        <input
          type="text"
          placeholder="Add a milestone …"
          maxLength={120}
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <button className="btn-ghost" type="submit">
          Add
        </button>
      </form>
    </div>
  );
}
