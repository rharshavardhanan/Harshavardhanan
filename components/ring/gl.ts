// Draws the home ring with WebGL2, the browser's own access to the graphics
// card. No 3D library: three small shader programs (components/ring/
// shaders.ts), a grid shape for the panels, one triangle that covers the
// window, and one picture (a texture) per film.
//
// Each frame, in order:
//   1. the cursor's trail is painted into a small picture, on top of the
//      faded trail from the frame before (two pictures, swapped each frame:
//      read one, write the other);
//   2. the moving background fills the window;
//   3. the panels are drawn over it, furthest first, reading the trail.
//
// It knows nothing about scrolling or clicks; components/ring/Ring.tsx works
// out where the ring is and calls draw() once per frame.

import { type RingLayout, wrap } from "@/lib/ring";
import { FRAGMENT, FULLSCREEN, TRAIL, VERTEX } from "./shaders";

export type Film = { src: string; poster: string };

/** Everything that changes from one frame to the next. */
export type RingFrame = {
  /** How far the ring has turned, in panels. */
  offset: number;
  /** How fast it is moving, 0 to 1. */
  speed: number;
  /** Seconds since the ring started. */
  time: number;
  /** The pointer, 0..1 across the window from the bottom left. */
  mouse: [number, number];
  /** How far the pointer moved since the last frame, in the same units. */
  move: [number, number];
  /** Where the head is turned: right (+) / left, and up (+) / down, in
   *  radians. */
  look: [number, number];
  /** 0 to 1: the middle panel growing to fill the window. */
  expand: number;
  /** 0 to 1 for each panel: how far it has flown in from the depth. */
  intro: number[];
  layout: RingLayout;
};

export type RingGL = {
  draw(frame: RingFrame): void;
  /** Plays the films of these panels, and pauses the rest. */
  play(indices: number[]): void;
  /** Pauses every film (when the tab is hidden). */
  pause(): void;
  /** The <video> playing on a panel, if it has one yet. */
  video(index: number): HTMLVideoElement | undefined;
  destroy(): void;
};

// ---------------------------------------------------------------------------
// The settings. Change these to change the look.
// ---------------------------------------------------------------------------
const LOOK = {
  // At full speed the circle rolls up to 1 / (1 + 0.18) of its radius
  // (15% smaller): a little more curve while moving, easing back when it
  // stops. At rest the curve is exactly the room's (lib/ring.ts).
  tighten: 0.18,
  // How far out the panels start when they fly in, in world units.
  flyIn: 14,
  // Corner radius, as a share of the panel's width on screen.
  radius: 0.015,
  // Film grain (shaders.ts, applyGrain), multiplied into the picture: subtle
  // on the panel in front, so the film looks rich and clean, and more on the
  // panels round the side.
  grain: { front: 0.025, side: 0.07, size: 1.5, fps: 24 },
  // The cursor's trail (shaders.ts, TRAIL).
  trail: {
    brushSize: 0.09, // radius, as a share of the window's height
    brushStrength: 1,
    decay: 0.95, // 95% survives each frame: gone in about a second
    fluidShift: 0.05, // how far the trail pushes the picture
    rgbShift: 0.015, // how far it pulls red and blue apart
  },
};

// The grid: how many little squares across and up. More squares bend more
// smoothly; phones get fewer.
function grid(across: number, up: number) {
  const points: number[] = [];
  for (let y = 0; y <= up; y++) {
    for (let x = 0; x <= across; x++) {
      points.push(x / across - 0.5, y / up - 0.5);
    }
  }
  const corners: number[] = [];
  for (let y = 0; y < up; y++) {
    for (let x = 0; x < across; x++) {
      const a = y * (across + 1) + x;
      const b = a + 1;
      const c = a + across + 1;
      const d = c + 1;
      corners.push(a, b, c, b, d, c); // two triangles per square
    }
  }
  return {
    points: new Float32Array(points),
    corners: new Uint16Array(corners),
  };
}

