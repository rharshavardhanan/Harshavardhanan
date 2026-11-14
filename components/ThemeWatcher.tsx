"use client";

import { useEffect } from "react";

// Renders nothing. It watches every part of the page marked data-zone="..."
// (the hero, the work index, each project chapter) and writes the name of the
// one crossing the middle of the window to <html data-active="...">. The
// particle object reads that to decide its shape, colour and position.
export function ThemeWatcher() {
  useEffect(() => {
    const html = document.documentElement;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const name = (entry.target as HTMLElement).dataset.zone!;
          if (entry.isIntersecting) {
            html.dataset.active = name;
          } else if (html.dataset.active === name) {
            // Only the zone that is active may give the page back.
            delete html.dataset.active;
          }
        }
      },
      // Shrinks the watched area to a line across the middle of the window.
      { rootMargin: "-50% 0px -50% 0px" },
    );

    document
      .querySelectorAll("[data-zone]")
      .forEach((zone) => observer.observe(zone));

    return () => {
      observer.disconnect();
      delete html.dataset.active;
    };
  }, []);

  return null;
}
