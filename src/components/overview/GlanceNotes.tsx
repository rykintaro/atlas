import { useApp } from "../../hooks/useAppState";
import type { View } from "../../hooks/useView";

export function GlanceNotes({ onNavigate }: { onNavigate: (v: View) => void }) {
  const { state } = useApp();
  const recent = [...state.notes]
    .sort((a, b) => Number(b.pinned ?? false) - Number(a.pinned ?? false))
    .slice(0, 3);

  return (
    <section className="card">
      <h2>
        Notes
        <button className="link-btn" onClick={() => onNavigate("notes")}>
          View all →
        </button>
      </h2>
      {recent.length === 0 && <p className="empty">No notes yet.</p>}
      {recent.map(n => (
        <div className="note" key={n.id}>
          <div className="n-body glance-note">
            {n.body}
            <div className="n-date">
              {new Date(n.created).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
