import { TasksCard } from "../components/TasksCard";
import { useApp } from "../hooks/useAppState";
import { plural } from "../lib/date";

export function TasksView() {
  const { state } = useApp();
  const open = state.tasks.filter(t => !t.done).length;

  return (
    <>
      <div className="view-head">
        <div>
          <h1 className="view-title">Tasks</h1>
          <p className="view-sub">
            {state.tasks.length
              ? `${plural(open, "task", "tasks")} open · ${state.tasks.length - open} done`
              : "Nothing here yet"}
          </p>
        </div>
      </div>
      <div className="stack">
        <TasksCard />
      </div>
    </>
  );
}
