"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { projects, type Slug } from "@/content/projects";

// The full-screen menu. It is the browser's own <dialog>: opening it with
// showModal() keeps keyboard focus inside it and makes Escape close it,
// without any code here. How it looks and animates is under "Menu" in
// app/globals.css.
export function Menu() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [hovered, setHovered] = useState<Slug | null>(null);
  let i = 0; // counts the links, so each can rise a moment after the last

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        className="py-2"
        onClick={() => dialog.current?.showModal()}
      >
        Menu
      </button>

      <dialog
        ref={dialog}
        aria-label="Menu"
        className="menu"
        data-lenis-prevent
        // Choosing any link closes the menu.
        onClick={(event) => {
          if ((event.target as Element).closest("a")) dialog.current?.close();
        }}
      >
        <button
          type="button"
          className="text-label self-end py-2 font-mono"
          onClick={() => dialog.current?.close()}
        >
          Close
        </button>

        <nav aria-label="Menu" className="my-auto grid grid-cols-12 gap-x-4">
          <ul className="col-span-12 lg:col-span-7">
            <li style={{ "--i": i++ } as React.CSSProperties}>
              <Link href="/#work" className="text-title font-serif">
                Work
              </Link>
              <ul
                className="text-lead mt-2 mb-4 font-serif"
                onPointerLeave={() => setHovered(null)}
              >
                {projects.map((project) => (
                  <li
                    key={project.slug}
                    style={{ "--i": i++ } as React.CSSProperties}
                  >
                    <Link
                      href={`/work/${project.slug}`}
                      className="text-muted hover:text-fg focus-visible:text-fg inline-block py-1 transition-colors duration-150"
                      onPointerEnter={() => setHovered(project.slug)}
                      onFocus={() => setHovered(project.slug)}
                    >
                      {project.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            {[
              ["About", "/#about"],
              ["Contact", "/#contact"],
              ["Résumé", "/resume.pdf"],
            ].map(([label, href]) => (
              <li key={href} style={{ "--i": i++ } as React.CSSProperties}>
                <a href={href} className="text-title font-serif">
                  {label}
                </a>
              </li>
            ))}
          </ul>

          {/* The hovered project's symbol, on wide screens only. */}
          <div aria-hidden className="col-span-5 self-center max-lg:hidden">
            {hovered && (
              <Image
                key={hovered}
                src={`/media/cover-${hovered}.avif`}
                unoptimized
                alt=""
                width={1280}
                height={720}
                sizes="40vw"
                className="demo-in aspect-video w-full object-cover"
              />
            )}
          </div>
        </nav>
      </dialog>
    </>
  );
}
