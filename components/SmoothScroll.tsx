"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

// Renders nothing. It switches smooth scrolling on (Lenis), and makes GSAP's
// scroll animations read their position from it, so the two never disagree.
// Visitors who asked their system for reduced motion get normal scrolling.
export function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;
    // GSAP's clock drives Lenis: one loop for everything that moves.
    const tick = (time: number) => lenis?.raf(time * 1000);

    // Runs now, and again whenever the visitor changes the system setting.
    const sync = () => {
      lenis?.destroy();
      lenis = null;
      if (reduce.matches) return;
      // lerp 0.1: each frame the page covers a tenth of the remaining distance.
      // anchors: links such as #work glide to their section.
      lenis = new Lenis({ lerp: 0.1, anchors: true });
      lenis.on("scroll", ScrollTrigger.update);
    };

    sync();
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    reduce.addEventListener("change", sync);
    return () => {
      reduce.removeEventListener("change", sync);
      gsap.ticker.remove(tick);
      lenis?.destroy();
    };
  }, []);

  return null;
}
