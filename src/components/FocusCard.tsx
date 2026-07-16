import { useEffect, useState } from "react";
import { useApp } from "../hooks/useAppState";
import { plural, todayKey } from "../lib/date";
import type { TimerMode } from "../types";

const MODES: Record<TimerMode, { label: string; minutes: number }> = {
  focus: { label: "Focus", minutes: 25 },
  short: { label: "Break", minutes: 5 },
  long: { label: "Long break", minutes: 15 },
};

function chime() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 660;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch {
    return;
  }
}

export function FocusCard() {
  const { state, update } = useApp();
  const [mode, setMode] = useState<TimerMode>("focus");
  const [remaining, setRemaining] = useState(MODES.focus.minutes * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setRemaining(r => r - 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (remaining > 0) return;
    setRunning(false);
    setRemaining(MODES[mode].minutes * 60);
    chime();
    if (mode === "focus") {
      update(s => {
        const today = todayKey();
        const count = s.focus.date === today ? s.focus.count + 1 : 1;
        return { ...s, focus: { date: today, count } };
      });
    }
  }, [remaining, mode, update]);

  const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
  const seconds = String(remaining % 60).padStart(2, "0");

  useEffect(() => {
    document.title = running ? `${minutes}:${seconds} · Atlas` : "Atlas — Personal Dashboard";
  }, [running, minutes, seconds]);

  const selectMode = (next: TimerMode) => {
    setRunning(false);
    setMode(next);
    setRemaining(MODES[next].minutes * 60);
  };

  const sessionsToday = state.focus.date === todayKey() ? state.focus.count : 0;

  return (
    <section className="card">
      <h2>Focus</h2>
      <div className="timer">
        <div className={`time ${running ? "running" : ""}`}>
          {minutes}:{seconds}
        </div>
        <div className="mode-lbl">{MODES[mode].label}</div>
      </div>
      <div className="timer-modes">
        {(Object.keys(MODES) as TimerMode[]).map(m => (
          <button
            key={m}
            className={`btn-ghost ${mode === m ? "active" : ""}`}
            onClick={() => selectMode(m)}
          >
            {m === "focus" ? "Focus" : m === "short" ? "Break" : "Long"}
          </button>
        ))}
      </div>
      <div className="timer-actions">
        <button className="btn" onClick={() => setRunning(r => !r)}>
          {running ? "Pause" : "Start"}
        </button>
        <button className="btn-ghost" onClick={() => selectMode(mode)}>
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
