import { useEffect, useState } from "react";

export const VIEWS = ["overview", "goals", "habits", "tasks", "notes", "finances"] as const;
export type View = (typeof VIEWS)[number];

function parseHash(): View {
  const hash = window.location.hash.replace(/^#\/?/, "");
  return (VIEWS as readonly string[]).includes(hash) ? (hash as View) : "overview";
}

export function useView(): [View, (view: View) => void] {
  const [view, setView] = useState<View>(parseHash);

  useEffect(() => {
    const onHashChange = () => setView(parseHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = (next: View) => {
    window.location.hash = `/${next}`;
    window.scrollTo({ top: 0 });
  };

  return [view, navigate];
}
