const QUOTES: ReadonlyArray<readonly [string, string]> = [
  ["Discipline is the bridge between goals and accomplishment.", "Jim Rohn"],
  ["It is not that we have a short time to live, but that we waste a lot of it.", "Seneca"],
  ["Success is the sum of small efforts, repeated day in and day out.", "Robert Collier"],
  ["The best time to plant a tree was twenty years ago. The second best time is now.", "Proverb"],
  ["A journey of a thousand miles begins with a single step.", "Lao Tzu"],
  ["He who has a why to live can bear almost any how.", "Friedrich Nietzsche"],
  ["Great things are done by a series of small things brought together.", "Vincent van Gogh"],
  ["It is not the wind, but the sail, that determines the direction.", "Proverb"],
  ["What you do today can improve all your tomorrows.", "Ralph Marston"],
  ["Well begun is half done.", "Aristotle"],
  ["Either you run the day or the day runs you.", "Jim Rohn"],
  ["Action is the foundational key to all success.", "Pablo Picasso"],
  ["Simplicity is the ultimate sophistication.", "Leonardo da Vinci"],
  ["We are what we repeatedly do. Excellence, then, is not an act, but a habit.", "Will Durant"],
];

export function quoteOfDay(now: Date): readonly [string, string] {
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000,
  );
  return QUOTES[dayOfYear % QUOTES.length];
}
