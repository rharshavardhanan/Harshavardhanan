"use client";

import { useEffect } from "react";

// Renders nothing. On a case-study page it puts the project's name on
// <html data-theme>, so the whole window (header, cursor, page background)
// takes that project's colours. It removes it again when you leave.
export function ThemeSetter({ theme }: { theme: string }) {
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    return () => {
      delete document.documentElement.dataset.theme;
    };
  }, [theme]);
  return null;
}
