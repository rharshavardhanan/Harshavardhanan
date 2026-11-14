"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Renders nothing. It looks at what is directly under the fixed header, finds
// the nearest part of the page marked data-tone="dark" (or light, the default)
// and writes it to <html data-tone>. The header turns paper-coloured over dark
// parts and ink over light ones (see .site-header in globals.css).
export function HeaderTone() {
  const pathname = usePathname();

  useEffect(() => {
    const html = document.documentElement;
    let frame = 0;

    const check = () => {
      frame = 0;
      const header = document.querySelector(".site-header");
      const y = header ? header.getBoundingClientRect().height / 2 : 24;
      // Everything at that point, top first. Things that ignore the pointer
      // (the particle layer, the cursor) are already left out by the browser.
      const under = document
        .elementsFromPoint(window.innerWidth / 2, y)
        .find(
          (el) =>
            el !== html &&
            el !== document.body &&
            !el.closest(".site-header, .wipe, dialog"),
        );
      html.dataset.tone =
        under?.closest<HTMLElement>("[data-tone]")?.dataset.tone ?? "light";
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };

    check();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
    };
  }, [pathname]);

  return null;
}
