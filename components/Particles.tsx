"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { parseColor } from "@/lib/color";
import { COUNT, type ShapeName, shape } from "@/lib/shapes";

declare global {
  interface Window {
    /** Set by the recording scripts to step the animation frame by frame. */
    __particleTime?: number;
  }
}

const LOOP = 8; // seconds; the idle drift repeats exactly, so it records as a seamless loop
const CAMERA = { position: [0, 0, 5] as [number, number, number], fov: 30 };
const VIEW = Math.tan((15 * Math.PI) / 180) * 5; // half of what the camera sees, in scene units
const REACH = 0.55; // how close the pointer must be to push a point (about 120px)
const PUSH = 0.42; // how hard it pushes

// Which shapes each part of the page shows, in order. Anything else: the cloud.
const SEQUENCE: Record<string, ShapeName[]> = {
  odovox: ["waveform", "tooth"],
  road: ["road"],
  kattral: ["tiles"],
  cache: ["blocks"],
  hallucination: ["bubble"],
};

// One fixed random number (0 to 1) per point, used to vary its speed and drift.
const seeds = new Float32Array(COUNT);
for (let i = 0, s = 99; i < COUNT; i++) {
  s = (s * 16807) % 2147483647;
  seeds[i] = s / 2147483647;
}

// The cloud thrown outwards: where the points fly to when the loader ends.
let burst: Float32Array | undefined;
const burstShape = () => (burst ??= shape("cloud").map((n) => n * 2.6));

type Info = { shape: string; theme: string };

