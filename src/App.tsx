import { useEffect, useState } from "react";
import { AppStateProvider } from "./hooks/useAppState";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Intro } from "./components/Intro";
import { OverviewStats } from "./components/OverviewStats";
import { GoalsCard } from "./components/GoalsCard";
import { FocusCard } from "./components/FocusCard";
import { HabitsCard } from "./components/HabitsCard";
import { TasksCard } from "./components/TasksCard";
import { NotesCard } from "./components/NotesCard";
import { TodayCard } from "./components/TodayCard";
import { FinanceSection } from "./components/finance/FinanceSection";

type IntroPhase = "showing" | "leaving" | "done";

const INTRO_KEY = "atlas-intro-seen";

export default function App() {
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
      {phase !== "done" && (
        <Intro leaving={phase === "leaving"} onSkip={() => setPhase("leaving")} />
      )}
      <div className={`wrap ${phase === "showing" ? "pre" : "enter"}`}>
        <Header />
        <Hero />
        <OverviewStats />
        <main className="grid">
          <GoalsCard />
          <FocusCard />
          <HabitsCard />
          <TasksCard />
          <NotesCard />
          <TodayCard />
        </main>
        <FinanceSection />
        <footer>ATLAS — All data stays local in this browser.</footer>
      </div>
    </AppStateProvider>
  );
}
