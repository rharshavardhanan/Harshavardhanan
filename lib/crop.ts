// The films' framing: each mood film is zoomed in a little and moved, so the
// generator's ✦ mark near its bottom-right corner falls outside the frame
// (content/projects.ts, filmCrop, per project). The ring's panels do it in
// their shader (components/ring/shaders.ts); everywhere else a film or its
// poster shows, CSS does the same sum ("Film crop" in app/globals.css).
//
// The sum, for a point on the panel at uv (0..1 across and up, after the
// film has been fitted to cover the panel):
//
//   uv = (uv - 0.5) / zoom + 0.5 + shift × cover
//
// Subtracting 0.5 measures from the middle of the picture; dividing by zoom
// (1.15) brings every point 15% closer to the middle, so the panel reads
// only the middle 87% of the picture: it looks 15% bigger, and the edges
// fall away evenly. Adding 0.5 puts it back; adding the shift then slides
// the part that is read: (-0.06, +0.03) reads further left and higher, so
// what falls away comes off the right and the bottom, where the mark is.
// The shift is a share of what the box shows (cover: 1 when the film's
// whole width shows, about 0.26 on a phone's page): on a wide screen it is
// 6% of the picture; on a phone, where only the middle fifth shows, a fixed
// 6% would slide a subject off the middle (Odovox's phone) out of shot.

import type { CSSProperties } from "react";
import type { FilmCrop } from "@/content/projects";

/** The films' shape: 1280 × 720. */
const FILM = 16 / 9;

/** The CSS variables "Film crop" in app/globals.css reads. */
export function cropStyle(crop: FilmCrop) {
  return {
    "--crop": crop.zoom,
    "--crop-x": crop.shift[0],
    "--crop-y": crop.shift[1],
  } as CSSProperties;
}

/**
 * The part of the picture a box of the given shape (width ÷ height) shows,
 * once the film covers the box and the crop is applied: u across from the
 * left, v up from the bottom, as shares of the picture. A box narrower than
 * the film shows less of its width; a wider one, less of its height.
 */
export function shown(crop: FilmCrop, aspect: number) {
  const coverX = aspect < FILM ? aspect / FILM : 1;
  const coverY = aspect < FILM ? 1 : FILM / aspect;
  const half = [(0.5 * coverX) / crop.zoom, (0.5 * coverY) / crop.zoom];
  const slide = [crop.shift[0] * coverX, crop.shift[1] * coverY];
  return {
    u: [0.5 - half[0] + slide[0], 0.5 + half[0] + slide[0]],
    v: [0.5 - half[1] + slide[1], 0.5 + half[1] + slide[1]],
  };
}
