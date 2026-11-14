import { useEffect, type RefObject } from "react";

// What every demo sits in: no box, just a caption line above it with the
// demo's name and an honest note ("Scripted example", "Simulated in your
// browser"), so nobody mistakes it for the live product.
export function DemoFrame({
  title,
  note,
  children,
  className = "",
}: {
  title: string;
  note: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <figure className={className}>
      <figcaption className="label border-line mb-8 flex flex-wrap justify-between gap-x-6 gap-y-1 border-b pb-3">
        <span className="text-accent">{title}</span>
        <span className="text-muted">{note}</span>
      </figcaption>
      {children}
    </figure>
  );
}

/** Runs `start` once, the first time the element scrolls well into view. */
export function useStartInView(
  ref: RefObject<HTMLElement | null>,
  start: () => void,
) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        start();
      },
      { threshold: 0.6 },
    );
    observer.observe(ref.current!);
    return () => observer.disconnect();
    // `start` is deliberately left out: this must run once, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);
}

/** True if the visitor asked their system for reduced motion. */
export const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