/** Compiles and links one shader program, and finds its uniforms by name. */
function build(gl: WebGL2RenderingContext, vertex: string, fragment: string) {
  const program = gl.createProgram()!;
  for (const [type, source] of [
    [gl.VERTEX_SHADER, vertex],
    [gl.FRAGMENT_SHADER, fragment],
  ] as const) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) ?? "shader did not compile");
    }
    gl.attachShader(program, shader);
  }
  // Every program reads its corner positions from slot 0, so the shapes
  // below work with all of them.
  gl.bindAttribLocation(program, 0, "aPosition");
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? "program did not link");
  }
  const found = new Map<string, WebGLUniformLocation | null>();
  const at = (name: string) => {
    if (!found.has(name)) found.set(name, gl.getUniformLocation(program, name));
    return found.get(name)!;
  };
  return { program, at };
}

type Program = ReturnType<typeof build>;

/** A shape: corner positions in slot 0, and optionally a list of triangles. */
function shape(
  gl: WebGL2RenderingContext,
  points: Float32Array,
  corners?: Uint16Array,
) {
  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);
  const buffers = [gl.createBuffer()!];
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers[0]);
  gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  if (corners) {
    buffers.push(gl.createBuffer()!);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers[1]);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, corners, gl.STATIC_DRAW);
  }
  gl.bindVertexArray(null);
  return { vao, buffers };
}

type Panel = {
  texture: WebGLTexture;
  /** The picture's own width ÷ height, once known. */
  aspect: number;
  video?: HTMLVideoElement;
  /** True when the video has a new frame to copy to the card. */
  fresh: boolean;
};

/** Sets up WebGL on the canvas. Returns null if the browser cannot. */
/** The compile and shape helpers, shared with the smoke (smoke.ts). */
export { build, shape };

