import { Hero } from "../components/Hero";
import { OverviewStats } from "../components/OverviewStats";
import { FocusCard } from "../components/FocusCard";
import { TodayCard } from "../components/TodayCard";
import { GlanceGoals } from "../components/overview/GlanceGoals";
import { GlanceTasks } from "../components/overview/GlanceTasks";
import { GlanceNotes } from "../components/overview/GlanceNotes";
import type { View } from "../hooks/useView";

export function OverviewView({ onNavigate }: { onNavigate: (v: View) => void }) {
  return (
    <>
      <Hero />
      <OverviewStats />
      <main className="grid">
        <GlanceGoals onNavigate={onNavigate} />
        <FocusCard />
        <TodayCard />
        <GlanceTasks onNavigate={onNavigate} />
        <GlanceNotes onNavigate={onNavigate} />
      </main>
    </>
  );
}
