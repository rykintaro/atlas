import { useApp } from "../hooks/useAppState";
import { useNow } from "../hooks/useNow";

export function Header() {
  const { state, update } = useApp();
  const now = useNow(15000);

  const toggleTheme = () =>
    update(s => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" }));

  return (
    <header>
      <div className="brand">Atlas</div>
      <div className="header-right">
        <span className="clock">
          {now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
        </span>
        <button className="theme-btn" onClick={toggleTheme} title="Toggle theme">
          {state.theme === "dark" ? "◐" : "◑"}
        </button>
      </div>
    </header>
  );
}
