import { GoalsCard } from "../components/goals/GoalsCard";
import { useApp } from "../hooks/useAppState";
import { plural } from "../lib/date";
import { goalPace, goalProgress } from "../lib/goals";

export function GoalsView() {
  const { state } = useApp();
  const active = state.goals.filter(g => goalProgress(g) < 100);
  const behind = active.filter(g => goalPace(g)?.status === "behind").length;

  return (
    <>
      <div className="view-head">
        <div>
          <h1 className="view-title">Goals</h1>
          <p className="view-sub">
            {state.goals.length === 0
              ? "Define what you are working towards"
              : `${plural(active.length, "active goal", "active goals")}${
                  behind ? ` · ${behind} behind schedule` : ""
                }`}
          </p>
        </div>
      </div>
      <div className="stack">
        <GoalsCard />
      </div>
    </>
  );
}
