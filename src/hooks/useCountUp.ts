import { useEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    const origin = from.current;
    from.current = target;
    if (origin === target || prefersReducedMotion()) {
      setValue(target);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setValue(origin + (target - origin) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const settle = setTimeout(() => setValue(target), duration + 80);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settle);
    };
  }, [target, duration]);

  return value;
}
