// The arithmetic behind the home page's ring of films, kept apart from the
// drawing so it can be tested. Positions are counted in panels: 0 is the first
// project, 1 the next, 2.5 halfway between the third and fourth. (The ring's
// rotation as an angle is that count times `step`, see ringLayout below.)

/** Wraps x into the range -n/2 to n/2, so a ring of n panels has no end:
 *  wrap(6.4, 7) is -0.6, i.e. just before the first panel. */
export function wrap(x: number, n: number) {
  return ((((x + n / 2) % n) + n) % n) - n / 2;
}

/** Which panel (0 to n-1) is nearest the middle when the ring has turned by
 *  `offset` panels. */
export function nearest(offset: number, n: number) {
  return ((Math.round(offset) % n) + n) % n;
}

/** Moves `current` part of the way to `target`: 8% (the `rate`) for every
 *  sixtieth of a second that has passed, so the ring glides to a stop at the
 *  same speed on a 60Hz screen and a 120Hz one. */
export function ease(current: number, target: number, dt: number, rate = 0.08) {
  return current + (target - current) * (1 - Math.pow(1 - rate, dt * 60));
}

// ---------------------------------------------------------------------------
// The room of screens. You stand near the middle of a circle (a cylinder,
// really) and the panels stand on its rim, all facing you. Turning the ring
// turns the room around you.
//
// Sizes here are in "world units": only their ratios matter (the radius is
// 6; a panel about 7.7 wide). Angles are in radians: a full turn is 2π, about
// 6.28; one radian is about 57°.
// ---------------------------------------------------------------------------

const RADIUS = 6; // the circle's radius
const CAMERA = 0.15; // the camera stands this share of the radius behind the
// middle: a little back, which softens the wrap at the edges
const FOV = 55; // the lens: how much it sees up and down, in degrees
const GAP = 0.06; // the gap between panels, as an angle
// How much of the screen the front panel fills, along the ring's direction.
// From inside a circle, 76% leaves each neighbour about 7% of the screen;
// lower it to show more of the neighbours.
const FRONT = 0.76;
const FRONT_PHONE = 0.62;
const ACROSS_PHONE = 0.84; // on a phone, the panel's share of the width

export type RingLayout = {
  /** True on a phone: the ring runs up and down instead of sideways. */
  vertical: boolean;
  /** The circle's radius, in world units. */
  radius: number;
  /** How far the camera stands behind the circle's middle. */
  camera: number;
  /** tan of half the lens's view, across and up (tanX and tanY), and
   *  along the ring's direction (tanAlong). */
  tanX: number;
  tanY: number;
  tanAlong: number;
  /** Half a panel's width, as an angle around the circle. */
  halfAngle: number;
  /** From one panel's middle to the next, as an angle: panel plus gap. */
  step: number;
  /** One panel's size in world units: along the ring (the length of its
   *  arc) and across it. */
  along: number;
  across: number;
  /** The front panel's box on screen, in pixels (its click area). */
  hit: { w: number; h: number };
  /** How far, in pixels, the front of the ring moves on screen for each
   *  panel it turns (so a drag can keep the picture under the finger). */
  pxPerPanel: number;
};

/** The room's layout for a window of vw × vh pixels. */
export function ringLayout(vw: number, vh: number): RingLayout {
  const vertical = vw < 768;
  const radius = RADIUS;
  const camera = CAMERA * RADIUS;
  // tan(half the view) turns "how far off to the side, per unit of
  // distance" into "how far across the screen" (1 = the screen's edge).
  const tanY = Math.tan((FOV / 2) * (Math.PI / 180));
  const tanX = tanY * (vw / vh);
  const tanAlong = vertical ? tanY : tanX;
  const tanAcross = vertical ? tanX : tanY;
  const screenAlong = vertical ? vh : vw;
  const screenAcross = vertical ? vw : vh;

  // Where a point at angle a around the circle lands on screen, as a share
  // of half the screen (0 = the middle, 1 = the edge). It is radius × sin(a)
  // to the side and camera + radius × cos(a) away (see the vertex shader).
  const onScreen = (a: number) =>
    (radius * Math.sin(a)) / (camera + radius * Math.cos(a)) / tanAlong;

  // The panel's half-angle, so that its edges land at FRONT of the screen.
  // There is no neat formula, so search: halve the range 50 times.
  const front = vertical ? FRONT_PHONE : FRONT;
  let low = 0;
  let high = 1.5;
  for (let i = 0; i < 50; i++) {
    const middle = (low + high) / 2;
    if (onScreen(middle) < front) low = middle;
    else high = middle;
  }
  const halfAngle = (low + high) / 2;

  // An arc's length is its radius times its angle.
  const along = 2 * halfAngle * radius;
  const across = vertical
    ? 2 * ACROSS_PHONE * tanAcross * (camera + radius)
    : (along * 9) / 16;

  // The click area: as long as the panel on screen, and as tall as its
  // tallest part, its edges (nearest the camera, so drawn biggest).
  const nearestEdge = camera + radius * Math.cos(halfAngle);
  const acrossPx = (across / 2 / nearestEdge / tanAcross) * screenAcross;
  const alongPx = front * screenAlong;

  const step = 2 * halfAngle + GAP;
  // At the middle of the screen, turning by one radian moves the picture
  // radius / (camera + radius) / tanAlong half-screens.
  const pxPerRadian =
    (radius / (camera + radius) / tanAlong) * (screenAlong / 2);

  return {
    vertical,
    radius,
    camera,
    tanX,
    tanY,
    tanAlong,
    halfAngle,
    step,
    along,
    across,
    hit: vertical ? { w: acrossPx, h: alongPx } : { w: alongPx, h: acrossPx },
    pxPerPanel: pxPerRadian * step,
  };
}
