// The particle object is one set of COUNT points. A "shape" is a list of COUNT
// positions (x, y, z, x, y, z, ...) that fits roughly inside a box from -1 to
// 1. To change shape, the object moves each point to its position in the next
// list. Every shape here is drawn by a small function that returns one random
// point of it; calling that COUNT times fills the list.

export const COUNT = 5000;

export type ShapeName =
  | "dot"
  | "cloud"
  | "waveform"
  | "tooth"
  | "road"
  | "tiles"
  | "blocks"
  | "bubble"
  | "arm";

type Point = [number, number, number];
type Random = () => number;

/** A random-number generator that gives the same numbers every time. */
function seeded(seed: number): Random {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Turns a point by `rx` radians about the X axis, then `ry` about the Y axis. */
function turn([x, y, z]: Point, rx: number, ry: number): Point {
  const y1 = y * Math.cos(rx) - z * Math.sin(rx);
  const z1 = y * Math.sin(rx) + z * Math.cos(rx);
  return [
    x * Math.cos(ry) + z1 * Math.sin(ry),
    y1,
    -x * Math.sin(ry) + z1 * Math.cos(ry),
  ];
}

/** A random point on the outline of a rectangle `w` by `h`, corners rounded by `r`. */
function onRoundedRect(
  rand: Random,
  w: number,
  h: number,
  r: number,
): [number, number] {
  // Pick a spot on a plain rectangle: along the top or bottom, or along a side.
  const along = rand() * (w + h);
  const side = rand() < 0.5 ? -1 : 1;
  let x = along < w ? along - w / 2 : (side * w) / 2;
  let y = along < w ? (side * h) / 2 : along - w - h / 2;
  // Then pull anything in a corner onto a quarter circle.
  const cx = w / 2 - r;
  const cy = h / 2 - r;
  if (Math.abs(x) > cx && Math.abs(y) > cy) {
    const dx = Math.abs(x) - cx;
    const dy = Math.abs(y) - cy;
    const d = Math.hypot(dx, dy) || 1;
    x = Math.sign(x) * (cx + (dx / d) * r);
    y = Math.sign(y) * (cy + (dy / d) * r);
  }
  return [x, y];
}

/**
 * A random point inside a flat region. `edge` is the share of points placed in
 * a thin band along the region's outline, so the outline reads clearly.
 */
function inRegion(
  rand: Random,
  inside: (x: number, y: number) => boolean,
  edge: number,
): [number, number] {
  const band = rand() < edge;
  const e = 0.035; // band thickness
  for (;;) {
    const x = rand() * 2 - 1;
    const y = rand() * 2 - 1;
    if (!inside(x, y)) continue;
    // In the band means: inside, but a short step away in some direction is outside.
    const nearEdge =
      !inside(x + e, y) ||
      !inside(x - e, y) ||
      !inside(x, y + e) ||
      !inside(x, y - e);
    if (band && !nearEdge) continue;
    return [x, y];
  }
}

/** A random point on a thick line from a to b (a 2D tube of radius r). */
function onSegment(
  rand: Random,
  a: [number, number],
  b: [number, number],
  r: number,
): [number, number] {
  const t = rand();
  const angle = rand() * Math.PI * 2;
  const d = r * Math.sqrt(rand());
  return [
    a[0] + (b[0] - a[0]) * t + Math.cos(angle) * d,
    a[1] + (b[1] - a[1]) * t + Math.sin(angle) * d,
  ];
}

/** Is the point (x, y) inside the molar's silhouette? */
export function insideTooth(x: number, y: number): boolean {
  if (y >= 0.05) {
    // The crown: bulging sides, and a top edge with two cusps and a dip.
    const top = 0.68 - 0.08 * Math.cos((Math.PI * x) / 0.3);
    const half = 0.62 - 0.1 * ((y - 0.4) / 0.4) ** 2;
    return Math.abs(x) <= half && y <= top;
  }
  // The two roots: each narrows toward its tip at y = -0.85.
  const t = (0.05 - y) / 0.9;
  if (t > 1) return false;
  const centre = 0.3 + 0.04 * t;
  const half = 0.24 * (1 - t) ** 0.8 + 0.03;
  return Math.abs(Math.abs(x) - centre) <= half;
}

/** How tall bar number `bar` of the 36-bar voice waveform is. */
function barHeight(bar: number): number {
  const across = (bar + 0.5) / 36;
  const loudness = Math.abs(Math.sin(bar * 1.3) * Math.cos(bar * 0.45 + 0.6));
  return 0.08 + 0.75 * Math.sin(Math.PI * across) ** 0.7 * loudness;
}

// One function per shape. Each returns a single random point of that shape.
const makers: Record<ShapeName, (rand: Random) => Point> = {
  // The loader's starting point: everything gathered into a small round dot.
  dot: (rand) => {
    const y = rand() * 2 - 1;
    const angle = rand() * Math.PI * 2;
    const radius = 0.03 * Math.cbrt(rand()) * Math.sqrt(1 - y * y);
    return [
      Math.cos(angle) * radius,
      y * 0.03 * Math.cbrt(rand()),
      Math.sin(angle) * radius,
    ];
  },

  // Neutral: a hollow ball. Most points sit on its surface, so as it slowly
  // turns the near and far sides slide past each other and it reads as round.
  cloud: (rand) => {
    const y = rand() * 2 - 1;
    const angle = rand() * Math.PI * 2;
    const ring = Math.sqrt(1 - y * y);
    const radius =
      0.85 * (rand() < 0.8 ? 0.94 + rand() * 0.06 : Math.cbrt(rand()));
    return [
      ring * Math.cos(angle) * radius,
      y * radius,
      ring * Math.sin(angle) * radius,
    ];
  },

  // Odovox, first: the bars of a voice recording.
  waveform: (rand) => {
    for (;;) {
      const bar = Math.floor(rand() * 36);
      const height = barHeight(bar);
      if (rand() * 0.85 > height) continue; // taller bars get more points
      return [
        -0.95 + ((bar + 0.5) * 1.9) / 36 + (rand() - 0.5) * 0.02,
        (rand() * 2 - 1) * height,
        (rand() - 0.5) * 0.06,
      ];
    }
  },

  // Odovox, second: a molar.
  tooth: (rand) => {
    const [x, y] = inRegion(rand, insideTooth, 0.5);
    return [x, y, (rand() - 0.5) * 0.22];
  },

  // Road Damage: a stretch of road seen from a dashcam, with a pothole.
  // x is across the road, d is distance along it, h is height.
  road: (rand) => {
    const hole = (x: number, d: number) =>
      ((x - 0.24) / 0.17) ** 2 + ((d - 0.2) / 0.27) ** 2;
    const part = rand();
    let x = 0;
    let h = 0;
    let d = rand() * 2.6 - 1.3;
    if (part < 0.5) {
      // The surface, with nothing where the pothole is.
      do {
        x = rand() - 0.5;
        d = rand() * 2.6 - 1.3;
      } while (hole(x, d) < 1);
    } else if (part < 0.68) {
      // The two edges of the road.
      x = (rand() < 0.5 ? -0.5 : 0.5) + (rand() - 0.5) * 0.015;
    } else if (part < 0.82) {
      // The dashed centre line.
      x = (rand() - 0.5) * 0.03;
      while ((d + 1.3) % 0.52 > 0.3) d = rand() * 2.6 - 1.3;
    } else {
      // The pothole: a lip around it and a wall going down into it.
      const angle = rand() * Math.PI * 2;
      const reach = 0.7 + rand() * 0.42;
      x = 0.24 + Math.cos(angle) * 0.17 * reach;
      d = 0.2 + Math.sin(angle) * 0.27 * reach;
      h = -Math.max(0, 1 - reach) * 0.35;
    }
    // Enlarge it, and lay it back so it runs away from the viewer.
    return turn([x * 1.25, h * 1.25, -d * 1.2], 0.6, 0);
  },

  // Kattral: a 3 by 3 grid of video-call tiles, each with a head and shoulders.
  tiles: (rand) => {
    let tile = Math.floor(rand() * 10);
    if (tile > 8) tile = 0; // tile 0 is "live" and gets twice the points
    const part = rand();
    let x: number;
    let y: number;
    if (tile === 0 && part < 0.3) {
      // The live tile is filled in.
      x = (rand() - 0.5) * 0.52;
      y = (rand() - 0.5) * 0.32;
    } else if (part < 0.65) {
      [x, y] = onRoundedRect(rand, 0.56, 0.36, 0.06);
    } else if (part < 0.8) {
      // Head: a small disc.
      const angle = rand() * Math.PI * 2;
      const r = 0.05 * Math.sqrt(rand());
      x = Math.cos(angle) * r;
      y = 0.05 + Math.sin(angle) * r;
    } else {
      // Shoulders: half an ellipse.
      const angle = rand() * Math.PI;
      const r = Math.sqrt(rand());
      x = Math.cos(angle) * 0.13 * r;
      y = -0.14 + Math.sin(angle) * 0.1 * r;
    }
    const column = tile % 3;
    const row = Math.floor(tile / 3);
    const depth = (((tile * 7) % 5) - 2) * 0.03;
    return turn(
      [x + (column - 1) * 0.64, y + (1 - row) * 0.44, depth],
      0,
      -0.3,
    );
  },

  // Edge Cache: a stack of four slabs, one sliding out.
  blocks: (rand) => {
    const half: Point = [0.5, 0.11, 0.34];
    const free = Math.floor(rand() * 3);
    const onEdge = rand() < 0.88;
    const p: Point = [0, 0, 0];
    for (let axis = 0; axis < 3; axis++) {
      const atSide = (rand() < 0.5 ? -1 : 1) * half[axis];
      const anywhere = (rand() * 2 - 1) * half[axis];
      // On an edge: one coordinate runs free, the other two sit at a corner.
      // On a face: one coordinate sits at a side, the other two run free.
      p[axis] = (axis === free) === onEdge ? anywhere : atSide;
    }
    const level = Math.floor(rand() * 4);
    p[1] += -0.54 + level * 0.36;
    if (level === 2) p[0] += 0.38;
    return turn(p, 0.42, 0.65);
  },

  // Hallucination: a speech bubble whose right half drifts apart.
  bubble: (rand) => {
    const part = rand();
    let x: number;
    let y: number;
    if (part < 0.55) {
      [x, y] = onRoundedRect(rand, 1.5, 0.96, 0.3);
      y += 0.14;
    } else if (part < 0.67) {
      // The tail: two lines meeting at a tip below the bubble.
      const t = rand();
      const from = rand() < 0.5 ? -0.52 : -0.2;
      x = from + (-0.62 - from) * t;
      y = -0.34 + (-0.78 + 0.34) * t;
    } else if (part < 0.87) {
      // Three lines of "text", the last one shorter.
      const line = Math.floor(rand() * 3);
      x = -0.5 + rand() * (line === 2 ? 0.6 : 1);
      y = 0.36 - line * 0.2 + (rand() - 0.5) * 0.024;
    } else {
      x = (rand() - 0.5) * 1.4;
      y = 0.14 + (rand() - 0.5) * 0.86;
    }
    // The further right a point is, the further it has drifted.
    const drift = Math.max(0, (x - 0.15) / 0.6) ** 2 * 0.55;
    return [
      x - 0.08 + drift * rand() * 0.8,
      y + drift * (rand() - 0.3),
      drift * (rand() - 0.5) * 1.2,
    ];
  },

  // Sequential Conformal Prediction: a robot arm reaching for a cube.
  arm: (rand) => {
    // Joints of the arm, base to gripper, in the flat picture.
    const base: [number, number] = [-0.5, -0.72];
    const shoulder: [number, number] = [-0.5, -0.12];
    const elbow: [number, number] = [0.22, 0.38];
    const wrist: [number, number] = [0.42, -0.12];
    const part = rand();
    let p: [number, number];
    if (part < 0.12) {
      // The base: a flat oval plate.
      const angle = rand() * Math.PI * 2;
      const r = Math.sqrt(rand());
      p = [
        base[0] + Math.cos(angle) * 0.3 * r,
        base[1] + Math.sin(angle) * 0.06 * r,
      ];
    } else if (part < 0.34) {
      p = onSegment(rand, base, shoulder, 0.07);
    } else if (part < 0.58) {
      p = onSegment(rand, shoulder, elbow, 0.065);
    } else if (part < 0.76) {
      p = onSegment(rand, elbow, wrist, 0.055);
    } else if (part < 0.86) {
      // Two gripper fingers.
      const side = rand() < 0.5 ? -1 : 1;
      p = onSegment(
        rand,
        [wrist[0] + side * 0.06, wrist[1]],
        [wrist[0] + side * 0.07, wrist[1] - 0.16],
        0.02,
      );
    } else {
      // The cube under the gripper: its outline.
      const s = 0.15;
      const edge = Math.floor(rand() * 4);
      const along = rand() * 2 - 1;
      const cx = wrist[0] + 0.01;
      const cy = -0.55;
      p = [
        cx + (edge < 2 ? along * s : (edge === 2 ? -1 : 1) * s),
        cy + (edge < 2 ? (edge === 0 ? -1 : 1) * s : along * s),
      ];
    }
    return turn([p[0], p[1] + 0.1, (rand() - 0.5) * 0.12], 0.15, -0.45);
  },
};

export const shapeNames = Object.keys(makers) as ShapeName[];

const cache = new Map<ShapeName, Float32Array>();

/** The COUNT positions of a shape. Built once, then reused. */
export function shape(name: ShapeName): Float32Array {
  let points = cache.get(name);
  if (!points) {
    const rand = seeded(shapeNames.indexOf(name) + 1);
    points = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) points.set(makers[name](rand), i * 3);
    cache.set(name, points);
  }
  return points;
}
