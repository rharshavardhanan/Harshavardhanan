"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { projects, type Slug } from "@/content/projects";
import { AnomalyCount } from "./Anomaly";
import { Sound } from "./Sound";

// The full-screen index. MENU is a link to the home page's list of projects,
// so it still works with JavaScript off; with JavaScript it opens this
// <dialog> instead. showModal() keeps keyboard focus inside the dialog and
// makes Escape close it, with no code here. Hovering or focusing a project
// shows its poster behind the list. How it looks and animates is under
// "Menu" in app/globals.css.
export function Menu({ posters }: { posters: Record<Slug, string> }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [hovered, setHovered] = useState<Slug | null>(null);
  let i = 0; // counts the lines, so each can rise a moment after the last

  return (
    <>
      <Link
        href="/#projects"
        aria-haspopup="dialog"
        data-no-wipe
        className="inline-block py-2"
        onClick={(event) => {
          event.preventDefault();
          dialog.current?.showModal();
        }}
      >
        Menu
      </Link>

      <dialog
        ref={dialog}
        aria-label="Menu"
        className="menu"
        data-theme="ink"
        data-lenis-prevent
        // Choosing any link closes the menu.
        onClick={(event) => {
          if ((event.target as Element).closest("a")) dialog.current?.close();
        }}
        onClose={() => setHovered(null)}
      >
        {/* The hovered project's poster, filling the window behind the list. */}
        <div aria-hidden className="menu-poster">
          {hovered && (
            // A plain <img>: the posters are already small AVIF stills.
            // eslint-disable-next-line @next/next/no-img-element
            <img key={hovered} src={posters[hovered]} alt="" />
          )}
        </div>

        <div className="label flex items-center justify-between">
          <button
            type="button"
            className="py-2"
            onClick={() => dialog.current?.close()}
          >
            Close
          </button>
          <span className="sm:hidden">
            <Sound />
          </span>
        </div>

        <nav aria-label="Projects" className="my-auto py-12">
          <ol
            className="text-h2 flex flex-wrap gap-x-[0.35em] font-serif"
            onPointerLeave={() => setHovered(null)}
          >
            {projects.map((project, index) => (
              <li
                key={project.slug}
                style={{ "--i": i++ } as React.CSSProperties}
                data-dim={hovered !== null && hovered !== project.slug}
              >
                <Link
                  href={`/work/${project.slug}`}
                  className="menu-link"
                  onPointerEnter={() => setHovered(project.slug)}
                  onFocus={() => setHovered(project.slug)}
                >
                  {project.title}
                  <sup className="label ml-1 align-super">0{index + 1}</sup>
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          {/* About, Inquire and the résumé: big enough to find at a glance. */}
          <ul className="text-h3 flex flex-wrap gap-x-10 gap-y-2 font-serif">
            {[
              ["About", "/about"],
              ["Inquire", "/contact"],
              ["Résumé ↗", "/resume.pdf"],
            ].map(([label, href]) => (
              <li key={href} style={{ "--i": i++ } as React.CSSProperties}>
                <a href={href} className="inline-block py-1">
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <p className="label text-muted flex flex-wrap gap-x-8">
            <AnomalyCount />
            <span>© 2026 · designed &amp; built by Harsha</span>
          </p>
        </div>
      </dialog>
    </>
  );
}
