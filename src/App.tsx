import { AppStateProvider } from "./hooks/useAppState";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { OverviewStats } from "./components/OverviewStats";
import { GoalsCard } from "./components/GoalsCard";
import { FocusCard } from "./components/FocusCard";
import { HabitsCard } from "./components/HabitsCard";
import { TasksCard } from "./components/TasksCard";
import { NotesCard } from "./components/NotesCard";
import { TodayCard } from "./components/TodayCard";
import { FinanceSection } from "./components/finance/FinanceSection";

export default function App() {
  return (
    <AppStateProvider>
      <div className="wrap">
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
