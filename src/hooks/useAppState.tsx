import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AppState } from "../types";
import { loadState, saveState } from "../lib/storage";

type Update = (fn: (s: AppState) => AppState) => void;

interface AppContext {
  state: AppState;
  update: Update;
  replace: (next: AppState) => void;
}

const Ctx = createContext<AppContext | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
  }, [state.theme]);

  return (
    <Ctx.Provider value={{ state, update: setState, replace: setState }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp(): AppContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside AppStateProvider");
  return ctx;
}
