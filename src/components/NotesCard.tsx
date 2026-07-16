import { useState, type FormEvent } from "react";
import { useApp } from "../hooks/useAppState";
import { uid } from "../lib/storage";

export function NotesCard() {
  const { state, update } = useApp();
  const [body, setBody] = useState("");

  const addNote = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    update(s => ({
      ...s,
      notes: [{ id: uid(), body: trimmed, created: new Date().toISOString() }, ...s.notes],
    }));
    setBody("");
  };

  const remove = (id: string) =>
    update(s => ({ ...s, notes: s.notes.filter(n => n.id !== id) }));

  return (
    <section className="card span2">
      <h2>Notes</h2>
      <form className="note-form" onSubmit={addNote}>
        <textarea
          placeholder="Capture a thought …"
          required
          maxLength={2000}
          value={body}
          onChange={e => setBody(e.target.value)}
        />
        <button className="btn" type="submit">
          Save
        </button>
      </form>
      {state.notes.length === 0 && <p className="empty">No notes yet.</p>}
      {state.notes.map(n => (
        <div className="note" key={n.id}>
          <div className="n-body">
            {n.body}
            <div className="n-date">
              {new Date(n.created).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
          <button className="icon-btn" onClick={() => remove(n.id)} title="Delete">
            ✕
          </button>
        </div>
      ))}
    </section>
  );
}
