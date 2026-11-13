"use client";

import { useEffect } from "react";

// Renders nothing. It watches every <section data-chapter="..."> on the page
// and writes the name of the one crossing the middle of the window to
// <html data-theme="...">. The colours themselves, and the fade between
// them, are CSS: see the theme blocks in app/globals.css.
export function ThemeWatcher() {
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.theme = "neutral";

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const name = (entry.target as HTMLElement).dataset.chapter!;
          if (entry.isIntersecting) {
            html.dataset.theme = name;
          } else if (html.dataset.theme === name) {
            // Only the chapter that is active may hand the page back.
            html.dataset.theme = "neutral";
          }
        }
      },
      // Shrinks the watched area to a line across the middle of the window.
      { rootMargin: "-50% 0px -50% 0px" },
    );

    document
      .querySelectorAll("[data-chapter]")
      .forEach((chapter) => observer.observe(chapter));

    return () => {
      observer.disconnect();
      delete html.dataset.theme;
    };
  }, []);

  return null;
}
