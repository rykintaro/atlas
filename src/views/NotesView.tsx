import { useState, type FormEvent } from "react";
import { useApp } from "../hooks/useAppState";
import { useToast } from "../hooks/useToast";
import { plural, timeAgo } from "../lib/date";
import { insertAt } from "../lib/collections";
import { uid } from "../lib/storage";
import type { Note } from "../types";

const PAGE_SIZE = 12;

function byPinned(a: Note, b: Note): number {
  return Number(b.pinned ?? false) - Number(a.pinned ?? false);
}

export function NotesView() {
  const { state, update } = useApp();
  const { show } = useToast();
  const [body, setBody] = useState("");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const needle = query.trim().toLowerCase();
  const filtered = (
    needle ? state.notes.filter(n => n.body.toLowerCase().includes(needle)) : state.notes
  )
    .slice()
    .sort(byPinned);
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

  const remove = (id: string) => {
    const index = state.notes.findIndex(n => n.id === id);
    const note = state.notes[index];
    if (!note) return;
    update(s => ({ ...s, notes: s.notes.filter(n => n.id !== id) }));
    show("Note deleted", () =>
      update(s => ({ ...s, notes: insertAt(s.notes, index, note) })),
    );
  };

  const togglePin = (id: string) =>
    update(s => ({
      ...s,
      notes: s.notes.map(n => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
    }));

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setDraft(note.body);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft("");
  };

  const saveEdit = () => {
    const trimmed = draft.trim();
    if (!trimmed || !editingId) return;
    update(s => ({
      ...s,
      notes: s.notes.map(n =>
        n.id === editingId && n.body !== trimmed
          ? { ...n, body: trimmed, updated: new Date().toISOString() }
          : n,
      ),
    }));
    cancelEdit();
  };

  return (
    <>
      <div className="view-head">
        <div>
          <h1 className="view-title">Notes</h1>
          <p className="view-sub">
            {plural(state.notes.length, "note", "notes")}
            {state.notes.some(n => n.pinned) &&
              ` · ${state.notes.filter(n => n.pinned).length} pinned`}
          </p>
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
            <div className={`card note-card ${n.pinned ? "pinned" : ""}`} key={n.id}>
              {editingId === n.id ? (
                <div className="note-edit">
                  <textarea
                    autoFocus
                    maxLength={2000}
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Escape") cancelEdit();
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveEdit();
                    }}
                  />
                  <div className="note-edit-actions">
                    <button className="btn" onClick={saveEdit}>
                      Save
                    </button>
                    <button className="btn-ghost" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="n-body">{n.body}</div>
                  <div className="note-card-foot">
                    <span className="n-date">
                      {timeAgo(n.created)}
                      {n.updated && " · edited"}
                    </span>
                    <span className="note-actions">
                      <button
                        className={`icon-btn pin-btn ${n.pinned ? "on" : ""}`}
                        onClick={() => togglePin(n.id)}
                        title={n.pinned ? "Unpin" : "Pin"}
                      >
                        {n.pinned ? "★" : "☆"}
                      </button>
                      <button className="icon-btn" onClick={() => startEdit(n)} title="Edit">
                        ✎
                      </button>
                      <button className="icon-btn" onClick={() => remove(n.id)} title="Delete">
                        ✕
                      </button>
                    </span>
                  </div>
                </>
              )}
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
