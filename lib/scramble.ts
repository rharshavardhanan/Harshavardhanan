// The text decode: random characters that settle, left to right, into the
// real text, like a code being cracked.
//
// Two layers do it. The real text stays where it is, made transparent while
// the decode plays: it keeps the box exactly its final size (so nothing around
// it moves) and it is what screen readers read. Over it, in a layer that
// cannot change the layout, the "noise" layer shows the decode, and is hidden
// from screen readers. The styles are under "Decode" in app/globals.css.
//
//   plan() and frame()  the timing, as plain functions (tested)
//   scramble()          plays it on a page element
//   wrap()              gives text already on the page the two layers
//
// components/Decode.tsx uses scramble() for text React draws (the frame, the
// menu); components/Motion.tsx uses wrap() and scramble() for [data-decode]
// labels on project pages.

/** The characters the noise is made of. */
export const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/_-";

/** How long each random character stays up: 40ms, 25 a second. */
const HOLD = 0.04;

/** One letter's part in the decode: from `start` it flickers through `noise`
 *  (an equal share of the time each); at `lock` it shows its real letter. */
export type Letter = { start: number; lock: number; noise: string[] };

/**
 * Works out, once, what each letter will do. The timing, in plain words:
 *
 *  - Letters lock in left to right, evenly spaced: with n letters over
 *    `duration` seconds, letter i locks at (i + 1) × duration / n. So the
 *    delay between one letter and the next is duration / n, and the last one
 *    locks exactly at `duration`.
 *  - Before it locks, each letter flickers through 3 to 6 random characters,
 *    each up for 40ms, so it starts flickering 0.12 to 0.24s before its lock.
 *    The first letters lock sooner than that, so they start at 0 and their
 *    characters just change faster.
 *  - Until it starts flickering, a letter is blank. So a short wave of noise
 *    runs ahead of the real text as it fills in from the left.
 *  - Spaces never flicker: words keep their shape.
 */
export function plan(
  text: string,
  duration = 0.8,
  random: () => number = Math.random,
): Letter[] {
  const chars = [...text];
  const step = duration / Math.max(chars.length, 1); // the per-letter delay
  return chars.map((char, i) => {
    const lock = (i + 1) * step;
    if (char.trim() === "") return { start: lock, lock, noise: [] };
    const count = 3 + Math.floor(random() * 4); // 3, 4, 5 or 6
    const noise: string[] = [];
    while (noise.length < count) {
      const pick = CHARS[Math.floor(random() * CHARS.length)];
      // Never the same character twice in a row: every change shows.
      if (pick !== noise.at(-1)) noise.push(pick);
    }
    return { start: Math.max(0, lock - count * HOLD), lock, noise };
  });
}

/** The text as it looks `t` seconds into the decode. */
export function frame(text: string, letters: Letter[], t: number) {
  const chars = [...text];
  return letters
    .map(({ start, lock, noise }, i) => {
      if (t >= lock) return chars[i];
      if (t < start) return " ";
      // Which of its random characters is up: the time since it started,
      // as a share of its flicker, picks one.
      const k = Math.floor(((t - start) / (lock - start)) * noise.length);
      return noise[Math.min(k, noise.length - 1)];
    })
    .join("");
}

const still = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Plays the decode on a `.decode` element (the two layers; see Decode.tsx or
 * wrap()). `delay` holds it blank first, for staggering a list. Each animation
 * frame it asks frame() for the text at that moment and writes it into the
 * noise layer; at the end it empties the noise and shows the real text.
 * Returns a function that stops it early (and shows the real text).
 * Does nothing for visitors who asked for reduced motion.
 */
export function scramble(
  el: HTMLElement,
  text: string,
  { duration = 0.8, delay = 0 } = {},
) {
  const noise = el.querySelector<HTMLElement>(":scope > .decode-noise");
  if (!noise || !text || still()) return () => {};
  const letters = plan(text, duration);
  let raf = 0;
  let begun = -1;

  const stop = () => {
    cancelAnimationFrame(raf);
    delete el.dataset.decoding;
    noise.textContent = "";
  };
  const tick = (now: number) => {
    if (begun < 0) begun = now + delay * 1000;
    const t = (now - begun) / 1000;
    if (t >= duration) return stop();
    noise.textContent = t < 0 ? "" : frame(text, letters, t);
    raf = requestAnimationFrame(tick);
  };

  // Hide the real text now, not on the next frame, so it never flashes.
  el.dataset.decoding = "";
  noise.textContent = "";
  raf = requestAnimationFrame(tick);
  return stop;
}

/**
 * Gives an element that holds plain text the two layers scramble() needs:
 *   <el><span class="decode"><span class="decode-text">its text</span>
 *       <span class="decode-noise" aria-hidden="true"></span></span></el>
 * The element's own text nodes are moved, not copied, so `undo` can put them
 * back exactly as they were.
 */
export function wrap(el: HTMLElement) {
  const text = el.textContent ?? "";
  const box = document.createElement("span");
  box.className = "decode";
  const real = document.createElement("span");
  real.className = "decode-text";
  real.append(...el.childNodes);
  const noise = document.createElement("span");
  noise.className = "decode-noise";
  noise.setAttribute("aria-hidden", "true");
  box.append(real, noise);
  el.append(box);
  return {
    box,
    text,
    undo: () => {
      el.append(...real.childNodes);
      box.remove();
    },
  };
}
