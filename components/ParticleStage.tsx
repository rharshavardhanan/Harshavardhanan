"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState, useSyncExternalStore } from "react";

// three.js is large, so it is fetched only when the live object will be
// shown, and only after the page has first been drawn.
const Particles = dynamic(() => import("./Particles"), { ssr: false });

// What the stage shows:
//   "poster"     a still image (the server's answer, and reduced motion's)
//   "video"      the looping video (phones, tablets, no WebGL)
//   "particles"  the live object (desktop)
type Mode = "poster" | "video" | "particles";

const WIDE = "(min-width: 1024px)";
const REDUCE = "(prefers-reduced-motion: reduce)";

let webgl: boolean | undefined;
function hasWebGL() {
  if (webgl === undefined) {
    const canvas = document.createElement("canvas");
    webgl = !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  }
  return webgl;
}

function subscribe(onChange: () => void) {
  const queries = [WIDE, REDUCE].map((query) => window.matchMedia(query));
  queries.forEach((query) => query.addEventListener("change", onChange));
  return () =>
    queries.forEach((query) => query.removeEventListener("change", onChange));
}

function getMode(): Mode {
  if (window.matchMedia(REDUCE).matches) return "poster";
  return window.matchMedia(WIDE).matches && hasWebGL() ? "particles" : "video";
}

const getServerMode = (): Mode => "poster";

export function ParticleStage() {
  const mode = useSyncExternalStore(subscribe, getMode, getServerMode);
  const [drawn, setDrawn] = useState(false); // the live object has drawn a frame
  const live = mode === "particles" && drawn;

  return (
    // The still and the video have a white background. "multiply" blending
    // makes white vanish into whatever colour the page is.
    <div
      aria-hidden
      data-mode={mode}
      className={`stage ${live ? "" : "mix-blend-multiply"}`}
    >
      <div className="stage-box">
        {!live && (
          <Image
            src="/media/hero-poster.avif"
            alt=""
            width={720}
            height={720}
            loading="eager"
            sizes="(min-width: 1024px) 34vw, 100vw"
            className="absolute inset-0 size-full object-cover"
          />
        )}
        {mode === "video" && (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 size-full object-cover"
          >
            {/* MP4 first: for this footage it is the smaller file. */}
            <source src="/media/hero-loop.mp4" type="video/mp4" />
            <source src="/media/hero-loop.webm" type="video/webm" />
          </video>
        )}
        {mode === "particles" && <Particles onReady={() => setDrawn(true)} />}
      </div>
    </div>
  );
}
