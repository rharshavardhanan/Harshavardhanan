// The arithmetic behind the home page's ring of films, kept apart from the
// drawing so it can be tested. Positions are counted in panels: 0 is the first
// project, 1 the next, 2.5 halfway between the third and fourth.

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

export type PanelSize = {
  /** Width and height of one panel, in pixels. */
  w: number;
  h: number;
  /** The space between two panels. */
  gap: number;
  /** True on a phone: the ring runs downwards instead of sideways. */
  vertical: boolean;
  /** From one panel's centre to the next: the panel plus the gap. */
  step: number;
};

/** How big the panels are for a window of vw × vh pixels. Wide windows get
 *  16:9 panels in a row; phones get one tall panel per screen. */
export function panelSize(vw: number, vh: number): PanelSize {
  if (vw < 768) {
    const w = vw * 0.84;
    const h = Math.min(vh * 0.62, w * 1.3);
    const gap = vh * 0.06;
    return { w, h, gap, vertical: true, step: h + gap };
  }
  const w = Math.min(vw * 0.5, (vh * 0.6 * 16) / 9);
  const h = (w * 9) / 16;
  const gap = vw * 0.05;
  return { w, h, gap, vertical: false, step: w + gap };
}
