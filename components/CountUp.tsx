"use client";

import { useEffect, useRef } from "react";

type Props = { n: number; decimals?: number; prefix?: string; suffix?: string };

const format = (value: number, decimals: number) =>
  value.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

// A number that counts up from zero the first time it scrolls into view.
// The server sends the final number, so it is correct with JavaScript off
// and for search engines; visitors who asked for reduced motion see no count.
export function CountUp({ n, decimals = 0, prefix = "", suffix = "" }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / 1400, 1);
        const eased = 1 - (1 - t) ** 4; // fast at first, settling at the end
        el.textContent = prefix + format(n * eased, decimals) + suffix;
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [n, decimals, prefix, suffix]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix + format(n, decimals) + suffix}
    </span>
  );
}
