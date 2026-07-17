import { useState, type FormEvent } from "react";
import { useApp } from "../../hooks/useAppState";
import { useToast } from "../../hooks/useToast";
import { insertAt } from "../../lib/collections";
import { addDays, DAY_NAMES, todayKey } from "../../lib/date";
import {
  adherence,
  currentStreak,
  habitTarget,
  longestStreak,
  weekCount,
} from "../../lib/habits";
import type { Habit } from "../../types";
import { HabitHeatmap } from "./HabitHeatmap";

interface Props {
  habit: Habit;
  monday: Date;
  expanded: boolean;
  onToggle: () => void;
}

export function HabitRow({ habit, monday, expanded, onToggle }: Props) {
  const { state, update } = useApp();
  const { show } = useToast();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const today = todayKey();
  const target = habitTarget(habit);
  const done = weekCount(habit, monday);
  const streak = currentStreak(habit);
  const best = longestStreak(habit);
  const { rate, window } = adherence(habit);
  const hitTarget = done >= target;

  const patch = (fields: Partial<Habit>) =>
    update(s => ({
      ...s,
      habits: s.habits.map(h => (h.id === habit.id ? { ...h, ...fields } : h)),
    }));

  const toggleDay = (key: string) =>
    patch({
      days: habit.days.includes(key)
        ? habit.days.filter(d => d !== key)
        : [...habit.days, key],
    });

  const remove = () => {
    const index = state.habits.findIndex(h => h.id === habit.id);
    if (index < 0) return;
    const snapshot = state.habits[index];
    update(s => ({ ...s, habits: s.habits.filter(h => h.id !== habit.id) }));
    show(`Habit deleted (${snapshot.days.length} check-ins)`, () =>
      update(s => ({ ...s, habits: insertAt(s.habits, index, snapshot) })),
    );
  };

  const saveName = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    patch({ name: trimmed });
    setEditing(false);
  };

  return (
    <div className={`habit ${expanded ? "open" : ""}`}>
      <div className="habit-head">
        <button className={`chev ${expanded ? "open" : ""}`} onClick={onToggle} title="Details">
          ›
        </button>

        {editing ? (
          <form className="inline-edit" onSubmit={saveName}>
            <input
              autoFocus
              maxLength={80}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => e.key === "Escape" && setEditing(false)}
            />
            <button className="btn-ghost" type="submit">
              Save
            </button>
          </form>
        ) : (
          <span
            className="habit-name"
            onDoubleClick={() => {
              setDraft(habit.name);
              setEditing(true);
            }}
          >
            {habit.name}
          </span>
        )}

        <span className={`week-target ${hitTarget ? "hit" : ""}`} title={`Weekly target: ${target}×`}>
          {done}/{target}
        </span>

        <span className="week">
          {DAY_NAMES.map((label, i) => {
            const key = todayKey(addDays(monday, i));
            const future = key > today;
            const classes = [
              "day-dot",
              habit.days.includes(key) ? "on" : "",
              key === today ? "today" : "",
              future ? "future" : "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <button
                key={key}
                className={classes}
                disabled={future}
                title={label}
                onClick={() => toggleDay(key)}
              >
                {label}
              </button>
            );
          })}
        </span>

        <button className="icon-btn" onClick={remove} title="Delete habit">
          ✕
        </button>
      </div>

      {expanded && (
        <div className="habit-detail">
          <div className="habit-stats">
            <div className="hstat">
              <span className="hstat-num">{streak}</span>
              <span className="hstat-lbl">Current streak</span>
            </div>
            <div className="hstat">
              <span className="hstat-num">{best}</span>
              <span className="hstat-lbl">Longest streak</span>
            </div>
            <div className="hstat">
              <span className="hstat-num">{rate}%</span>
              <span className="hstat-lbl">
                {window ? `Adherence · ${window}d` : "Adherence"}
              </span>
            </div>
            <div className="hstat">
              <span className="hstat-num">{habit.days.length}</span>
              <span className="hstat-lbl">Total check-ins</span>
            </div>
          </div>

          <HabitHeatmap habit={habit} onToggleDay={toggleDay} />

          <label className="target-select">
            Weekly target
            <select value={target} onChange={e => patch({ target: Number(e.target.value) })}>
              {[1, 2, 3, 4, 5, 6, 7].map(n => (
                <option key={n} value={n}>
                  {n}× per week{n === 7 ? " (daily)" : ""}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  );
}
