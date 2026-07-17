import { useState, type FormEvent } from "react";
import { useApp } from "../../hooks/useAppState";
import { useToast } from "../../hooks/useToast";
import { insertAt } from "../../lib/collections";
import { plural } from "../../lib/date";
import { goalPace, goalProgress, isMilestoneDriven } from "../../lib/goals";
import type { Goal } from "../../types";
import { MilestoneList } from "./MilestoneList";

const CATEGORIES = ["Personal", "Health", "Career", "Finance", "Learning", "Relationships"];

const PACE_LABEL = { ahead: "ahead", "on-track": "on track", behind: "behind" } as const;

interface Props {
  goal: Goal;
  expanded: boolean;
  onToggle: () => void;
}

export function GoalRow({ goal, expanded, onToggle }: Props) {
  const { state, update } = useApp();
  const { show } = useToast();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ title: "", cat: "", deadline: "" });

  const progress = goalProgress(goal);
  const pace = goalPace(goal);
  const milestoneDriven = isMilestoneDriven(goal);
  const complete = progress >= 100;

  const patch = (fields: Partial<Goal>) =>
    update(s => ({
      ...s,
      goals: s.goals.map(g => (g.id === goal.id ? { ...g, ...fields } : g)),
    }));

  const remove = () => {
    const index = state.goals.findIndex(g => g.id === goal.id);
    if (index < 0) return;
    const snapshot = state.goals[index];
    update(s => ({ ...s, goals: s.goals.filter(g => g.id !== goal.id) }));
    show("Goal deleted", () =>
      update(s => ({ ...s, goals: insertAt(s.goals, index, snapshot) })),
    );
  };

  const startEdit = () => {
    setDraft({ title: goal.title, cat: goal.cat, deadline: goal.deadline ?? "" });
    setEditing(true);
  };

  const saveEdit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = draft.title.trim();
    if (!trimmed) return;
    patch({ title: trimmed, cat: draft.cat, deadline: draft.deadline || null });
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="goal">
        <form className="row-form goal-edit" onSubmit={saveEdit}>
          <input
            type="text"
            autoFocus
            required
            maxLength={120}
            value={draft.title}
            onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
            onKeyDown={e => e.key === "Escape" && setEditing(false)}
          />
          <select value={draft.cat} onChange={e => setDraft(d => ({ ...d, cat: e.target.value }))}>
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
          <button className="btn-ghost" type="button" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className={`goal ${expanded ? "open" : ""}`}>
      <div className="goal-head">
        <button className={`chev ${expanded ? "open" : ""}`} onClick={onToggle} title="Details">
          ›
        </button>
        <span className={`goal-title ${complete ? "done" : ""}`} onDoubleClick={startEdit}>
          {goal.title}
        </span>
        <span className="goal-meta">
          <span className="tag">{goal.cat}</span>
          {pace && !complete && (
            <>
              <span className={`pace ${pace.status}`}>{PACE_LABEL[pace.status]}</span>
              <span className={pace.daysLeft < 0 ? "warn" : ""}>
                {pace.daysLeft < 0
                  ? `${plural(Math.abs(pace.daysLeft), "day", "days")} overdue`
                  : pace.daysLeft === 0
                    ? "due today"
                    : `${plural(pace.daysLeft, "day", "days")} left`}
              </span>
            </>
          )}
        </span>
        <button className="icon-btn" onClick={startEdit} title="Edit goal">
          ✎
        </button>
        <button className="icon-btn" onClick={remove} title="Delete goal">
          ✕
        </button>
      </div>

      <div className="goal-bar-row">
        <div className="bar">
          <div style={{ width: `${progress}%` }} />
          {pace && !complete && pace.expected > 2 && pace.expected < 98 && (
            <span
              className="bar-pace"
              style={{ left: `${pace.expected}%` }}
              title={`Expected by now: ${Math.round(pace.expected)}%`}
            />
          )}
        </div>
        <span className="pct">{progress}%</span>
        {milestoneDriven ? (
          <span className="from-milestones" title="Progress is derived from milestones">
            auto
          </span>
        ) : (
          <span className="step-btns">
            <button onClick={() => patch({ progress: Math.max(0, goal.progress - 10) })} title="−10%">
              −
            </button>
            <button
              onClick={() => patch({ progress: Math.min(100, goal.progress + 10) })}
              title="+10%"
            >
              +
            </button>
          </span>
        )}
      </div>

      {expanded && (
        <div className="goal-detail">
          {!milestoneDriven && (
            <div className="detail-block">
              <div className="detail-lbl">
                Progress <span className="detail-count">{goal.progress}%</span>
              </div>
              <input
                type="range"
                className="slider"
                min={0}
                max={100}
                step={5}
                value={goal.progress}
                onChange={e => patch({ progress: Number(e.target.value) })}
              />
            </div>
          )}
          <MilestoneList goal={goal} />
          <div className="detail-block">
            <div className="detail-lbl">Note</div>
            <textarea
              className="goal-note"
              placeholder="Why does this matter? What is the next step?"
              maxLength={600}
              defaultValue={goal.note ?? ""}
              onBlur={e => patch({ note: e.target.value.trim() || undefined })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
