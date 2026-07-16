import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { todayKey } from "../lib/date";
import type { TimerMode } from "../types";
import { useApp } from "./useAppState";

export const TIMER_MODES: Record<TimerMode, { label: string; minutes: number }> = {
  focus: { label: "Focus", minutes: 25 },
  short: { label: "Break", minutes: 5 },
  long: { label: "Long break", minutes: 15 },
};

interface TimerContext {
  mode: TimerMode;
  remaining: number;
  running: boolean;
  toggle: () => void;
  select: (mode: TimerMode) => void;
}

const Ctx = createContext<TimerContext | null>(null);

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

export function TimerProvider({ children }: { children: ReactNode }) {
  const { update } = useApp();
  const [mode, setMode] = useState<TimerMode>("focus");
  const [remaining, setRemaining] = useState(TIMER_MODES.focus.minutes * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setRemaining(r => r - 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (remaining > 0) return;
    setRunning(false);
    setRemaining(TIMER_MODES[mode].minutes * 60);
    chime();
    if (mode === "focus") {
      update(s => {
        const today = todayKey();
        const count = s.focus.date === today ? s.focus.count + 1 : 1;
        return { ...s, focus: { date: today, count } };
      });
    }
  }, [remaining, mode, update]);

  useEffect(() => {
    if (!running) {
      document.title = "Atlas — Personal Dashboard";
      return;
    }
    const m = String(Math.floor(remaining / 60)).padStart(2, "0");
    const s = String(remaining % 60).padStart(2, "0");
    document.title = `${m}:${s} · Atlas`;
  }, [running, remaining]);

  const select = (next: TimerMode) => {
    setRunning(false);
    setMode(next);
    setRemaining(TIMER_MODES[next].minutes * 60);
  };

  const toggle = () => setRunning(r => !r);

  return (
    <Ctx.Provider value={{ mode, remaining, running, toggle, select }}>{children}</Ctx.Provider>
  );
}

export function useTimer(): TimerContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTimer must be used inside TimerProvider");
  return ctx;
}
