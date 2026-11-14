// The background behind the home ring: its own canvas, behind the ring's
// (app/globals.css, .bg-canvas), drawn by the SMOKE shader in shaders.ts as a
// dark, glossy, oily surface that the cursor drags. It runs its own cursor
// trail (trail.ts): one WebGL context cannot read another's pictures. The
// picture is soft, so it is drawn at half the screen's resolution and
// stretched: a quarter of the pixels to work out.
//
// Over the oil, in a second pass, the motes: faint dots of light drifting in
// the dark (MOTE_VERTEX, MOTE_FRAGMENT; where they start: lib/motes.ts).

import { MOTE, scatter } from "@/lib/motes";
import { FULLSCREEN, MOTE_FRAGMENT, MOTE_VERTEX, SMOKE } from "./shaders";
import { createTrail, type TrailStep } from "./trail";
import { build, dropShape, type Program, shape, WHOLE_WINDOW } from "./webgl";

const LOOK = {
  distortion: 2, // how much the surface folds at rest
  speedDistortion: 1.5, // how much more while the ring turns fast
  relief: 18, // how deep the folds look (lower, towards 10, is softer)
  resolution: 0.5, // half the screen's pixels
  // Added grain (shaders.ts, addGrain), ±0.0125 around the surface's value:
  // enough to keep it filmic, little enough that the blacks stay deep.
  grain: { amount: 0.025, size: 1, fps: 24 },
  // A bigger, slower trail than the ring's: the oil drags behind the cursor
  // and settles over about a second and a half.
  trail: { brushSize: 0.12, brushStrength: 0.9, decay: 0.965 },
  motes: { desktop: 400, phone: 150 }, // how many
};

export type SmokeFrame = {
  /** Seconds since the ring started. */
  time: number;
  /** How fast the ring is turning, 0 to 1. */
  speed: number;
  /** The pointer, -0.5..0.5 from the middle, eased. */
  lean: [number, number];
  /** The pointer and its movement this frame, for the trail. */
  trail: TrailStep;
  /** How far the ring has turned, in panels (the motes' parallax). */
  turn: number;
  /** Seconds since the latest scroll began (the motes' shimmer wave). */
  wave: number;
  /** Half the centre panel's size, as shares of the window (no motes on it). */
  panel: [number, number];
  /** True when the ring runs up and down. */
  vertical: boolean;
};

export type Smoke = { draw(frame: SmokeFrame): void; destroy(): void };

/** Sets up the background on its canvas. Returns null if the browser cannot. */
export function createSmoke(
  canvas: HTMLCanvasElement,
  phone: boolean,
): Smoke | null {
  const gl = canvas.getContext("webgl2", { alpha: false, antialias: false });
  if (!gl) return null;
  let program: Program;
  let trail: ReturnType<typeof createTrail>;
  try {
    program = build(gl, FULLSCREEN, SMOKE);
    trail = createTrail(gl, LOOK.trail);
  } catch {
    return null;
  }
  const screen = shape(gl, WHOLE_WINDOW);

  // The motes: a program, and their starting numbers in one buffer on the
  // graphics card (five per mote: x, y, depth and phase in slot 0, the
  // twinkle rate in slot 1). They are a nicety: if they cannot be built, the
  // oil still runs without them (and the canvas does not say data-motes).
  const count = phone ? LOOK.motes.phone : LOOK.motes.desktop;
  let motes: Program | null = null;
  const moteVao = gl.createVertexArray()!;
  const moteBuffer = gl.createBuffer()!;
  try {
    motes = build(gl, MOTE_VERTEX, MOTE_FRAGMENT);
    gl.bindVertexArray(moteVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, moteBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, scatter(count), gl.STATIC_DRAW);
    const stride = MOTE * 4; // bytes from one mote to the next
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 1, gl.FLOAT, false, stride, 16);
    gl.bindVertexArray(null);
    canvas.dataset.motes = String(count);
  } catch {
    motes = null;
  }

  const draw = (f: SmokeFrame) => {
    if (!canvas.clientWidth) return; // not on screen yet
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5) * LOOK.resolution;
    const width = Math.round(canvas.clientWidth * ratio);
    const height = Math.round(canvas.clientHeight * ratio);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    trail.step(canvas.clientWidth, canvas.clientHeight, f.trail);

    gl.viewport(0, 0, width, height);
    gl.useProgram(program.program);
    gl.bindVertexArray(screen.vao);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, trail.texture());
    const at = program.at;
    gl.uniform1i(at("uTrail"), 1);
    gl.uniform2f(at("uRes"), width, height);
    gl.uniform1f(at("uTime"), f.time);
    gl.uniform1f(
      at("uDistortion"),
      LOOK.distortion + f.speed * LOOK.speedDistortion,
    );
    gl.uniform2f(at("uMouse"), f.lean[0], f.lean[1]);
    gl.uniform1f(at("uRelief"), LOOK.relief);
    gl.uniform1i(at("uOctaves"), phone ? 3 : 4);
    gl.uniform1f(at("uGrainAmount"), LOOK.grain.amount);
    gl.uniform1f(at("uGrainSize"), LOOK.grain.size);
    gl.uniform1f(at("uGrainFps"), LOOK.grain.fps);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (!motes) return;
    // Additive blending: each mote's colour, times its alpha, is ADDED to
    // the pixel already there (blendFunc(SRC_ALPHA, ONE): "take the new
    // colour × its alpha, plus the old colour × 1"). Light adds up, so motes
    // only ever brighten the dark; where two overlap they glow more.
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.useProgram(motes.program);
    gl.bindVertexArray(moteVao);
    const m = motes.at;
    gl.uniform1i(m("uTrail"), 1); // the trail, still on texture slot 1
    gl.uniform2f(m("uRes"), width, height);
    gl.uniform1f(m("uTime"), f.time);
    gl.uniform1f(m("uTurn"), f.turn);
    gl.uniform1f(m("uVertical"), f.vertical ? 1 : 0);
    gl.uniform1f(m("uWave"), Math.min(f.wave, 99));
    gl.uniform2f(m("uPanel"), f.panel[0], f.panel[1]);
    gl.uniform1f(m("uPointScale"), width / canvas.clientWidth);
    gl.drawArrays(gl.POINTS, 0, count);
    gl.disable(gl.BLEND);
  };

  return {
    draw,
    destroy: () => {
      trail.destroy();
      gl.deleteVertexArray(moteVao);
      gl.deleteBuffer(moteBuffer);
      if (motes) gl.deleteProgram(motes.program);
      dropShape(gl, screen);
      gl.deleteProgram(program.program);
    },
  };
}
