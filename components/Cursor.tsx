"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

// The custom cursor exists only for a real mouse, and only if the visitor
// has not asked for reduced motion. Phones and tablets never get it.
const QUERY =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const matches = () => window.matchMedia(QUERY).matches;
const never = () => false; // on the server there is no mouse

type Gsap = typeof import("gsap").gsap;

// Moves the dot and the word with the pointer, and tells them what is under
// it. Returns a function that stops all of that.
function follow(gsap: Gsap, dot: HTMLElement, word: HTMLElement) {
  const parts = [dot, word];
  const html = document.documentElement;
  // quickTo makes a function that glides a value to wherever you send it.
  const toX = parts.map((el) =>
    gsap.quickTo(el, "x", { duration: 0.15, ease: "power3.out" }),
  );
  const toY = parts.map((el) =>
    gsap.quickTo(el, "y", { duration: 0.15, ease: "power3.out" }),
  );
  let seen = false;

  const onMove = (event: PointerEvent) => {
    if (!seen) {
      // First sighting: start at the pointer instead of gliding in from the corner.
      seen = true;
      gsap.set(parts, { x: event.clientX, y: event.clientY });
      parts.forEach((el) => (el.dataset.seen = ""));
    }
    toX.forEach((to) => to(event.clientX));
    toY.forEach((to) => to(event.clientY));
  };
  const onOver = (event: PointerEvent) => {
    const target = event.target instanceof Element ? event.target : null;
    const media = target?.closest<HTMLElement>("[data-cursor]");
    const link = target?.closest("a, button, label");
    const over = media ? "media" : link ? "link" : "";
    parts.forEach((el) => (el.dataset.over = over));
    if (media) word.firstElementChild!.textContent = media.dataset.cursor!;
  };
  const onLeave = () => {
    seen = false;
    parts.forEach((el) => delete el.dataset.seen);
  };

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
}

// A dot that follows the pointer. Over a link or button it grows a little.
// Over anything marked data-cursor="View" (or "Play", "Copy") it grows into a
// circle with that word in it. The look is under "Cursor" in globals.css.
export function Cursor() {
  const enabled = useSyncExternalStore(subscribe, matches, never);
  const dot = useRef<HTMLDivElement>(null);
  const word = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    let stop = () => {};
    let cancelled = false;
    // GSAP is fetched only on devices that get this cursor.
    void import("gsap").then(({ gsap }) => {
      if (cancelled || !dot.current || !word.current) return;
      stop = follow(gsap, dot.current, word.current);
    });
    return () => {
      cancelled = true;
      stop();
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <div ref={dot} aria-hidden className="cursor-dot" />
      <div ref={word} aria-hidden className="cursor-word label">
        <span />
      </div>
    </>
  );
}
