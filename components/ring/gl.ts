// Draws the ring of film panels with WebGL2, the browser's own access to the
// graphics card. No 3D library: one flat grid shape, one shader program
// (components/ring/shaders.ts), and one picture (a texture) per panel.
//
// It knows nothing about scrolling or clicks; components/ring/Ring.tsx works
// out where the ring is and calls draw() once per frame.

import { type PanelSize, wrap } from "@/lib/ring";
import { FRAGMENT, VERTEX } from "./shaders";

export type Film = { src: string; poster: string };

/** Everything that changes from one frame to the next. */
export type RingFrame = {
  /** How far the ring has turned, in panels. */
  offset: number;
  /** How fast it is moving, 0 to 1. */
  speed: number;
  /** Seconds since the ring started. */
  time: number;
  /** The pointer's place on the middle panel (0 to 1), and how strongly it
   *  ripples (0 to 1). */
  pointer: [number, number];
  ripple: number;
  /** 0 to 1: the middle panel growing to fill the window. */
  expand: number;
  /** 0 to 1 for each panel: how far it has flown in from the depth. */
  intro: number[];
  size: PanelSize;
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

const UNIFORMS = [
  "uScreen",
  "uSize",
  "uAlong",
  "uVertical",
  "uBend",
  "uExpand",
  "uDepth",
  "uImage",
  "uCover",
  "uSpeed",
  "uFocus",
  "uPointer",
  "uRipple",
  "uTime",
  "uOpacity",
] as const;

// The grid: how many little squares across and up. More squares bend more
// smoothly; phones get fewer.
function grid(across: number, up: number) {
  const points: number[] = [];
  for (let y = 0; y <= up; y++) {
    for (let x = 0; x <= across; x++)
      points.push(x / across - 0.5, y / up - 0.5);
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

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "shader did not compile");
  }
  return shader;
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

  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  const u = Object.fromEntries(
    UNIFORMS.map((name) => [name, gl.getUniformLocation(program, name)]),
  ) as Record<(typeof UNIFORMS)[number], WebGLUniformLocation>;

  // The shared grid shape.
  const shape = phone ? grid(16, 24) : grid(48, 24);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, shape.points, gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const indices = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, shape.corners, gl.STATIC_DRAW);

  // Pictures and videos arrive upside down for WebGL unless flipped.
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const upload = (panel: Panel, source: TexImageSource) => {
    gl.bindTexture(gl.TEXTURE_2D, panel.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  };

  // One texture per panel: a dark pixel at first, then the poster, then the
  // film's frames while it plays.
  const panels: Panel[] = films.map((film) => {
    const texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
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
    for (const [key, value] of [
      [gl.TEXTURE_MIN_FILTER, gl.LINEAR],
      [gl.TEXTURE_MAG_FILTER, gl.LINEAR],
      [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
      [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE],
    ]) {
      gl.texParameteri(gl.TEXTURE_2D, key, value);
    }
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

  // A film's video element is made the first time its panel comes near the
  // middle, and kept. Only "fresh" frames are copied to the graphics card.
  const ensureVideo = (index: number) => {
    const panel = panels[index];
    if (panel.video) return panel.video;
    const video = document.createElement("video");
    video.muted = true;
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

  const resize = () => {
    // Never more than 1.5 device pixels per CSS pixel: sharp enough, and
    // far less work for the card on high-density screens.
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.round(canvas.clientWidth * ratio);
    const height = Math.round(canvas.clientHeight * ratio);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
  };

  const draw = (f: RingFrame) => {
    resize();
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const n = films.length;
    const screen = [canvas.clientWidth, canvas.clientHeight];
    const { w, h, step, vertical } = f.size;
    gl.uniform2f(u.uScreen, screen[0], screen[1]);
    gl.uniform1f(u.uVertical, vertical ? 1 : 0);
    gl.uniform1f(
      u.uBend,
      (phone ? 0.15 : 0.25) + f.speed * (phone ? 0.6 : 1.1),
    );
    gl.uniform1f(u.uSpeed, phone ? f.speed * 0.5 : f.speed);
    gl.uniform1f(u.uTime, f.time);
    gl.uniform1i(u.uImage, 0);
    gl.activeTexture(gl.TEXTURE0);

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

      const video = panel.video;
      if (video && wanted.includes(index) && video.readyState >= 2) {
        if (panel.fresh) {
          panel.aspect = video.videoWidth / video.videoHeight;
          upload(panel, video);
          panel.fresh = false;
        }
      }
      gl.bindTexture(gl.TEXTURE_2D, panel.texture);

      // Cover: crop the picture to the panel's current shape.
      const width = w + (screen[0] - w) * expand;
      const height = h + (screen[1] - h) * expand;
      const box = width / height;
      gl.uniform2f(
        u.uCover,
        panel.aspect > box ? box / panel.aspect : 1,
        panel.aspect > box ? 1 : panel.aspect / box,
      );
      gl.uniform2f(u.uSize, w, h);
      gl.uniform1f(u.uAlong, place * step);
      gl.uniform1f(u.uExpand, expand);
      gl.uniform1f(u.uDepth, Math.pow(1 - intro, 3) * 1400);
      gl.uniform1f(u.uFocus, Math.max(0, 1 - Math.abs(place)));
      gl.uniform2f(u.uPointer, f.pointer[0], f.pointer[1]);
      gl.uniform1f(u.uRipple, index === middle ? f.ripple : 0);
      gl.uniform1f(u.uOpacity, opacity);
      gl.drawElements(gl.TRIANGLES, shape.corners.length, gl.UNSIGNED_SHORT, 0);
    }
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
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
