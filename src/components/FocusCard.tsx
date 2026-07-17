import { useApp } from "../hooks/useAppState";
import { TIMER_MODES, useTimer } from "../hooks/useTimer";
import { plural, todayKey } from "../lib/date";
import type { TimerMode } from "../types";

const MODE_TABS: { mode: TimerMode; label: string }[] = [
  { mode: "focus", label: "Focus" },
  { mode: "short", label: "Break" },
  { mode: "long", label: "Long" },
];

export function FocusCard() {
  const { state } = useApp();
  const { mode, remaining, running, toggle, select } = useTimer();

  const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
  const seconds = String(remaining % 60).padStart(2, "0");
  const sessionsToday = state.focus.date === todayKey() ? state.focus.count : 0;
  const total = TIMER_MODES[mode].minutes * 60;
  const pct = ((total - remaining) / total) * 100;

  return (
    <section className="card">
      <h2>Focus</h2>
      <div className="timer">
        <div
          className="timer-ring"
          style={{ background: `conic-gradient(var(--text) ${pct}%, var(--surface-2) 0)` }}
        >
          <div className="timer-ring-inner">
            <div>
              <div className={`time ${running ? "running" : ""}`}>
                {minutes}:{seconds}
              </div>
              <div className="mode-lbl">{TIMER_MODES[mode].label}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="timer-modes">
        {MODE_TABS.map(m => (
          <button
            key={m.mode}
            className={`btn-ghost ${mode === m.mode ? "active" : ""}`}
            onClick={() => select(m.mode)}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="timer-actions">
        <button className="btn" onClick={toggle}>
          {running ? "Pause" : "Start"}
        </button>
        <button className="btn-ghost" onClick={() => select(mode)}>
          Reset
        </button>
      </div>
      <div className="sessions">
        {sessionsToday === 0
          ? "No focus sessions yet today."
          : `Completed today: ${plural(sessionsToday, "session", "sessions")}`}
      </div>
    </section>
  );
}
