"use client";

import "lenis/dist/lenis.css";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { afterLoad } from "@/lib/after-load";

type Lenis = InstanceType<typeof import("lenis").default>;
type ScrollTrigger = typeof import("gsap/ScrollTrigger").ScrollTrigger;

// Renders nothing. It switches smooth scrolling on (Lenis), and makes GSAP's
// scroll animations read their position from it, so the two never disagree.
// Visitors who asked their system for reduced motion get normal scrolling.
// Both libraries are fetched after the page has loaded, so they never delay
// the first picture of the page.
//
// It also makes every new page start at the top. Lenis keeps its own record
// of how far down you are; when Next.js changes page and jumps to the top,
// Lenis does not know, and on its next frame it would put you back at the old
// height. So on every change of address it is told to go to the top too.
export function SmoothScroll() {
  const pathname = usePathname();
  const lenis = useRef<Lenis | null>(null);
  const trigger = useRef<ScrollTrigger | null>(null);

  // The browser's own habit of restoring old scroll positions is switched off:
  // where a page starts is decided here alone.
  useEffect(() => {
    history.scrollRestoration = "manual";
  }, []);

  // On every change of address: to the top, at once, even if Lenis is paused
  // (force); then, a frame later, the scroll animations re-measure the new
  // page, or they would fire at the old page's heights.
  useEffect(() => {
    lenis.current?.scrollTo(0, { immediate: true, force: true });
    const frame = requestAnimationFrame(() => trigger.current?.refresh());
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

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
      trigger.current = ScrollTrigger;

      // GSAP's clock drives Lenis: one loop for everything that moves.
      const tick = (time: number) => lenis.current?.raf(time * 1000);

      // Runs now, and again whenever the visitor changes the system setting.
      const sync = () => {
        lenis.current?.destroy();
        lenis.current = null;
        if (reduce.matches) return;
        // lerp 0.1: each frame the page covers a tenth of the remaining distance.
        // anchors: links such as #proof glide to their section.
        lenis.current = new Lenis({ lerp: 0.1, anchors: true });
        lenis.current.on("scroll", ScrollTrigger.update);
      };

      sync();
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      reduce.addEventListener("change", sync);
      cleanup = () => {
        reduce.removeEventListener("change", sync);
        gsap.ticker.remove(tick);
        lenis.current?.destroy();
        lenis.current = null;
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
