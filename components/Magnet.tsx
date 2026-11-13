"use client";

import { useEffect } from "react";

// Renders nothing. Makes every .btn lean a little toward the pointer while it
// is hovered ("magnetic buttons"). Mouse only, and not under reduced motion.
export function Magnet() {
  useEffect(() => {
    const ok = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    if (!ok.matches) return;
    let held: HTMLElement | null = null;

    const release = () => {
      held?.style.removeProperty("translate");
      held = null;
    };
    const onMove = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const button = target?.closest<HTMLElement>(".btn") ?? null;
      if (button !== held) release();
      if (!button) return;
      held = button;
      const box = button.getBoundingClientRect();
      // A quarter of the way from the button's centre to the pointer.
      const x = (event.clientX - (box.left + box.width / 2)) * 0.25;
      const y = (event.clientY - (box.top + box.height / 2)) * 0.25;
      button.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      release();
    };
  }, []);
  return null;
}
