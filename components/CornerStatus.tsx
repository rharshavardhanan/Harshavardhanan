"use client";

import { useSyncExternalStore } from "react";
import { projects } from "@/content/projects";

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

  return (
    <footer className="corner-row corner-bottom">
      <p className="truncate py-2">{index >= 0 && projects[index].title}</p>
      <p className="py-2 max-sm:hidden">Selected work</p>
      <p className="justify-self-end py-2">
        {index >= 0 && `${two(index + 1)} / ${two(projects.length)}`}
      </p>
    </footer>
  );
}
