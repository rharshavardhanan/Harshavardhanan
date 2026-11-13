"use client";

import Image from "next/image";
import { useRef, useState, useSyncExternalStore } from "react";
import { projects, type Slug } from "@/content/projects";

type View = "index" | "grid";
const KEY = "work-view";
const WIDE = "(min-width: 1024px)";

// The chosen view is kept in the browser's localStorage so it is remembered
// on the next visit. Until a visitor chooses, wide screens get the list and
// phones get the grid. try/catch: storage can be blocked (private windows).
function readView(): View {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "index" || saved === "grid") return saved;
  } catch {}
  return window.matchMedia(WIDE).matches ? "index" : "grid";
}

function subscribe(onChange: () => void) {
  window.addEventListener(KEY, onChange);
  return () => window.removeEventListener(KEY, onChange);
}

function saveView(view: View) {
  try {
    localStorage.setItem(KEY, view);
  } catch {}
  window.dispatchEvent(new Event(KEY));
}

// Tells the particle object which project is being pointed at.
function preview(slug: Slug | null) {
  if (slug) document.documentElement.dataset.preview = slug;
  else delete document.documentElement.dataset.preview;
}

export function WorkIndex() {
  // The server always sends the list; the browser then applies the real choice.
  const view = useSyncExternalStore(subscribe, readView, () => "index" as View);
  const [hovered, setHovered] = useState<Slug | null>(null);
  const float = useRef<HTMLDivElement>(null);

  const point = (slug: Slug | null) => {
    setHovered(slug);
    preview(slug);
  };

  return (
    <section
      id="work"
      aria-labelledby="work-title"
      className="px-gutter grid grid-cols-12 gap-x-4 pt-24 pb-32"
    >
      <div className="col-span-12 flex flex-wrap items-end justify-between gap-4 lg:col-span-8">
        <h2 id="work-title" data-reveal className="text-title">
          Selected work
        </h2>
        <div
          role="group"
          aria-label="How to show the work"
          className="text-label flex font-mono"
        >
          {(["index", "grid"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={view === option}
              onClick={() => saveView(option)}
              className="border-line aria-pressed:bg-fg aria-pressed:text-bg border px-3 py-2 uppercase transition-colors duration-150 not-first:border-l-0"
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {view === "index" ? (
        <ol
          className="border-line col-span-12 mt-10 border-t lg:col-span-8"
          onPointerMove={(event) => {
            // The preview follows the pointer; set directly so it never lags.
            float.current?.style.setProperty(
              "transform",
              `translate(${event.clientX + 24}px, ${event.clientY + 24}px)`,
            );
          }}
          onPointerLeave={() => point(null)}
        >
          {projects.map((project, index) => (
            <li key={project.slug} className="border-line border-b">
              <a
                href={`#${project.slug}`}
                onPointerEnter={() => point(project.slug)}
                onFocus={() => point(project.slug)}
                onBlur={() => point(null)}
                className="group grid grid-cols-8 items-baseline gap-x-4 py-5 no-underline"
              >
                <span className="text-label text-muted col-span-1 font-mono">
                  0{index + 1}
                </span>
                <span className="col-span-7 md:col-span-4">
                  <span className="text-title block font-serif transition-transform duration-300 ease-out group-hover:translate-x-2 group-focus-visible:translate-x-2 motion-reduce:transition-none">
                    {project.title}
                  </span>
                </span>
                <span className="text-label text-muted col-span-7 col-start-2 mt-2 font-mono md:col-span-3 md:col-start-auto md:mt-0">
                  {[project.role, project.year].filter(Boolean).join(" · ")}
                  <span className="block">{project.tags.join(" · ")}</span>
                </span>
              </a>
            </li>
          ))}
        </ol>
      ) : (
        <ul className="col-span-12 mt-10 grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:col-span-8">
          {projects.map((project) => (
            <li key={project.slug}>
              <a href={`#${project.slug}`} className="block no-underline">
                <Image
                  src={`/media/cover-${project.slug}.avif`}
                  alt=""
                  width={1280}
                  height={720}
                  sizes="(min-width: 1024px) 32vw, (min-width: 640px) 50vw, 100vw"
                  className="aspect-video w-full object-cover"
                />
                <span className="text-lead mt-3 block font-serif">
                  {project.title}
                </span>
                <span className="text-label text-muted block font-mono">
                  {[project.role, project.year].filter(Boolean).join(" · ")}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}

      {/* The small moving preview beside the pointer. Mouse only, and not for
          visitors who asked for reduced motion (see .work-float in globals.css). */}
      <div ref={float} aria-hidden className="work-float">
        {hovered && view === "index" && (
          <video
            key={hovered}
            autoPlay
            muted
            loop
            playsInline
            poster={`/media/cover-${hovered}.avif`}
            className="size-full object-cover"
          >
            <source src={`/media/case-${hovered}.mp4`} type="video/mp4" />
            <source src={`/media/case-${hovered}.webm`} type="video/webm" />
          </video>
        )}
      </div>
    </section>
  );
}
