import { useState, type FormEvent } from "react";
import { useApp } from "../hooks/useAppState";
import { plural } from "../lib/date";
import { uid } from "../lib/storage";

const PAGE_SIZE = 12;

export function NotesView() {
  const { state, update } = useApp();
  const [body, setBody] = useState("");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const needle = query.trim().toLowerCase();
  const filtered = needle
    ? state.notes.filter(n => n.body.toLowerCase().includes(needle))
    : state.notes;
  const visible = filtered.slice(0, limit);

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
    <>
      <div className="view-head">
        <div>
          <h1 className="view-title">Notes</h1>
          <p className="view-sub">{plural(state.notes.length, "note", "notes")}</p>
        </div>
        <input
          type="text"
          className="search"
          placeholder="Search notes …"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setLimit(PAGE_SIZE);
          }}
        />
      </div>
      <section className="card composer">
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
      </section>
      {filtered.length === 0 ? (
        <p className="empty">{needle ? "No notes match your search." : "No notes yet."}</p>
      ) : (
        <div className="notes-columns">
          {visible.map(n => (
            <div className="card note-card" key={n.id}>
              <div className="n-body">{n.body}</div>
              <div className="note-card-foot">
                <span className="n-date">
                  {new Date(n.created).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <button className="icon-btn" onClick={() => remove(n.id)} title="Delete">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {filtered.length > limit && (
        <div className="load-more">
          <button className="btn-ghost" onClick={() => setLimit(l => l + PAGE_SIZE)}>
            Show older notes ({filtered.length - limit} more)
          </button>
        </div>
      )}
    </>
  );
}
