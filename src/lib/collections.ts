export function insertAt<T>(items: T[], index: number, item: T): T[] {
  const safe = Math.max(0, Math.min(items.length, index));
  return [...items.slice(0, safe), item, ...items.slice(safe)];
}