function Swarm({ onChange }: { onChange: (info: Info) => void }) {
  const canvas = useThree((state) => state.gl.domElement);
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.PointsMaterial>(null);
  const goal = useRef(shape("cloud")); // the shape the points are heading for
  const pointer = useRef({ x: 99, y: 99 }); // far away until the mouse moves
  const frame = useRef({ last: 0, drift: 0.05 });

  // How fast each point is moving now (three numbers per point).
  const velocity = useRef<Float32Array | null>(null);

  const { start, sprite } = useMemo(() => {
    // During the loader the object begins as a dot; otherwise as the cloud.
    const loading = document.documentElement.dataset.loading !== undefined;
    // A soft round dot, drawn once and used for every point.
    const dot = document.createElement("canvas");
    dot.width = dot.height = 64;
    const ctx = dot.getContext("2d")!;
    const glow = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    glow.addColorStop(0, "white");
    glow.addColorStop(0.35, "white");
    glow.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 64, 64);
    return {
      start: shape(loading ? "dot" : "cloud").slice(),
      sprite: new THREE.CanvasTexture(dot),
    };
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    let timer = 0;
    let wasLoading = html.dataset.loading === "in";

    const show = (name: ShapeName | "burst", theme: string) => {
      goal.current = name === "burst" ? burstShape() : shape(name);
      onChange({ shape: name, theme });
    };

    // Runs now, and whenever the page says something has changed.
    const sync = () => {
      window.clearTimeout(timer);
      if (html.dataset.loading === "in") {
        wasLoading = true;
        return show("dot", "neutral");
      }
      // A project being pointed at in the work index (data-preview) wins
      // over the part of the page on screen (data-active).
      const name = html.dataset.preview ?? html.dataset.active ?? "";
      const [first, second] = SEQUENCE[name] ?? ["cloud"];
      const theme = name in SEQUENCE ? name : "neutral";
      if (wasLoading) {
        // The loader has just finished: fling the points out, then let them
        // fall back into the sphere.
        wasLoading = false;
        show("burst", theme);
        timer = window.setTimeout(() => show(first, theme), 320);
        return;
      }
      show(first, theme);
      if (second) timer = window.setTimeout(() => show(second, theme), 1600);
    };

    // Where the pointer is, in the same units as the shapes.
    const onMove = (event: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      pointer.current.x =
        (((event.clientX - box.left) / box.width) * 2 - 1) * VIEW;
      pointer.current.y =
        -(((event.clientY - box.top) / box.height) * 2 - 1) * VIEW;
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(html, {
      attributes: true,
      attributeFilter: ["data-active", "data-loading", "data-preview"],
    });
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [canvas, onChange]);

  // Runs once per screen refresh.
  useFrame((state) => {
    const cloud = points.current;
    if (!cloud || !material.current) return;

    const time = window.__particleTime ?? state.clock.elapsedTime;
    const dt = Math.min(Math.max(time - frame.current.last, 0), 0.05);
    frame.current.last = time;

    const target = goal.current;
    const speed = (velocity.current ??= new Float32Array(COUNT * 3));
    const attribute = cloud.geometry.attributes
      .position as THREE.BufferAttribute;
    const now = attribute.array as Float32Array;
    const wave = (Math.PI * 2 * time) / LOOP;

    // The cloud drifts freely; a symbol holds its shape and only shimmers.
    const wanted = target === shape("cloud") ? 0.05 : 0.012;
    frame.current.drift +=
      (wanted - frame.current.drift) * (1 - Math.exp(-dt * 2));
    const drift = frame.current.drift;
    const { x: px, y: py } = pointer.current;

    for (let i = 0; i < COUNT; i++) {
      const j = i * 3;
      const seed = seeds[i];
      const phase = seed * Math.PI * 2;

      // Where this point wants to be: its place in the shape, plus a slow drift...
      let x = target[j] + drift * Math.sin(wave + phase);
      let y = target[j + 1] + drift * Math.cos(wave * 2 + phase * 1.7);
      const z = target[j + 2] + drift * Math.sin(wave + phase * 2.3);

      // ...thrown aside if the pointer is close.
      const dx = x - px;
      const dy = y - py;
      const distance = Math.hypot(dx, dy);
      if (distance < REACH) {
        const force = (1 - distance / REACH) ** 2 * PUSH;
        x += (dx / (distance || 1)) * force;
        y += (dy / (distance || 1)) * force;
      }

      // Each point is on a spring: it is pulled toward where it wants to be,
      // overshoots a little and settles. Stiffer springs (higher `pull`) get
      // there sooner, so a change of shape arrives as a wave.
      const pull = 55 + 85 * seed;
      const drag = 2 * Math.sqrt(pull) * 0.62; // under 1 = a little bounce
      speed[j] += ((x - now[j]) * pull - speed[j] * drag) * dt;
      speed[j + 1] += ((y - now[j + 1]) * pull - speed[j + 1] * drag) * dt;
      speed[j + 2] += ((z - now[j + 2]) * pull - speed[j + 2] * drag) * dt;
      now[j] += speed[j] * dt;
      now[j + 1] += speed[j + 1] * dt;
      now[j + 2] += speed[j + 2] * dt;
    }
    attribute.needsUpdate = true;

    // A slow sway of the whole object.
    cloud.rotation.y = 0.22 * Math.sin(wave);
    cloud.rotation.x = 0.06 * Math.cos(wave);

    // Take the colour from the theme the object has been given (see
    // data-theme on its wrapper below), so it fades when the theme changes.
    const accent = getComputedStyle(canvas).getPropertyValue("--accent");
    const [r, g, b] = parseColor(accent);
    material.current.color.setRGB(r, g, b, THREE.SRGBColorSpace);
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[start, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={material}
        map={sprite}
        size={0.03}
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </points>
  );
}

export default function Particles({ onReady }: { onReady: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(true);

  // Stop drawing while the object is scrolled out of view.
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) =>
      setOnScreen(entry.isIntersecting),
    );
    observer.observe(wrap.current!);
    return () => observer.disconnect();
  }, []);

  // Records the current shape and theme on the wrapper: the theme gives the
  // object its colour, and both can be read by tests and the recorders.
  const onChange = useCallback((info: Info) => {
    if (!wrap.current) return;
    wrap.current.dataset.shape = info.shape;
    wrap.current.dataset.theme = info.theme;
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        flat
        frameloop={onScreen ? "always" : "never"}
        dpr={[1, 2]}
        camera={CAMERA}
        gl={{ antialias: false, alpha: true }}
        style={{ pointerEvents: "none" }}
        onCreated={onReady}
      >
        <Swarm onChange={onChange} />
      </Canvas>
    </div>
  );
}
