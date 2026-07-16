import { useEffect, useState } from "react";
import { AppStateProvider } from "./hooks/useAppState";
import { TimerProvider } from "./hooks/useTimer";
import { ToastProvider } from "./hooks/useToast";
import { useView } from "./hooks/useView";
import { Header } from "./components/Header";
import { Intro } from "./components/Intro";
import { Nav } from "./components/Nav";
import { OverviewView } from "./views/OverviewView";
import { GoalsView } from "./views/GoalsView";
import { TasksView } from "./views/TasksView";
import { NotesView } from "./views/NotesView";
import { FinanceView } from "./views/FinanceView";

type IntroPhase = "showing" | "leaving" | "done";

const INTRO_KEY = "atlas-intro-seen";

export default function App() {
  const [view, navigate] = useView();
  const [phase, setPhase] = useState<IntroPhase>(() =>
    sessionStorage.getItem(INTRO_KEY) ? "done" : "showing",
  );

  useEffect(() => {
    if (phase !== "showing") return;
    const leave = setTimeout(() => setPhase("leaving"), 1700);
    return () => clearTimeout(leave);
  }, [phase]);

  useEffect(() => {
    if (phase !== "leaving") return;
    sessionStorage.setItem(INTRO_KEY, "1");
    const done = setTimeout(() => setPhase("done"), 700);
    return () => clearTimeout(done);
  }, [phase]);

  return (
    <AppStateProvider>
      <ToastProvider>
        <TimerProvider>
          {phase !== "done" && (
            <Intro leaving={phase === "leaving"} onSkip={() => setPhase("leaving")} />
          )}
          <div className={`wrap ${phase === "showing" ? "pre" : "enter"}`}>
            <Header />
            <Nav view={view} onNavigate={navigate} />
            <div className="view" key={view}>
              {view === "overview" && <OverviewView onNavigate={navigate} />}
              {view === "goals" && <GoalsView />}
              {view === "tasks" && <TasksView />}
              {view === "notes" && <NotesView />}
              {view === "finances" && <FinanceView />}
            </div>
            <footer>ATLAS — All data stays local in this browser.</footer>
          </div>
        </TimerProvider>
      </ToastProvider>
    </AppStateProvider>
  );
}
