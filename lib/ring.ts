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
const FOV = 44; // the lens: how much it sees up and down, in degrees
// Each panel covers 45° of the circle (0.785 radians). Seen from the middle,
// its edges are then 1 / cos(22.5°) = 8% taller than its middle: the curve
// you notice without it looking like a fishbowl (measured on the reference).
const PANEL_ANGLE = 0.785;
const PANEL_HEIGHT = 0.53; // × the radius: about 1.5 wide to 1 tall
const GAP = 0.045; // between panels, as an angle (about 2.5°)
// Upright windows (phones, tablets held up): the ring runs up and down, and a
// 44° lens sees less than 45° from top to bottom, so each panel covers 30°
// there (about 65% of the height).
const PANEL_ANGLE_PHONE = 0.5236;
const ACROSS_PHONE = 0.84; // on a phone, the panel's share of the width

export type RingLayout = {
  /** True on an upright window (a phone, a tablet held up): the ring runs
   *  up and down instead of sideways. */
  vertical: boolean;
  /** The circle's radius, in world units. */
  radius: number;
  /** How far the camera stands behind the circle's middle (0: at it). */
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
  /** The front panel's box on screen, in pixels (its click area): as long
   *  as it is, and as tall as its tallest part, its edges. */
  hit: { w: number; h: number };
  /** The front panel's size across the ring at its middle, in pixels. */
  middlePx: number;
  /** How far, in pixels, the front of the ring moves on screen for each
   *  panel it turns (so a drag can keep the picture under the finger). */
  pxPerPanel: number;
};

/** The room's layout for a window of vw × vh pixels. */
export function ringLayout(vw: number, vh: number): RingLayout {
  // The window's shape picks the direction, not its width. Sideways, a 45°
  // panel takes tan(22.5°) / (tan(22°) × vw/vh) of the width: all of it
  // once the window is square, and more on anything upright (a tablet held
  // up, a narrow browser window). So the ring runs sideways only when the
  // window is at least 1.2 times as wide as it is tall (the front panel then
  // takes at most 85% of the width, and the neighbours show); otherwise up
  // and down, as on a phone. A phone on its side runs sideways.
  const vertical = vw / vh < 1.2;
  const radius = RADIUS;
  // tan(half the view) turns "how far off to the side, per unit of
  // distance" into "how far across the screen" (1 = the screen's edge).
  // The view up and down is fixed; across, it is as wide as the window is.
  const tanY = Math.tan((FOV / 2) * (Math.PI / 180));
  const tanX = tanY * (vw / vh);
  const tanAlong = vertical ? tanY : tanX;
  const tanAcross = vertical ? tanX : tanY;
  const screenAlong = vertical ? vh : vw;
  const screenAcross = vertical ? vw : vh;

  const angle = vertical ? PANEL_ANGLE_PHONE : PANEL_ANGLE;
  const halfAngle = angle / 2;
  // An arc's length is its radius times its angle.
  const along = angle * radius;
  const across = vertical
    ? 2 * ACROSS_PHONE * tanAcross * radius
    : PANEL_HEIGHT * radius;

  // On screen. Standing at the middle, a point at angle a on the rim is
  // radius × sin(a) to the side and radius × cos(a) ahead; the screen shows
  // side ÷ ahead = tan(a), scaled by the lens. A panel's middle is a full
  // radius away; its edges only radius × cos(halfAngle), so they are drawn
  // bigger by 1 / cos(halfAngle).
  const alongPx = (Math.tan(halfAngle) / tanAlong) * screenAlong;
  const middlePx = (across / 2 / radius / tanAcross) * screenAcross;
  const edgePx = middlePx / Math.cos(halfAngle);

  const step = angle + GAP;
  // At the middle of the screen, turning by one radian moves the picture
  // 1 / tanAlong half-screens.
  const pxPerRadian = (1 / tanAlong) * (screenAlong / 2);

  return {
    vertical,
    radius,
    camera: 0,
    tanX,
    tanY,
    tanAlong,
    halfAngle,
    step,
    along,
    across,
    hit: vertical ? { w: edgePx, h: alongPx } : { w: alongPx, h: edgePx },
    middlePx,
    pxPerPanel: pxPerRadian * step,
  };
}
