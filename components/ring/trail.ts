// The cursor's trail: where the pointer has been lately, as a small picture
// of the window (one pixel per 8 × 8 screen pixels). Each frame, the TRAIL
// shader (shaders.ts) reads the last frame's picture, fades it a little, and
// paints the pointer's new movement on top, into a second picture; then the
// two swap ("ping-pong"). So the trail builds up as you move and dies away
// when you stop.
//
// One WebGL context cannot read another's pictures, so each canvas on the
// home page (the ring and the background) runs its own trail, both fed the
// same pointer from components/ring/Ring.tsx.

import { FULLSCREEN, TRAIL } from "./shaders";
import {
  build,
  dropShape,
  type Program,
  shape,
  smoothTexture,
  WHOLE_WINDOW,
} from "./webgl";

export type TrailSettings = {
  /** The brush's radius, as a share of the window's height. */
  brushSize: number;
  /** How much one frame of movement paints, 0 to 1. */
  brushStrength: number;
  /** How much of the trail survives each frame: 0.95 is gone in about a
   *  second, 0.965 in about one and a half. */
  decay: number;
};

export type TrailStep = {
  /** The pointer, 0..1 across the window from the bottom left. */
  mouse: [number, number];
  /** How far it moved since the last frame, in the same units. */
  move: [number, number];
};

export type Trail = {
  /** Paints this frame's movement. Leaves the canvas's own picture bound
   *  again afterwards (the caller sets its viewport). */
  step(width: number, height: number, frame: TrailStep): void;
  /** The newest trail picture, for a shader to read. */
  texture(): WebGLTexture;
  destroy(): void;
};

export function createTrail(
  gl: WebGL2RenderingContext,
  settings: TrailSettings,
): Trail {
  const program: Program = build(gl, FULLSCREEN, TRAIL);
  const screen = shape(gl, WHOLE_WINDOW);
  const pictures = [0, 1].map(() => ({
    texture: smoothTexture(gl),
    framebuffer: gl.createFramebuffer()!,
  }));
  let size = [0, 0];
  let newest = 0;

  // (Re)makes the two pictures for a window of width × height CSS pixels.
  const fit = (width: number, height: number) => {
    const next = [Math.ceil(width / 8), Math.ceil(height / 8)];
    if (next[0] === size[0] && next[1] === size[1]) return;
    size = next;
    // Empty: no direction (128, 128 means zero) and no strength.
    const empty = new Uint8Array(size[0] * size[1] * 4);
    for (let i = 0; i < empty.length; i += 4) {
      empty[i] = 128;
      empty[i + 1] = 128;
      empty[i + 3] = 255;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    for (const p of pictures) {
      gl.bindTexture(gl.TEXTURE_2D, p.texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        size[0],
        size[1],
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        empty,
      );
      gl.bindFramebuffer(gl.FRAMEBUFFER, p.framebuffer);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        p.texture,
        0,
      );
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  };

  return {
    step(width, height, f) {
      fit(width, height);
      const read = pictures[newest];
      const write = pictures[1 - newest];
      gl.bindFramebuffer(gl.FRAMEBUFFER, write.framebuffer);
      gl.viewport(0, 0, size[0], size[1]);
      gl.disable(gl.BLEND);
      gl.useProgram(program.program);
      gl.bindVertexArray(screen.vao);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, read.texture);
      const at = program.at;
      gl.uniform1i(at("uPrevious"), 1);
      gl.uniform2f(at("uMouse"), f.mouse[0], f.mouse[1]);
      gl.uniform2f(at("uMove"), f.move[0], f.move[1]);
      gl.uniform1f(at("uAspect"), width / height);
      gl.uniform1f(at("uBrushSize"), settings.brushSize);
      gl.uniform1f(at("uBrushStrength"), settings.brushStrength);
      gl.uniform1f(at("uDecay"), settings.decay);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      newest = 1 - newest;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    },
    texture: () => pictures[newest].texture,
    destroy() {
      for (const p of pictures) {
        gl.deleteTexture(p.texture);
        gl.deleteFramebuffer(p.framebuffer);
      }
      dropShape(gl, screen);
      gl.deleteProgram(program.program);
    },
  };
}
