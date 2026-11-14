# Astrophage shimmer: light motes in the home background — plan

Source: Harsha, 2026-11-14, a pasted spec: a field of tiny, faint light motes
drifting in the dark between and behind the panels, inspired by the
glittering particle waves in Project Hail Mary (our own effect). Subtle:
noticed on a second look, never competing with the films.

**Status: done (2026-11-14).** `pnpm test` 71 (motes 3), `pnpm e2e` 118 (ring:
motes 400 / 150). Checked with a temporary 10× bright build (removed): motes
around the panels and none on the centre film; they drift between frames; a
cursor sweep moves them; the wave (alone) lights a ring of motes at 0.55s and
0.8s, gone by 1.1s. Found and fixed there: `pow(x, 2.0)` with x below 0 is
undefined in GLSL (NaN on many cards): the wave now squares by multiplying.
Frame rate at 393×852, CPU slowed 4×: 60.1 fps with motes, 60.1 without
(the graphics card is not slowed by this test). At the spec's brightness most
motes sit at about the grain's level; near ones and glints show.

Decisions taken while planning (for review):

- **Order.** Drawn on the background canvas right after the oil, as a second
  pass, additively. The spec asked for "before the grain": the background's
  grain is additive (the same small number added to a pixel whatever its
  value), so oil + grain + mote = oil + mote + grain, pixel for pixel; no
  extra offscreen pass is needed.
- **Twinkle.** `pow(max(sin(...), 0), 24)` is above half strength for 7.6% of
  each mote's cycle (sin > 0.9715). With 400 motes that is about 30 glinting
  at any moment: a sparkle, not "occasionally a single mote". So each mote
  glints on one cycle in eight, picked by an integer (pcg) hash of the cycle
  number: about 4 at a time across the screen, most of them behind panels.
- **Parallax** follows the ring's direction: sideways rings shift the motes
  sideways, upright (phone) rings shift them up and down.
- **Reduced motion** never starts the ring or its background (the poster list
  is the home page), so there is nothing to switch off. **Hidden tab:** the
  browser stops animation frames, which stops the oil, the films and the motes
  together.
- **Never silently missing:** the background quietly falls back to nothing if
  its shaders fail, so the canvas carries `data-motes="400"` (or 150) once the
  motes are set up, and a browser test checks it.

### Task 1: Where the motes start, and when a scroll wave starts

- **Goal:** `scatter(count, random)` gives each mote a start (x, y in 0..1), a depth (0.3–1), a phase (0–2π) and a twinkle rate (0.2–0.6 Hz), five numbers each in one Float32Array; `scrollWave(state, speed, time)` marks the moment a scroll begins (speed past 0.05 after being still, under 0.01).
- **Files:** create `lib/motes.ts`, `lib/motes.test.ts`.
- **Done when:** `pnpm test lib/motes.test.ts` passes: 400 motes, 2000 numbers, every value in its range; a wave starts once per scroll, not every frame.

### Task 2: The motes on the background

- **Goal:** 400 motes on desktop, 150 on phones, one `drawArrays(POINTS)` with additive blending, all motion in the vertex shader: diagonal drift up (1–3% of the height a second, by depth), sway, the cursor trail pushing them, parallax with the ring; faint warm dots (0.06 × depth), rare glints (+0.35 × depth), a wave of +0.15 from the centre when a scroll starts (0.8 heights a second, gone after 1.2s), faded out at the centre panel's edges.
- **Files:** `components/ring/shaders.ts` (MOTE_VERTEX, MOTE_FRAGMENT), `components/ring/smoke.ts`, `components/ring/Ring.tsx` (the frame now carries the ring's turn, the wave's age, the centre panel's size and direction), `e2e/ring.e2e.ts`, `DESIGN.md`.
- **Done when:** `pnpm e2e ring` passes "the background has its motes" (`data-motes` 400 at 1280×800, 150 on a phone); a 4× enlarged, brightened crop of the background shows the dots; frame rate with 4× CPU slowdown at phone size is within 5% of the live site's (no motes); the full suite passes.
