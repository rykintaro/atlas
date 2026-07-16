import { useNow } from "../hooks/useNow";
import { fmtDate } from "../lib/date";
import { quoteOfDay } from "../lib/quotes";

function greetingFor(hour: number): string {
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function Hero() {
  const now = useNow(60000);
  const [quote, author] = quoteOfDay(now);

  return (
    <section className="hero">
      <div className="date">{fmtDate(now)}</div>
      <h1>{greetingFor(now.getHours())}, Ali.</h1>
      <p className="quote">
        “{quote}” — <b>{author}</b>
      </p>
    </section>
  );
}
