"use client";

import { useEffect, useRef, useState } from "react";

export type Clip = {
  src: string;
  /** What this clip is, e.g. "Cheap policy alone". */
  title: string;
  /** How it ends, e.g. "Fails". */
  outcome: string;
  /** True if it ends well (shown in the accent colour). */
  good: boolean;
  /** One line on what happens. Also read out by screen readers. */
  note: string;
};

// Several recordings that play side by side, together, under one control,
// so the same moment can be compared across them. They start on their own
// when scrolled into view, except for visitors who asked for reduced motion,
// who press Play. They play once and stop; "Play again" restarts all of them.
export function SyncedClips({ clips }: { clips: Clip[] }) {
  const box = useRef<HTMLDivElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const [state, setState] = useState<"ready" | "playing" | "paused" | "ended">(
    "ready",
  );

  const all = () => videos.current.filter(Boolean) as HTMLVideoElement[];

  const play = (fromStart: boolean) => {
    for (const video of all()) {
      if (fromStart) video.currentTime = 0;
      void video.play().catch(() => {});
    }
    setState("playing");
  };
  const pause = () => {
    all().forEach((video) => video.pause());
    setState("paused");
  };

  // Start on its own the first time it is well into view.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        play(true);
      },
      { threshold: 0.5 },
    );
    observer.observe(box.current!);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When every clip has finished, offer to play them again.
  const onEnded = () => {
    if (all().every((video) => video.ended)) setState("ended");
  };

  const label =
    state === "playing" ? "Pause" : state === "ended" ? "Play again" : "Play";

  return (
    <div ref={box}>
      <ul className="grid gap-x-4 gap-y-10 md:grid-cols-3">
        {clips.map((clip, index) => (
          <li key={clip.src}>
            <div
              className="overflow-hidden rounded-lg bg-[#0b0b0b]"
              data-cursor="Play"
            >
              <video
                ref={(el) => {
                  videos.current[index] = el;
                }}
                muted
                playsInline
                preload="metadata"
                onEnded={onEnded}
                aria-label={`${clip.title}: ${clip.note}`}
                className="aspect-video w-full object-cover"
              >
                <source src={clip.src} type="video/mp4" />
              </video>
            </div>
            <p className="label mt-4 flex justify-between gap-4">
              <span>{clip.title}</span>
              <span className={clip.good ? "text-accent" : "text-muted"}>
                {clip.outcome}
              </span>
            </p>
            <p className="text-muted mt-2">{clip.note}</p>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="btn label mt-10"
        onClick={() =>
          state === "playing" ? pause() : play(state !== "paused")
        }
      >
        {label}
      </button>
    </div>
  );
}
