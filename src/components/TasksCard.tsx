import { useState, type FormEvent } from "react";
import { useApp } from "../hooks/useAppState";
import { useToast } from "../hooks/useToast";
import { plural, todayKey } from "../lib/date";
import { insertAt } from "../lib/collections";
import { uid } from "../lib/storage";
import type { Priority, Task, TaskFilter } from "../types";

const PRIO_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
const FILTERS: TaskFilter[] = ["all", "open", "done"];

export function TasksCard() {
  const { state, update } = useApp();
  const { show } = useToast();
  const [title, setTitle] = useState("");
  const [prio, setPrio] = useState<Priority>("medium");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const sorted = [...state.tasks].sort(
    (a, b) => Number(a.done) - Number(b.done) || PRIO_ORDER[a.prio] - PRIO_ORDER[b.prio],
  );
  const visible = sorted.filter(t =>
    state.taskFilter === "open" ? !t.done : state.taskFilter === "done" ? t.done : true,
  );
  const open = state.tasks.filter(t => !t.done).length;
  const doneCount = state.tasks.length - open;

  const addTask = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    const task: Task = { id: uid(), title: trimmed, prio, done: false, created: todayKey() };
    update(s => ({ ...s, tasks: [task, ...s.tasks] }));
    setTitle("");
  };

  const toggle = (id: string) =>
    update(s => ({
      ...s,
      tasks: s.tasks.map(t => (t.id === id ? { ...t, done: !t.done } : t)),
    }));

  const remove = (id: string) => {
    const index = state.tasks.findIndex(t => t.id === id);
    const task = state.tasks[index];
    if (!task) return;
    update(s => ({ ...s, tasks: s.tasks.filter(t => t.id !== id) }));
    show("Task deleted", () =>
      update(s => ({ ...s, tasks: insertAt(s.tasks, index, task) })),
    );
  };

  const clearCompleted = () => {
    const done = state.tasks.filter(t => t.done);
    if (!done.length) return;
    update(s => ({ ...s, tasks: s.tasks.filter(t => !t.done) }));
    show(`${plural(done.length, "completed task", "completed tasks")} cleared`, () =>
      update(s => ({ ...s, tasks: [...s.tasks, ...done] })),
    );
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setDraft(task.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft("");
  };

  const saveEdit = (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || !editingId) return;
    update(s => ({
      ...s,
      tasks: s.tasks.map(t => (t.id === editingId ? { ...t, title: trimmed } : t)),
    }));
    cancelEdit();
  };

  const setFilter = (filter: TaskFilter) => update(s => ({ ...s, taskFilter: filter }));

  return (
    <section className="card">
      <h2>
        Tasks <span className="count">{state.tasks.length ? `${open} open` : ""}</span>
      </h2>
      <form className="row-form" onSubmit={addTask}>
        <input
          type="text"
          placeholder="New task …"
          required
          maxLength={120}
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <select value={prio} onChange={e => setPrio(e.target.value as Priority)}>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="low">Low</option>
        </select>
        <button className="btn" type="submit">
          +
        </button>
      </form>
      <div className="filters">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`btn-ghost ${state.taskFilter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
        {doneCount > 0 && (
          <button className="link-btn clear-done" onClick={clearCompleted}>
            Clear {doneCount} done
          </button>
        )}
      </div>
      {visible.length === 0 && <p className="empty">Nothing here.</p>}
      {visible.map(t => (
        <div className={`task ${t.done ? "done" : ""}`} key={t.id}>
          <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
          <span className={`prio ${t.prio}`} title={`Priority: ${t.prio}`} />
          {editingId === t.id ? (
            <form className="inline-edit" onSubmit={saveEdit}>
              <input
                autoFocus
                maxLength={120}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key === "Escape" && cancelEdit()}
              />
              <button className="btn-ghost" type="submit">
                Save
              </button>
            </form>
          ) : (
            <>
              <span className="t-title" onDoubleClick={() => startEdit(t)}>
                {t.title}
              </span>
              <button className="icon-btn" onClick={() => startEdit(t)} title="Edit">
                ✎
              </button>
              <button className="icon-btn" onClick={() => remove(t.id)} title="Delete">
                ✕
              </button>
            </>
          )}
        </div>
      ))}
    </section>
  );
}
