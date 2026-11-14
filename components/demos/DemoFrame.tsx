import { useEffect, type RefObject } from "react";

// The box every demo sits in: a title on the left, a short honest note on the
// right ("scripted", "simulated"), and the demo itself underneath.
export function DemoFrame({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="border-line border">
      <figcaption className="label border-line flex flex-wrap justify-between gap-x-4 border-b px-4 py-2 font-mono">
        <span className="text-accent">{title}</span>
        <span className="text-muted">{note}</span>
      </figcaption>
      <div className="p-4 md:p-6">{children}</div>
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
