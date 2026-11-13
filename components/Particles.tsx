"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { parseColor } from "@/lib/color";
import { COUNT, type ShapeName, shape } from "@/lib/shapes";

declare global {
  interface Window {
    /** Set by scripts/record-hero.mjs to step the animation frame by frame. */
    __particleTime?: number;
  }
}

const LOOP = 8; // seconds; the idle drift repeats exactly, so it records as a seamless loop
const CAMERA = { position: [0, 0, 5] as [number, number, number], fov: 30 };
const VIEW = Math.tan((15 * Math.PI) / 180) * 5; // half of what the camera sees, in scene units
const REACH = 0.45; // how close the pointer must be to push a point
const PUSH = 0.16; // how far it pushes

// Which shapes a theme shows, in order. Anything not listed shows the cloud.
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

function Swarm({ onShape }: { onShape: (name: ShapeName) => void }) {
  const canvas = useThree((state) => state.gl.domElement);
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.PointsMaterial>(null);
  const goal = useRef(shape("cloud")); // the shape the points are heading for
  const pointer = useRef({ x: 99, y: 99 }); // far away until the mouse moves
  const frame = useRef({ last: 0, drift: 0.05 });

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

    const show = (name: ShapeName) => {
      goal.current = shape(name);
      onShape(name);
    };

    // Runs now, and whenever the page's theme or loading state changes.
    const sync = () => {
      window.clearTimeout(timer);
      if (html.dataset.loading === "in") return show("dot");
      // A project being hovered in the work index (data-preview) wins over
      // the chapter on screen (data-theme).
      const name = html.dataset.preview ?? html.dataset.theme ?? "";
      const [first, second] = SEQUENCE[name] ?? ["cloud"];
      show(first);
      if (second) timer = window.setTimeout(() => show(second), 1600);
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
      attributeFilter: ["data-theme", "data-loading", "data-preview"],
    });
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [canvas, onShape]);

  // Runs once per screen refresh.
  useFrame((state) => {
    const cloud = points.current;
    if (!cloud || !material.current) return;

    const time = window.__particleTime ?? state.clock.elapsedTime;
    const dt = Math.min(Math.max(time - frame.current.last, 0), 0.05);
    frame.current.last = time;

    const target = goal.current;
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

      // ...pushed aside if the pointer is close.
      const dx = x - px;
      const dy = y - py;
      const distance = Math.hypot(dx, dy);
      if (distance < REACH) {
        const force = (1 - distance / REACH) ** 2 * PUSH;
        x += (dx / (distance || 1)) * force;
        y += (dy / (distance || 1)) * force;
      }

      // Close a fraction of the gap. Each point has its own pace, so a change
      // of shape arrives as a wave, and it can never overshoot.
      const k = 1 - Math.exp(-dt * (2 + 4 * seed));
      now[j] += (x - now[j]) * k;
      now[j + 1] += (y - now[j + 1]) * k;
      now[j + 2] += (z - now[j + 2]) * k;
    }
    attribute.needsUpdate = true;

    // A slow sway of the whole object.
    cloud.rotation.y = 0.22 * Math.sin(wave);
    cloud.rotation.x = 0.06 * Math.cos(wave);

    // Take the colour from the page's theme, so it fades in step with it.
    const accent = getComputedStyle(document.documentElement).getPropertyValue(
      "--accent",
    );
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
        size={0.034}
        sizeAttenuation
        transparent
        opacity={0.8}
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

  const onShape = useCallback((name: ShapeName) => {
    if (wrap.current) wrap.current.dataset.shape = name;
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
        <Swarm onShape={onShape} />
      </Canvas>
    </div>
  );
}
