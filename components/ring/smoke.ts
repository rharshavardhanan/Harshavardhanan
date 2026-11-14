// The oily smoke behind the home ring: its own canvas, behind the ring's
// (app/globals.css, .bg-canvas), drawn by the SMOKE shader in shaders.ts.
// The picture is soft anyway, so it is drawn at half the screen's
// resolution and stretched: a quarter of the pixels to work out.

import { build, shape } from "./gl";
import { FULLSCREEN, SMOKE } from "./shaders";

const LOOK = {
  distortion: 2, // how "oily" the folding is at rest
  speedDistortion: 1.5, // how much more while the ring turns fast
  resolution: 0.5, // half the screen's pixels
  grain: { amount: 0.045, size: 1, fps: 24, shadows: 0.6 },
};

export type SmokeFrame = {
  /** Seconds since the ring started. */
  time: number;
  /** How fast the ring is turning, 0 to 1. */
  speed: number;
  /** The pointer, -0.5..0.5 from the middle, eased. */
  mouse: [number, number];
};

export type Smoke = { draw(frame: SmokeFrame): void; destroy(): void };

/** Sets up the smoke on its canvas. Returns null if the browser cannot. */
export function createSmoke(canvas: HTMLCanvasElement): Smoke | null {
  const gl = canvas.getContext("webgl2", { alpha: false, antialias: false });
  if (!gl) return null;
  let program: ReturnType<typeof build>;
  try {
    program = build(gl, FULLSCREEN, SMOKE);
  } catch {
    return null;
  }
  // One triangle big enough to cover the window.
  const screen = shape(gl, new Float32Array([-1, -1, 3, -1, -1, 3]));

  const draw = (f: SmokeFrame) => {
    if (!canvas.clientWidth) return; // not on screen yet
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5) * LOOK.resolution;
    const width = Math.round(canvas.clientWidth * ratio);
    const height = Math.round(canvas.clientHeight * ratio);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
    gl.useProgram(program.program);
    gl.bindVertexArray(screen.vao);
    const at = program.at;
    gl.uniform2f(at("uRes"), width, height);
    gl.uniform1f(at("uTime"), f.time);
    gl.uniform1f(
      at("uDistortion"),
      LOOK.distortion + f.speed * LOOK.speedDistortion,
    );
    gl.uniform2f(at("uMouse"), f.mouse[0], f.mouse[1]);
    gl.uniform1f(at("uGrainAmount"), LOOK.grain.amount);
    gl.uniform1f(at("uGrainSize"), LOOK.grain.size);
    gl.uniform1f(at("uGrainFps"), LOOK.grain.fps);
    gl.uniform1f(at("uGrainShadows"), LOOK.grain.shadows);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  return {
    draw,
    destroy: () => {
      gl.deleteVertexArray(screen.vao);
      screen.buffers.forEach((buffer) => gl.deleteBuffer(buffer));
      gl.deleteProgram(program.program);
    },
  };
}