export function createRing(
  canvas: HTMLCanvasElement,
  films: Film[],
  phone: boolean,
): RingGL | null {
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: true,
  });
  if (!gl) return null;

  let panelsProgram: Program;
  let trailProgram: Program;
  try {
    panelsProgram = build(gl, VERTEX, FRAGMENT);
    trailProgram = build(gl, FULLSCREEN, TRAIL);
  } catch {
    return null; // the list of projects stays as the home page
  }

  const panelShape = phone ? grid(16, 24) : grid(48, 24);
  const panelVao = shape(gl, panelShape.points, panelShape.corners);
  // One triangle twice the window's size: the part inside the window covers it.
  const screenVao = shape(gl, new Float32Array([-1, -1, 3, -1, -1, 3]));

  const setup = (texture: WebGLTexture) => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  };

  const upload = (panel: Panel, source: TexImageSource) => {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, panel.texture);
    // Pictures and videos arrive upside down for WebGL unless flipped.
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  };

  // One texture per panel: a dark pixel at first, then the poster, then the
  // film's frames while it plays.
  const panels: Panel[] = films.map((film) => {
    const texture = gl.createTexture()!;
    setup(texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([20, 20, 20, 255]),
    );
    const panel: Panel = { texture, aspect: 16 / 9, fresh: false };
    const image = new Image();
    image.src = film.poster;
    image
      .decode()
      .then(() => {
        if (panel.video?.readyState) return; // the film is already showing
        panel.aspect = image.naturalWidth / image.naturalHeight;
        upload(panel, image);
      })
      .catch(() => {});
    return panel;
  });

  // The trail: two small pictures of the window (one pixel per 8 × 8 screen
  // pixels). Each frame reads one and writes the other, then they swap.
  const trail = [0, 1].map(() => {
    const texture = gl.createTexture()!;
    setup(texture);
    return { texture, framebuffer: gl.createFramebuffer()! };
  });
  let trailSize = [0, 0];
  let newest = 0;
  const sizeTrail = (width: number, height: number) => {
    const size = [Math.ceil(width / 8), Math.ceil(height / 8)];
    if (size[0] === trailSize[0] && size[1] === trailSize[1]) return;
    trailSize = size;
    // Start empty: no direction (128, 128 means zero) and no strength.
    const empty = new Uint8Array(size[0] * size[1] * 4);
    for (let i = 0; i < empty.length; i += 4) {
      empty[i] = 128;
      empty[i + 1] = 128;
      empty[i + 3] = 255;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    for (const t of trail) {
      gl.bindTexture(gl.TEXTURE_2D, t.texture);
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
      gl.bindFramebuffer(gl.FRAMEBUFFER, t.framebuffer);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        t.texture,
        0,
      );
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  };

  // A film's video element is made the first time its panel comes near the
  // middle, and kept. Only "fresh" frames are copied to the graphics card.
  const ensureVideo = (index: number) => {
    const panel = panels[index];
    if (panel.video) return panel.video;
    const video = document.createElement("video");
    video.muted = true; // films are never heard
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = films[index].src;
    const onFrame = () => {
      panel.fresh = true;
      video.requestVideoFrameCallback(onFrame);
    };
    // (Older Safari lacks requestVideoFrameCallback; there, copy a frame on
    // every timeupdate instead.)
    if ((video as Partial<HTMLVideoElement>).requestVideoFrameCallback) {
      video.requestVideoFrameCallback(onFrame);
    } else {
      video.addEventListener("timeupdate", () => (panel.fresh = true));
    }
    panel.video = video;
    return video;
  };

  let wanted: number[] = [];
  const play = (indices: number[]) => {
    wanted = indices;
    panels.forEach((panel, index) => {
      if (indices.includes(index)) {
        ensureVideo(index)
          .play()
          .catch(() => {}); // a browser that blocks autoplay keeps the poster
      } else {
        panel.video?.pause();
      }
    });
  };

  // Never more than 1.5 device pixels per CSS pixel: sharp enough, and far
  // less work for the card on high-density screens.
  let ratio = 1;
  const resize = () => {
    ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.round(canvas.clientWidth * ratio);
    const height = Math.round(canvas.clientHeight * ratio);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    sizeTrail(canvas.clientWidth, canvas.clientHeight);
  };

  // The grain's size and pace (its strength is set per panel).
  const grain = (at: Program["at"]) => {
    // gl_FragCoord counts canvas pixels, `ratio` to each CSS pixel: scale the
    // speck so it looks the same size on any screen.
    gl.uniform1f(at("uGrainSize"), LOOK.grain.size * ratio);
    gl.uniform1f(at("uGrainFps"), LOOK.grain.fps);
  };

  const draw = (f: RingFrame) => {
    if (!canvas.clientWidth) return; // not on screen yet
    resize();
    const screen = [canvas.clientWidth, canvas.clientHeight];

    // --- 1. The trail ---------------------------------------------------
    const read = trail[newest];
    const write = trail[1 - newest];
    gl.bindFramebuffer(gl.FRAMEBUFFER, write.framebuffer);
    gl.viewport(0, 0, trailSize[0], trailSize[1]);
    gl.disable(gl.BLEND);
    gl.useProgram(trailProgram.program);
    gl.bindVertexArray(screenVao.vao);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, read.texture);
    {
      const at = trailProgram.at;
      gl.uniform1i(at("uPrevious"), 1);
      gl.uniform2f(at("uMouse"), f.mouse[0], f.mouse[1]);
      gl.uniform2f(at("uMove"), f.move[0], f.move[1]);
      gl.uniform1f(at("uAspect"), screen[0] / screen[1]);
      gl.uniform1f(at("uBrushSize"), LOOK.trail.brushSize);
      gl.uniform1f(at("uBrushStrength"), LOOK.trail.brushStrength);
      gl.uniform1f(at("uDecay"), LOOK.trail.decay);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    newest = 1 - newest;

    // --- 2. The panels (over a clear canvas: the smoke shows through) ---
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(panelsProgram.program);
    gl.bindVertexArray(panelVao.vao);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, trail[newest].texture);
    const at = panelsProgram.at;
    gl.uniform1i(at("uTrail"), 1);
    gl.uniform1i(at("uImage"), 0);
    const l = f.layout;
    gl.uniform2f(at("uScreenPx"), canvas.width, canvas.height);
    gl.uniform1f(at("uVertical"), l.vertical ? 1 : 0);
    gl.uniform1f(at("uRadius"), l.radius);
    gl.uniform1f(at("uTighten"), 1 + Math.min(f.speed, 1) * LOOK.tighten);
    gl.uniform2f(at("uPanel"), l.along, l.across);
    gl.uniform1f(at("uCamera"), l.camera);
    gl.uniform2f(at("uTan"), l.tanX, l.tanY);
    gl.uniform1f(at("uYaw"), f.look[0]);
    gl.uniform1f(at("uPitch"), f.look[1]);
    gl.uniform1f(at("uSpeed"), phone ? f.speed * 0.5 : f.speed);
    gl.uniform1f(at("uTime"), f.time);
    gl.uniform1f(at("uFluidShift"), LOOK.trail.fluidShift);
    gl.uniform1f(at("uRgbShift"), LOOK.trail.rgbShift);
    grain(at);

    const n = films.length;
    // The front panel's box on screen, in pixels, and its shape.
    const { w, h } = l.hit;
    // Furthest first, so the middle panel is drawn last, on top.
    const order = panels
      .map((_, index) => index)
      .sort(
        (a, b) =>
          Math.abs(wrap(b - f.offset, n)) - Math.abs(wrap(a - f.offset, n)),
      );
    const middle = order[order.length - 1];

    for (const index of order) {
      const panel = panels[index];
      const place = wrap(index - f.offset, n);
      const expand = index === middle ? f.expand : 0;
      const intro = f.intro[index] ?? 1;
      const opacity = intro * (index === middle ? 1 : 1 - f.expand);
      if (opacity <= 0.001) continue;
      // Far round the circle, behind you: nothing to draw.
      if (Math.abs(place * l.step) - l.halfAngle > 1.7) continue;

      const video = panel.video;
      if (video && wanted.includes(index) && video.readyState >= 2) {
        if (panel.fresh) {
          panel.aspect = video.videoWidth / video.videoHeight;
          upload(panel, video);
          panel.fresh = false;
        }
      }
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, panel.texture);

      // Cover: crop the picture to the panel's own shape (width ÷ height,
      // as built, before the curve), turning into the window's as it opens.
      const built = l.vertical ? l.across / l.along : l.along / l.across;
      const box = built + (screen[0] / screen[1] - built) * expand;
      const width = w + (screen[0] - w) * expand;
      const height = width / box;
      gl.uniform2f(
        at("uCover"),
        panel.aspect > box ? box / panel.aspect : 1,
        panel.aspect > box ? 1 : panel.aspect / box,
      );
      gl.uniform2f(at("uBox"), width, height);
      gl.uniform1f(
        at("uCorner"),
        LOOK.radius * (l.vertical ? h : w) * (1 - expand),
      );
      // Its angle around the circle: its place (in panels) times the step.
      gl.uniform1f(at("uAngle"), place * l.step);
      gl.uniform1f(at("uExpand"), expand);
      gl.uniform1f(at("uDepth"), Math.pow(1 - intro, 3) * LOOK.flyIn);
      gl.uniform1f(at("uSide"), Math.abs(place));
      // Grain: 0.025 in front, rising to 0.07 one place round.
      const side = Math.min(Math.abs(place), 1);
      gl.uniform1f(
        at("uGrainAmount"),
        LOOK.grain.front + (LOOK.grain.side - LOOK.grain.front) * side,
      );
      gl.uniform1f(at("uOpacity"), opacity);
      gl.drawElements(
        gl.TRIANGLES,
        panelShape.corners.length,
        gl.UNSIGNED_SHORT,
        0,
      );
    }
    gl.bindVertexArray(null);
  };

  return {
    draw,
    play,
    pause: () => panels.forEach((panel) => panel.video?.pause()),
    video: (index) => panels[index]?.video,
    destroy: () => {
      panels.forEach((panel) => {
        panel.video?.pause();
        panel.video?.removeAttribute("src");
        panel.video?.load();
        gl.deleteTexture(panel.texture);
      });
      for (const t of trail) {
        gl.deleteTexture(t.texture);
        gl.deleteFramebuffer(t.framebuffer);
      }
      // Free what this ring made, but keep the canvas's WebGL itself alive:
      // Next.js keeps a page you leave ready for the Back button, and the
      // ring then starts again on the same canvas.
      for (const { vao, buffers } of [panelVao, screenVao]) {
        gl.deleteVertexArray(vao);
        buffers.forEach((buffer) => gl.deleteBuffer(buffer));
      }
      for (const p of [panelsProgram, trailProgram]) {
        gl.deleteProgram(p.program);
      }
    },
  };
}
