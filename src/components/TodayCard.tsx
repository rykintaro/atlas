import { useApp } from "../hooks/useAppState";
import { addDays, plural, todayKey } from "../lib/date";

const MOODS = ["Rough", "Low", "Okay", "Good", "Great"];
const WATER_MAX = 8;

export function TodayCard() {
  const { state, update } = useApp();
  const today = todayKey();
  const mood = state.mood[today] ?? 0;
  const water = state.water[today] ?? 0;

  const setMood = (value: number) =>
    update(s => {
      const next = { ...s.mood };
      if (next[today] === value) delete next[today];
      else next[today] = value;
      return { ...s, mood: next };
    });

  const setWater = (n: number) =>
    update(s => {
      const next = { ...s.water };
      const value = n === (next[today] ?? 0) ? n - 1 : n;
      if (value <= 0) delete next[today];
      else next[today] = value;
      return { ...s, water: next };
    });

  const history = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(new Date(), i - 6);
    const key = todayKey(d);
    return {
      key,
      value: state.mood[key],
      narrow: d.toLocaleDateString("en-US", { weekday: "narrow" }),
      short: d.toLocaleDateString("en-US", { weekday: "short" }),
    };
  });

  const openTasks = state.tasks.filter(t => !t.done).length;
  const habitsDone = state.habits.filter(h => h.days.includes(today)).length;
  const focusToday = state.focus.date === today ? state.focus.count : 0;
  const dueSoon = state.goals.filter(
    g =>
      g.deadline &&
      g.progress < 100 &&
      (new Date(g.deadline).getTime() - new Date(today).getTime()) / 86400000 <= 7,
  ).length;

  const lines: string[] = [];
  if (openTasks === 0 && state.tasks.length > 0) lines.push("✓ All tasks done — well played.");
  else if (openTasks > 0) lines.push(`○ ${plural(openTasks, "task", "tasks")} still waiting for you.`);
  if (state.habits.length) {
    lines.push(
      habitsDone === state.habits.length
        ? "✓ Every habit checked off for today."
        : `○ ${plural(state.habits.length - habitsDone, "habit", "habits")} left for today.`,
    );
  }
  if (dueSoon) lines.push(`! ${plural(dueSoon, "goal", "goals")} with a deadline within a week.`);
  if (focusToday > 0) lines.push(`✓ ${focusToday * 25} minutes of focused work.`);
  if (water >= WATER_MAX) lines.push("✓ Fully hydrated.");
  if (!lines.length) lines.push("A blank day is a blank canvas — go paint.");

  return (
    <section className="card">
      <h2>Today</h2>
      <div className="checkin-lbl">Mood</div>
      <div className="mood-row">
        {MOODS.map((label, i) => (
          <button
            key={label}
            className={`mood-btn ${mood === i + 1 ? "on" : ""}`}
            onClick={() => setMood(i + 1)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mood-history" title="Last 7 days">
        {history.map(h => (
          <span
            key={h.key}
            className="mood-cell"
            title={h.value ? `${h.short}: ${MOODS[h.value - 1]}` : h.short}
            style={
              h.value
                ? {
                    background: "var(--accent)",
                    opacity: 0.25 + (h.value - 1) * 0.1875,
                    borderColor: "transparent",
                  }
                : undefined
            }
          >
            {h.value ? "" : h.narrow}
          </span>
        ))}
      </div>
      <div className="checkin-lbl">Water</div>
      <div className="water-row">
        {Array.from({ length: WATER_MAX }, (_, i) => (
          <button
            key={i}
            className={`water-dot ${i < water ? "on" : ""}`}
            title={`Glass ${i + 1}`}
            onClick={() => setWater(i + 1)}
          />
        ))}
        <span className="water-count">
          {water}/{WATER_MAX} glasses
        </span>
      </div>
      <div className="checkin-lbl">Review</div>
      <div className="summary">
        {lines.map(line => (
          <div key={line}>{line}</div>
        ))}
      </div>
    </section>
  );
}
