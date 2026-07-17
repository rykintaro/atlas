import { useState, type FormEvent } from "react";
import { useApp } from "../../hooks/useAppState";
import { todayKey } from "../../lib/date";
import { goalProgress, sortGoals } from "../../lib/goals";
import { uid } from "../../lib/storage";
import type { Goal, GoalSort } from "../../types";
import { GoalRow } from "./GoalRow";

const CATEGORIES = ["Personal", "Health", "Career", "Finance", "Learning", "Relationships"];

const SORTS: { value: GoalSort; label: string }[] = [
  { value: "deadline", label: "Deadline" },
  { value: "progress", label: "Progress" },
  { value: "created", label: "Newest" },
];

export function GoalsCard() {
  const { state, update } = useApp();
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState(CATEGORIES[0]);
  const [deadline, setDeadline] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAchieved, setShowAchieved] = useState(false);

  const active = state.goals.filter(g => goalProgress(g) < 100);
  const achieved = state.goals.filter(g => goalProgress(g) >= 100);
  const usedCats = CATEGORIES.filter(c => active.some(g => g.cat === c));
  const filter = usedCats.includes(state.goalFilter) ? state.goalFilter : "all";
  const visible = sortGoals(
    filter === "all" ? active : active.filter(g => g.cat === filter),
    state.goalSort,
  );

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

  const toggleExpand = (id: string) => setExpandedId(current => (current === id ? null : id));

  return (
    <section className="card">
      <h2>
        Active Goals <span className="count">{active.length ? `${active.length} in progress` : ""}</span>
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

      {active.length > 0 && (
        <div className="toolbar">
          <div className="chips">
            <button
              className={`chip ${filter === "all" ? "active" : ""}`}
              onClick={() => update(s => ({ ...s, goalFilter: "all" }))}
            >
              All <span className="chip-count">{active.length}</span>
            </button>
            {usedCats.map(c => (
              <button
                key={c}
                className={`chip ${filter === c ? "active" : ""}`}
                onClick={() => update(s => ({ ...s, goalFilter: c }))}
              >
                {c} <span className="chip-count">{active.filter(g => g.cat === c).length}</span>
              </button>
            ))}
          </div>
          <label className="sort">
            Sort
            <select
              value={state.goalSort}
              onChange={e => update(s => ({ ...s, goalSort: e.target.value as GoalSort }))}
            >
              {SORTS.map(s => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {visible.length === 0 && (
        <p className="empty">
          {active.length === 0
            ? "No active goals — define your first one above."
            : "No goals in this category."}
        </p>
      )}

      {visible.map(g => (
        <GoalRow
          key={g.id}
          goal={g}
          expanded={expandedId === g.id}
          onToggle={() => toggleExpand(g.id)}
        />
      ))}

      {achieved.length > 0 && (
        <div className="achieved">
          <button className="link-btn" onClick={() => setShowAchieved(v => !v)}>
            {showAchieved ? "Hide" : "Show"} {achieved.length} achieved {showAchieved ? "▴" : "▾"}
          </button>
          {showAchieved &&
            achieved.map(g => (
              <GoalRow
                key={g.id}
                goal={g}
                expanded={expandedId === g.id}
                onToggle={() => toggleExpand(g.id)}
              />
            ))}
        </div>
      )}
    </section>
  );
}
