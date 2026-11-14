"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { projects } from "@/content/projects";

// The page transition. When a link to another page of this site is clicked,
// a sheet in the destination's colour rises over the window, the page changes
// underneath, and the sheet leaves. Visitors who asked for reduced motion get
// a plain page change. The sheet's movement is under "Page wipe" in globals.css.
export function Wipe() {
  const router = useRouter();
  const pathname = usePathname();
  const sheet = useRef<HTMLDivElement>(null);
  const leaving = useRef(false);
  const [title, setTitle] = useState("");

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      // Leave alone: right clicks, cmd/ctrl-clicks (new tab), other sites,
      // links within the same page, and files such as the résumé.
      if (event.button !== 0 || event.metaKey || event.ctrlKey) return;
      if (event.shiftKey || event.altKey || event.defaultPrevented) return;
      const link = (event.target as Element).closest("a");
      if (!link || link.target || link.hasAttribute("download")) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname) return;
      if (/\.\w+$/.test(url.pathname)) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      event.preventDefault();
      const project = url.pathname.match(/^\/work\/([a-z]+)/)?.[1];
      sheet.current!.dataset.theme = project ?? "neutral";
      // The destination's title rises in the sheet (none for the home page).
      setTitle(projects.find((item) => item.slug === project)?.title ?? "");
      sheet.current!.dataset.state = "in";
      leaving.current = true;
      // Change page once the sheet has covered the window.
      setTimeout(() => router.push(url.pathname + url.hash), 900);
    };
    // "true" = hear the click before the link itself does.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  // The address has changed: the new page is in, so take the sheet away.
  useEffect(() => {
    if (!leaving.current) return;
    leaving.current = false;
    const el = sheet.current!;
    el.dataset.state = "out";
    const done = setTimeout(() => delete el.dataset.state, 550);
    return () => clearTimeout(done);
  }, [pathname]);

  return (
    <div
      ref={sheet}
      aria-hidden
      className="wipe px-gutter flex items-end pb-14"
    >
      <p className="wipe-title text-display font-serif">
        <span>{title}</span>
      </p>
    </div>
  );
}
