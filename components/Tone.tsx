"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Renders nothing. It looks at what lies under the frame's top row and under
// its bottom row, finds the nearest part of the page marked data-tone="dark",
// "light" or "media", and writes the answers to <html data-tone> (top) and
// <html data-tone-bottom>. The frame's letters turn paper-coloured over dark
// parts and ink over light ones (see "Corners" in app/globals.css).
//
// It checks again when the page scrolls or resizes, and when anything sends a
// "tone" event (the home ring does, each time a new project turns to face you).
export function Tone() {
  const pathname = usePathname();

  useEffect(() => {
    const html = document.documentElement;
    let frame = 0;

    // The tone of whatever is at height y in the middle of the window.
    const toneAt = (y: number) => {
      const under = document
        .elementsFromPoint(window.innerWidth / 2, y)
        .find(
          (el) =>
            el !== html &&
            el !== document.body &&
            !el.closest(".corners, .wipe, dialog"),
        );
      return (
        under?.closest<HTMLElement>("[data-tone]")?.dataset.tone ?? "light"
      );
    };

    const check = () => {
      frame = 0;
      html.dataset.tone = toneAt(24);
      html.dataset.toneBottom = toneAt(window.innerHeight - 24);
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };

    check();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    window.addEventListener("tone", queue);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      window.removeEventListener("tone", queue);
    };
  }, [pathname]);

  return null;
}
