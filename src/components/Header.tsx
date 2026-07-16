import { useRef } from "react";
import { useApp } from "../hooks/useAppState";
import { useNow } from "../hooks/useNow";
import { defaultState } from "../lib/storage";
import { todayKey } from "../lib/date";
import type { AppState } from "../types";

export function Header() {
  const { state, update, replace } = useApp();
  const now = useNow(15000);
  const fileRef = useRef<HTMLInputElement>(null);

  const toggleTheme = () =>
    update(s => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" }));

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `atlas-backup-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as Partial<AppState>;
        if (typeof data !== "object" || data === null || !Array.isArray(data.goals)) {
          alert("This file does not look like an Atlas backup.");
          return;
        }
        if (!confirm("Importing replaces all current data. Continue?")) return;
        replace({ ...defaultState(), ...data });
      } catch {
        alert("Could not read this file as JSON.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <header>
      <div className="brand">
        Atlas <span>/ Dashboard</span>
      </div>
      <div className="header-right">
        <span className="clock">
          {now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
        </span>
        <button className="btn-ghost" onClick={exportData} title="Download your data as a JSON backup">
          Export
        </button>
        <button
          className="btn-ghost"
          onClick={() => fileRef.current?.click()}
          title="Restore data from a JSON backup"
        >
          Import
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          hidden
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) importData(file);
            e.target.value = "";
          }}
        />
        <button className="theme-btn" onClick={toggleTheme} title="Toggle theme">
          {state.theme === "dark" ? "◐" : "◑"}
        </button>
      </div>
    </header>
  );
}
