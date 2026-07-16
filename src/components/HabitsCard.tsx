import { useState, type FormEvent } from "react";
import { useApp } from "../hooks/useAppState";
import { useToast } from "../hooks/useToast";
import { addDays, DAY_NAMES, plural, startOfWeek, todayKey } from "../lib/date";
import { insertAt } from "../lib/collections";
import { uid } from "../lib/storage";
import type { Habit } from "../types";

function streakOf(habit: Habit): number {
  const days = new Set(habit.days);
  let streak = 0;
  let d = new Date();
  if (!days.has(todayKey(d))) d = addDays(d, -1);
  while (days.has(todayKey(d))) {
    streak++;
    d = addDays(d, -1);
  }
  return streak;
}

export function HabitsCard() {
  const { state, update } = useApp();
  const { show } = useToast();
  const [name, setName] = useState("");

  const monday = startOfWeek();
  const today = todayKey();
  const weekEnd = addDays(monday, 6);
  const weekLabel = `${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

  const addHabit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    update(s => ({ ...s, habits: [...s.habits, { id: uid(), name: trimmed, days: [] }] }));
    setName("");
  };

  const toggleDay = (id: string, key: string) =>
    update(s => ({
      ...s,
      habits: s.habits.map(h =>
        h.id === id
          ? {
              ...h,
              days: h.days.includes(key) ? h.days.filter(d => d !== key) : [...h.days, key],
            }
          : h,
      ),
    }));

  const remove = (id: string) => {
    const index = state.habits.findIndex(h => h.id === id);
    const habit = state.habits[index];
    if (!habit) return;
    update(s => ({ ...s, habits: s.habits.filter(h => h.id !== id) }));
    show(`Habit deleted (${habit.days.length} check-ins)`, () =>
      update(s => ({ ...s, habits: insertAt(s.habits, index, habit) })),
    );
  };

  return (
    <section className="card span2">
      <h2>
        Habits <span className="count">{weekLabel}</span>
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
      {state.habits.map(h => {
        const streak = streakOf(h);
        return (
          <div className="habit" key={h.id}>
            <span className="habit-name">{h.name}</span>
            <span className="habit-streak">
              {streak > 0 ? `${plural(streak, "day", "days")} streak` : "—"}
            </span>
            <span className="week">
              {DAY_NAMES.map((label, i) => {
                const key = todayKey(addDays(monday, i));
                const isFuture = key > today;
                const classes = [
                  "day-dot",
                  h.days.includes(key) ? "on" : "",
                  key === today ? "today" : "",
                  isFuture ? "future" : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <button
                    key={key}
                    className={classes}
                    disabled={isFuture}
                    title={label}
                    onClick={() => toggleDay(h.id, key)}
                  >
                    {label}
                  </button>
                );
              })}
            </span>
            <button className="icon-btn" onClick={() => remove(h.id)} title="Delete">
              ✕
            </button>
          </div>
        );
      })}
    </section>
  );
}
