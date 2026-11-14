"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { projects, type Slug } from "@/content/projects";
import type { Media } from "@/lib/media";
import { MediaView } from "./MediaView";

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

// The grid's layout: how many of the 12 columns each cover takes, in order.
// Two side by side (7 + 5), two the other way round (5 + 7), then one across.
const SPANS = [
  "lg:col-span-7",
  "lg:col-span-5",
  "lg:col-span-5",
  "lg:col-span-7",
  "lg:col-span-12",
];

export function WorkIndex({ media }: { media: Record<Slug, Media> }) {
  // The server always sends the list; the browser then applies the real choice.
  const view = useSyncExternalStore(subscribe, readView, () => "index" as View);
  const [hovered, setHovered] = useState<Slug | null>(null);
  const float = useRef<HTMLDivElement>(null);
  const follow = useRef<{ x: (v: number) => void; y: (v: number) => void }>(
    null,
  );

  // The preview trails the pointer: each move sets a new target, and GSAP
  // glides it there over 0.6s, so it lags behind softly ("lerp").
  // GSAP is fetched the first time a pointer moves over the list, so phones
  // (which never send that) never download it for this.
  const loading = useRef(false);
  const loadFollow = () => {
    const el = float.current;
    if (loading.current || !el) return;
    loading.current = true;
    void import("gsap").then(({ gsap }) => {
      // Centre it on the pointer. (Set here, not with a CSS class, because
      // GSAP would add a CSS offset to its own and apply it twice.)
      gsap.set(el, { xPercent: -50, yPercent: -50 });
      follow.current = {
        x: gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" }),
        y: gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" }),
      };
    });
  };

  const point = (slug: Slug | null) => {
    setHovered(slug);
    preview(slug);
  };

  return (
    <section
      id="work"
      data-zone="index"
      aria-labelledby="work-title"
      className="paint relative pt-40 pb-40"
    >
      {/* While a project is pointed at, the section takes a tint of its colour. */}
      <div
        aria-hidden
        data-theme={hovered ?? "neutral"}
        className="bg-bg absolute inset-0 -z-[1] opacity-0 transition-opacity duration-700 data-[on=true]:opacity-[0.07]"
        data-on={!!hovered}
      />

      <div className="px-gutter flex flex-wrap items-end justify-between gap-6">
        <h2 id="work-title" data-lines className="text-h2">
          Selected work
        </h2>
        <div
          role="group"
          aria-label="How to show the work"
          className="label flex gap-6"
        >
          {(["index", "grid"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={view === option}
              onClick={() => saveView(option)}
              className="text-muted aria-pressed:text-fg py-2 underline decoration-transparent underline-offset-8 transition-colors aria-pressed:decoration-current"
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {view === "index" ? (
        <ol
          className="group/list mt-16"
          onPointerMove={(event) => {
            loadFollow();
            follow.current?.x(event.clientX);
            follow.current?.y(event.clientY);
          }}
          onPointerLeave={() => point(null)}
        >
          {projects.map((project, index) => (
            <li
              key={project.slug}
              className="border-line border-t last:border-b"
            >
              <a
                href={`#${project.slug}`}
                data-cursor="View"
                onPointerEnter={() => point(project.slug)}
                onFocus={() => point(project.slug)}
                onBlur={() => point(null)}
                className="px-gutter group/row grid grid-cols-12 items-baseline gap-x-4 py-6 no-underline transition-opacity duration-500 group-has-[a:hover]/list:opacity-30 hover:!opacity-100 lg:py-8"
              >
                <span className="text-h2 col-span-12 font-serif transition-transform duration-700 ease-[var(--ease-out)] group-hover/row:translate-x-4 lg:col-span-8 motion-reduce:transition-none">
                  {project.title}
                </span>
                <span className="label text-muted col-span-12 mt-3 flex justify-between gap-4 lg:col-span-4 lg:mt-0">
                  <span>
                    {[project.role, project.year].filter(Boolean).join(" · ")}
                  </span>
                  <span>0{index + 1}</span>
                </span>
              </a>
            </li>
          ))}
        </ol>
      ) : (
        <ul className="px-gutter mt-16 grid grid-cols-12 gap-x-4 gap-y-16">
          {projects.map((project, index) => (
            <li key={project.slug} className={`col-span-12 ${SPANS[index]}`}>
              <a
                href={`#${project.slug}`}
                data-cursor="View"
                className="block no-underline"
              >
                <div className="overflow-hidden">
                  <div data-scale-in>
                    <MediaView
                      media={media[project.slug]}
                      alt={`${project.title}: screenshot`}
                      sizes={
                        index === 4
                          ? "100vw"
                          : "(min-width: 1024px) 58vw, 100vw"
                      }
                      className={index === 4 ? "aspect-[21/9]" : "aspect-[4/3]"}
                    />
                  </div>
                </div>
                <span className="mt-5 flex items-baseline justify-between gap-4">
                  <span className="text-h3 font-serif">{project.title}</span>
                  <span className="label text-muted">0{index + 1}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}

      {/* The preview that trails the pointer over the list. Mouse only, and
          not for visitors who asked for reduced motion. */}
      <div
        ref={float}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-40 hidden w-[26rem] [@media(hover:hover)_and_(pointer:fine)_and_(prefers-reduced-motion:no-preference)]:block"
      >
        {view === "index" &&
          projects.map((project) => (
            <MediaView
              key={project.slug}
              media={media[project.slug]}
              alt=""
              sizes="26rem"
              className={`aspect-[4/3] transition-[opacity,scale] duration-500 ease-[var(--ease-out)] ${
                hovered === project.slug
                  ? "scale-100 opacity-100"
                  : "absolute inset-0 scale-90 opacity-0"
              }`}
            />
          ))}
      </div>
    </section>
  );
}
