"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";
import type { Slug } from "@/content/projects";

const REDUCE = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(REDUCE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const motionAllowed = () => !window.matchMedia(REDUCE).matches;
const notOnServer = () => false;

// A project's looping video with its cover picture underneath. The picture is
// always there (and is all that visitors with reduced motion or no JavaScript
// get); the video is added on top once the browser says motion is fine.
export function LoopVideo({ slug }: { slug: Slug }) {
  const play = useSyncExternalStore(subscribe, motionAllowed, notOnServer);

  return (
    <div aria-hidden className="case-media">
      <Image
        src={`/media/cover-${slug}.avif`}
        unoptimized
        fetchPriority="high"
        alt=""
        width={1280}
        height={720}
        loading="eager"
        sizes="(min-width: 1024px) 62vw, 100vw"
      />
      {play && (
        <video autoPlay muted loop playsInline>
          <source src={`/media/case-${slug}.mp4`} type="video/mp4" />
          <source src={`/media/case-${slug}.webm`} type="video/webm" />
        </video>
      )}
    </div>
  );
}
