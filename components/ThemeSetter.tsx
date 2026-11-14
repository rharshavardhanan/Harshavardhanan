"use client";

import { useEffect } from "react";

// Renders nothing. On a project page it puts the project's name on
// <html data-theme>, so the whole window (frame, cursor, page background)
// takes that project's colours, and on <html data-active>, so the frame's
// bottom row names it. It removes both again when you leave.
export function ThemeSetter({ theme }: { theme: string }) {
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.theme = theme;
    html.dataset.active = theme;
    return () => {
      delete html.dataset.theme;
      delete html.dataset.active;
    };
  }, [theme]);
  return null;
}
