"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

// The project cursors exist only for a real mouse, and only if the visitor
// has not asked for reduced motion. Phones and tablets never get them.
const QUERY =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const matches = () => window.matchMedia(QUERY).matches;
const never = () => false; // on the server there is no mouse

// What the Road Damage cursor's label says about the thing under it.
function describe(target: EventTarget | null) {
  const el =
    target instanceof Element ? target.closest("a, button, label") : null;
  if (!el) return "road 0.99";
  return el.tagName === "A" ? "link 0.94" : "button 0.97";
}

// One element that sits exactly at the pointer. What it looks like depends on
// the page's theme and is all CSS: see "Project cursors" in app/globals.css.
// Outside a project's theme it is hidden and the normal arrow is used.
export function Cursor() {
  const enabled = useSyncExternalStore(subscribe, matches, never);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    const html = document.documentElement;

    const onMove = (event: PointerEvent) => {
      el.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
      el.dataset.seen = "";
    };
    const onOver = (event: PointerEvent) => {
      el.dataset.label = describe(event.target);
    };
    const onLeave = () => delete el.dataset.seen;

    html.classList.add("has-cursor");
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    html.addEventListener("pointerleave", onLeave);
    return () => {
      html.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      html.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div ref={ref} aria-hidden className="cursor" data-label="road 0.99">
      <i />
    </div>
  );
}
