"use client";

import "lenis/dist/lenis.css";
import { useEffect } from "react";
import { afterLoad } from "@/lib/after-load";

// Renders nothing. It switches smooth scrolling on (Lenis), and makes GSAP's
// scroll animations read their position from it, so the two never disagree.
// Visitors who asked their system for reduced motion get normal scrolling.
// Both libraries are fetched after the page has loaded, so they never delay
// the first picture of the page.
export function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cleanup = () => {};
    let cancelled = false;

    const start = async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] =
        await Promise.all([
          import("lenis"),
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      let lenis: InstanceType<typeof Lenis> | null = null;
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
      cleanup = () => {
        reduce.removeEventListener("change", sync);
        gsap.ticker.remove(tick);
        lenis?.destroy();
      };
    };

    const cancelWait = afterLoad(() => void start());
    return () => {
      cancelWait();
      cancelled = true;
      cleanup();
    };
  }, []);

  return null;
}
