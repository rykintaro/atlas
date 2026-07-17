import { useState, type FormEvent } from "react";
import { useApp } from "../../hooks/useAppState";
import { addDays, startOfWeek } from "../../lib/date";
import { uid } from "../../lib/storage";
import { HabitRow } from "./HabitRow";

export function HabitsCard() {
  const { state, update } = useApp();
  const [name, setName] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const monday = addDays(startOfWeek(), weekOffset * 7);
  const weekEnd = addDays(monday, 6);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const addHabit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    update(s => ({ ...s, habits: [...s.habits, { id: uid(), name: trimmed, days: [] }] }));
    setName("");
  };

  return (
    <section className="card">
      <h2>
        Habits
        <span className="week-nav">
          <button className="icon-btn" onClick={() => setWeekOffset(o => o - 1)} title="Previous week">
            ‹
          </button>
          <span className="week-label">
            {weekOffset === 0 ? "This week" : `${fmt(monday)} – ${fmt(weekEnd)}`}
          </span>
          <button
            className="icon-btn"
            onClick={() => setWeekOffset(o => Math.min(0, o + 1))}
            disabled={weekOffset >= 0}
            title="Next week"
          >
            ›
          </button>
          {weekOffset !== 0 && (
            <button className="link-btn" onClick={() => setWeekOffset(0)}>
              Today
            </button>
          )}
        </span>
      </h2>

      <form className="row-form" onSubmit={addHabit}>
        <input
          type="text"
          placeholder="New habit …"
          required
          maxLength={80}
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <button className="btn" type="submit">
          Add
        </button>
      </form>

      {state.habits.length === 0 && (
        <p className="empty">No habits yet — try “Reading”, “Workout”, “Early rise”.</p>
      )}

      {state.habits.map(h => (
        <HabitRow
          key={h.id}
          habit={h}
          monday={monday}
          expanded={expandedId === h.id}
          onToggle={() => setExpandedId(current => (current === h.id ? null : h.id))}
        />
      ))}
    </section>
  );
}
