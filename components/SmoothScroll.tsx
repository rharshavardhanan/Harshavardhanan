"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

// Renders nothing. It only switches smooth scrolling on, and switches it off
// again if the visitor has asked their system for reduced motion.
export function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;

    // Runs now, and again whenever the visitor changes the system setting.
    const sync = () => {
      lenis?.destroy();
      // autoRaf: Lenis runs its own animation loop.
      // anchors: links such as #work glide to their section.
      lenis = reduce.matches
        ? null
        : new Lenis({ autoRaf: true, anchors: true });
    };

    sync();
    reduce.addEventListener("change", sync);
    return () => {
      reduce.removeEventListener("change", sync);
      lenis?.destroy();
    };
  }, []);

  return null;
}
