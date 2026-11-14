"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  ViewTransition,
} from "react";
import type { Film as FilmFiles } from "@/lib/media";

const REDUCE = "(prefers-reduced-motion: reduce)";
function subscribe(onChange: () => void) {
  const query = window.matchMedia(REDUCE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const motionAllowed = () => !window.matchMedia(REDUCE).matches;
const notOnServer = () => false;

/** Where the home ring's film had got to, handed over when its panel opened
 *  this page (see components/ring/Ring.tsx), so the film carries on. */
export const FILM_TIME = "film-time";

// A project's film across the whole window, behind the page's opening.
//
// It shares a name with the home ring's canvas (film-<slug>): when the middle
// panel grows to fill the window and the page changes, the browser treats the
// two as one object (a "view transition"), so the film never cuts. It also
// picks up the film where the ring left it.
//
// The poster is always there (it is all you get without JavaScript). The film
// plays over it when motion is allowed; with reduced motion there is a Play
// button instead.
export function Film({
  slug,
  film,
  title,
}: {
  slug: string;
  film: FilmFiles;
  title: string;
}) {
  const auto = useSyncExternalStore(subscribe, motionAllowed, notOnServer);
  const [asked, setAsked] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const play = auto || asked;

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    try {
      const saved = JSON.parse(sessionStorage.getItem(FILM_TIME) ?? "null");
      sessionStorage.removeItem(FILM_TIME);
      if (saved?.slug === slug) {
        const seek = () => (el.currentTime = saved.time);
        if (el.readyState >= 1) seek();
        else el.addEventListener("loadedmetadata", seek, { once: true });
      }
    } catch {}
    // A film out of sight does not need to play. (Films are never heard:
    // the site's only sound is the scroll tick, lib/sound.ts.)
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.play().catch(() => {});
      else el.pause();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [slug, play]);

  return (
    <ViewTransition name={`film-${slug}`} share="film-morph" default="none">
      <div data-film data-tone="media" className="film">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={film.poster} alt="" fetchPriority="high" />
        {play && (
          <video
            ref={video}
            src={film.src}
            poster={film.poster}
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            aria-label={`${title}: ${film.ai ? "AI-generated mood film" : "the project's particle animation"}`}
          />
        )}
        {/* Darkens the film a little, so words over it stay readable. */}
        <div aria-hidden className="film-dim" />
        {!play && (
          <button
            type="button"
            className="film-play label"
            onClick={() => setAsked(true)}
          >
            Play the film
          </button>
        )}
        {film.ai && <p className="film-ai label">AI-generated film</p>}
      </div>
    </ViewTransition>
  );
}
