"use client";

import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { projects } from "@/content/projects";
import { Decode } from "./Decode";

// The frame's bottom row: which project you are looking at, and where it sits
// in the list ("03 / 07"). Pages say which project that is by writing its
// name to <html data-active="..."> (the home ring as it turns, a project page
// when it opens); this re-reads it whenever it changes.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributeFilter: ["data-active"],
  });
  return () => observer.disconnect();
}
const getActive = () => document.documentElement.dataset.active ?? "";
const getServerActive = () => "";

/** 3 → "03". */
const two = (n: number) => String(n).padStart(2, "0");

export function CornerStatus() {
  const active = useSyncExternalStore(subscribe, getActive, getServerActive);
  const index = projects.findIndex((project) => project.slug === active);
  const pathname = usePathname();

  // On a project page the big title names the project, so the name down
  // here steps aside while that title is on screen (it would only repeat it,
  // and on a short screen the credits reach down to this row); it comes back
  // once you scroll past, as a reminder. <html data-title-shown> says so
  // (app/globals.css). Every title block is watched: the page you left stays
  // in the document, hidden, for the Back button, and a hidden one is never
  // on screen.
  useEffect(() => {
    const html = document.documentElement;
    const titles = document.querySelectorAll(".poster-title");
    if (!titles.length) return;
    const showing = new Set<Element>();
    const seen = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) showing.add(entry.target);
        else showing.delete(entry.target);
      }
      if (showing.size) html.dataset.titleShown = "";
      else delete html.dataset.titleShown;
    });
    titles.forEach((title) => seen.observe(title));
    return () => {
      seen.disconnect();
      delete html.dataset.titleShown;
    };
  }, [pathname]);

  // SELECTED WORK · THE PROJECT'S NAME, in Space Mono, in the middle · 02 / 07.
  // The name and the count decode (components/Decode.tsx) each time they
  // change. On phones SELECTED WORK keeps its place, unseen, so the name
  // stays in the middle. A long name wraps to two lines rather than being
  // cut short (on a laptop or larger it fits on one).
  return (
    <footer className="corner-row corner-bottom">
      <p className="py-2 max-sm:invisible">Selected work</p>
      <p className="corner-project">
        <Decode
          className="block"
          text={index >= 0 ? projects[index].title : ""}
        />
      </p>
      <p className="justify-self-end py-2">
        <Decode
          text={index >= 0 ? `${two(index + 1)} / ${two(projects.length)}` : ""}
        />
      </p>
    </footer>
  );
}
