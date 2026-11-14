// The background's light motes ("Astrophage shimmer", components/ring/
// shaders.ts MOTE_VERTEX): where each one starts, worked out once here; all
// their movement is then done on the graphics card from the time alone.

/** Numbers per mote: x, y, depth, phase, twinkle rate. */
export const MOTE = 5;

/**
 * `count` motes, five numbers each, in one list the graphics card reads
 * directly:
 *   x, y   where it starts, 0..1 across and up the window
 *   depth  0.3 (far: small, dim, slow) to 1 (near)
 *   phase  0..2π, so no two sway or glint in step
 *   rate   0.2 to 0.6 glints a second (most cycles do not glint; see the
 *          shader)
 */
export function scatter(count: number, random: () => number = Math.random) {
  const motes = new Float32Array(count * MOTE);
  for (let i = 0; i < count; i++) {
    motes.set(
      [
        random(),
        random(),
        0.3 + random() * 0.7,
        random() * 2 * Math.PI,
        0.2 + random() * 0.4,
      ],
      i * MOTE,
    );
  }
  return motes;
}

export type Wave = { at: number; moving: boolean };

/**
 * When the ring's latest scroll began, for the shimmer wave: the moment its
 * speed rises past 0.05 after it was still (below 0.01). Between the two the
 * scroll is still going on, so a long flick sends one wave, not one a frame.
 */
export function scrollWave(wave: Wave, speed: number, time: number): Wave {
  if (!wave.moving && speed > 0.05) return { at: time, moving: true };
  if (wave.moving && speed < 0.01) return { at: wave.at, moving: false };
  return wave;
}
