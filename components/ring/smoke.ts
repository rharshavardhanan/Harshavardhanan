// The background behind the home ring: its own canvas, behind the ring's
// (app/globals.css, .bg-canvas), drawn by the SMOKE shader in shaders.ts as a
// dark, glossy, oily surface that the cursor drags. It runs its own cursor
// trail (trail.ts): one WebGL context cannot read another's pictures. The
// picture is soft, so it is drawn at half the screen's resolution and
// stretched: a quarter of the pixels to work out.

import { FULLSCREEN, SMOKE } from "./shaders";
import { createTrail, type TrailStep } from "./trail";
import { build, dropShape, type Program, shape, WHOLE_WINDOW } from "./webgl";

const LOOK = {
  distortion: 2, // how much the surface folds at rest
  speedDistortion: 1.5, // how much more while the ring turns fast
  relief: 18, // how deep the folds look (lower, towards 10, is softer)
  resolution: 0.5, // half the screen's pixels
  // Added grain (shaders.ts, addGrain): the surface never reaches pure black.
  grain: { amount: 0.035, size: 1, fps: 24 },
  // A bigger, slower trail than the ring's: the oil drags behind the cursor
  // and settles over about a second and a half.
  trail: { brushSize: 0.12, brushStrength: 0.9, decay: 0.965 },
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
  };

  return {
    draw,
    destroy: () => {
      trail.destroy();
      dropShape(gl, screen);
      gl.deleteProgram(program.program);
    },
  };
}
