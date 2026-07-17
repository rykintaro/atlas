import { heatmap, HEATMAP_WEEKS, monthMarkers } from "../../lib/habits";
import type { Habit } from "../../types";

const ROW_LABELS = ["Mo", "", "We", "", "Fr", "", "Su"];

interface Props {
  habit: Habit;
  onToggleDay: (key: string) => void;
}

export function HabitHeatmap({ habit, onToggleDay }: Props) {
  const weeks = heatmap(habit);
  const markers = monthMarkers(weeks);

  return (
    <div className="heatmap">
      <div className="heat-main">
        <div className="heat-rows">
          {ROW_LABELS.map((label, i) => (
            <span className="heat-row-lbl" key={i}>
              {label}
            </span>
          ))}
        </div>
        <div className="heat-body">
          <div className="heat-months">
            {markers.map((m, i) => (
              <span className="heat-month" key={i}>
                {m}
              </span>
            ))}
          </div>
          <div className="heat-grid">
            {weeks.flat().map(cell => (
              <button
                key={cell.key}
                className={`heat-cell ${cell.done ? "on" : ""} ${cell.future ? "future" : ""}`}
                disabled={cell.future}
                title={`${new Date(cell.key).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}${cell.done ? " · done" : ""}`}
                onClick={() => onToggleDay(cell.key)}
              />
            ))}
          </div>
        </div>
      </div>
      <span className="heat-caption">Last {HEATMAP_WEEKS} weeks · click to edit</span>
    </div>
  );
}
