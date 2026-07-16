import { useState, type FormEvent } from "react";
import { useApp } from "../hooks/useAppState";
import { useToast } from "../hooks/useToast";
import { plural, todayKey } from "../lib/date";
import { insertAt } from "../lib/collections";
import { uid } from "../lib/storage";
import type { Goal } from "../types";

const CATEGORIES = ["Personal", "Health", "Career", "Finance", "Learning", "Relationships"];

interface GoalDraft {
  title: string;
  cat: string;
  deadline: string;
}

function DeadlineMeta({ goal }: { goal: Goal }) {
  if (!goal.deadline) return null;
  const days = Math.ceil(
    (new Date(goal.deadline).getTime() - new Date(todayKey()).getTime()) / 86400000,
  );
  const text =
    days < 0
      ? `${plural(Math.abs(days), "day", "days")} overdue`
      : days === 0
        ? "due today"
        : `${plural(days, "day", "days")} left`;
  return <span className={days < 0 ? "warn" : ""}> · {text}</span>;
}

export function GoalsCard() {
  const { state, update } = useApp();
  const { show } = useToast();
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState(CATEGORIES[0]);
  const [deadline, setDeadline] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<GoalDraft>({ title: "", cat: CATEGORIES[0], deadline: "" });

  const goals = [...state.goals].sort(
    (a, b) => Number(a.progress >= 100) - Number(b.progress >= 100),
  );
  const achieved = goals.filter(g => g.progress >= 100).length;

  const addGoal = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    const goal: Goal = {
      id: uid(),
      title: trimmed,
      cat,
      deadline: deadline || null,
      progress: 0,
      created: todayKey(),
    };
    update(s => ({ ...s, goals: [...s.goals, goal] }));
    setTitle("");
    setDeadline("");
  };

  const step = (id: string, delta: number) =>
    update(s => ({
      ...s,
      goals: s.goals.map(g =>
        g.id === id ? { ...g, progress: Math.min(100, Math.max(0, g.progress + delta)) } : g,
      ),
    }));

  const remove = (id: string) => {
    const index = state.goals.findIndex(g => g.id === id);
    const goal = state.goals[index];
    if (!goal) return;
    update(s => ({ ...s, goals: s.goals.filter(g => g.id !== id) }));
    show("Goal deleted", () =>
      update(s => ({ ...s, goals: insertAt(s.goals, index, goal) })),
    );
  };

  const startEdit = (goal: Goal) => {
    setEditingId(goal.id);
    setDraft({ title: goal.title, cat: goal.cat, deadline: goal.deadline ?? "" });
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = draft.title.trim();
    if (!trimmed || !editingId) return;
    update(s => ({
      ...s,
      goals: s.goals.map(g =>
        g.id === editingId
          ? { ...g, title: trimmed, cat: draft.cat, deadline: draft.deadline || null }
          : g,
      ),
    }));
    cancelEdit();
  };

  return (
    <section className="card span2">
      <h2>
        Personal Goals{" "}
        <span className="count">{goals.length ? `${achieved} / ${goals.length} achieved` : ""}</span>
      </h2>
      <form className="row-form" onSubmit={addGoal}>
        <input
          type="text"
          placeholder="New goal …"
          required
          maxLength={120}
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <select value={cat} onChange={e => setCat(e.target.value)}>
          {CATEGORIES.map(c => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input
          type="date"
          title="Target date (optional)"
          value={deadline}
          onChange={e => setDeadline(e.target.value)}
        />
        <button className="btn" type="submit">
          Add
        </button>
      </form>
      {goals.length === 0 && <p className="empty">No goals yet — define your first one above.</p>}
      {goals.map(g => (
        <div className="goal" key={g.id}>
          {editingId === g.id ? (
            <form className="row-form goal-edit" onSubmit={saveEdit}>
              <input
                type="text"
                autoFocus
                required
                maxLength={120}
                value={draft.title}
                onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
                onKeyDown={e => e.key === "Escape" && cancelEdit()}
              />
              <select
                value={draft.cat}
                onChange={e => setDraft(d => ({ ...d, cat: e.target.value }))}
              >
                {CATEGORIES.map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <input
                type="date"
                value={draft.deadline}
                onChange={e => setDraft(d => ({ ...d, deadline: e.target.value }))}
              />
              <button className="btn" type="submit">
                Save
              </button>
              <button className="btn-ghost" type="button" onClick={cancelEdit}>
                Cancel
              </button>
            </form>
          ) : (
            <>
              <div className="goal-head">
                <span
                  className={`goal-title ${g.progress >= 100 ? "done" : ""}`}
                  onDoubleClick={() => startEdit(g)}
                >
                  {g.title}
                </span>
                <span className="goal-meta">
                  <span className="tag">{g.cat}</span>
                  <DeadlineMeta goal={g} />
                </span>
                <button className="icon-btn" onClick={() => startEdit(g)} title="Edit goal">
                  ✎
                </button>
                <button className="icon-btn" onClick={() => remove(g.id)} title="Delete goal">
                  ✕
                </button>
              </div>
              <div className="goal-bar-row">
                <div className="bar">
                  <div style={{ width: `${g.progress}%` }} />
                </div>
                <span className="pct">{g.progress}%</span>
                <span className="step-btns">
                  <button onClick={() => step(g.id, -10)} title="−10%">
                    −
                  </button>
                  <button onClick={() => step(g.id, 10)} title="+10%">
                    +
                  </button>
                </span>
              </div>
            </>
          )}
        </div>
      ))}
    </section>
  );
}
