// The shape of a torn paper edge, as an SVG path. It is drawn across a box
// `width` wide and `height` tall: solid along the top, ragged along the
// bottom. The raggedness comes from a seeded random sequence, so the same
// seed always gives the same tear (the page looks the same on every visit,
// and the server and the browser agree).

/** A small, fast seeded random number generator (mulberry32): the same seed
 *  always gives the same sequence of numbers between 0 and 1. */
function random(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function tornPath(seed: number, width = 1440, height = 60, steps = 90) {
  const next = random(seed);
  // Two kinds of wobble added together: a slow wave (the line of the tear)
  // and a fast jitter (the fibres of the paper).
  const phase = next() * Math.PI * 2;
  const points: string[] = [];
  for (let i = steps; i >= 0; i--) {
    const x = (i / steps) * width;
    const wave = Math.sin((i / steps) * Math.PI * 3 + phase) * 0.3 + 0.5;
    const jitter = (next() - 0.5) * 0.45;
    const y = Math.min(1, Math.max(0, wave + jitter)) * height;
    points.push(`L${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  // Across the top, down the right side, along the tear from right to left.
  return `M0 0H${width}V0${points.join("")}Z`;
}
