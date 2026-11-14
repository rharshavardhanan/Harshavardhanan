# The Astrophage river: flowing light in the home background — plan

Source: Harsha, 2026-11-14, with two reference images (Project Hail Mary key
art: dense, long, motion-blurred streaks of light flowing along one
diagonal; white-hot gold at the core through orange and magenta to violet;
a soft coloured haze behind; black space either side): "I want these
effects, flowing astrophage, in the background. I need only quality work."
Our own effect in that style, not a copy of the images.

This replaces the "subtle motes" brief: the river is meant to be seen.

**Status: built (2026-11-14), strength to be picked by Harsha** (code: 0.75,
"cinematic"). Six passes against the reference: hairlines → coloured haloed
streaks; pastel gold → the reference's colour order (maroon, red-orange,
white-hot yellow core, orange-red, magenta, purple, indigo); a per-channel
tone curve turned orange to khaki → a hue-preserving one; crisper hero
streaks, a narrower bloom. Fixed on Harsha's report: the river shifted with
the ring's total turn (unbounded) and slid off the screen after a long
scroll; now its place is fixed (40 panels of scrolling: same brightness map).
The frame uses its dark band on the home page everywhere (text over light).
`pnpm test` 80, `pnpm e2e` 118 (the phone-centring test now hides the
background, which it is not about). 60 fps with and without the river at
393×852, CPU slowed 4× (the graphics card is not slowed by this test).

**Follow-up (Harsha: "why can't it keep moving, ever so slowly"):** it was
moving (flow advanced 0.05/s, ~180 draws/s) but invisibly: a long smooth
streak sliding along itself looks still. Now knots of light ride along each
streak (25–100% brightness, carried with it), the rest flow is slower (0.12 →
0.05), and the river breathes (its middle line waves travel along it, its
width swells, its haze changes shape). A grain-free difference of two frames
0.5s apart shows the knots moving along every streak; recording at rest:
scratchpad river/astrophage-at-rest.mp4.

## Design

- **Streaks, drawn as streaks.** Three layers of thin rows along the
  diagonal (32° down to the right, as the reference). In each row, segments of light with
  tapered ends (1D noise along the row, only its peaks kept), each row at its
  own speed. Far layer: many fine dim slow rows; near layer: few thick bright
  fast ones. Lines are never thinner than a pixel (fwidth), so they do not
  shimmer.
- **A river, not a wash.** The streaks and the haze live inside a band along
  the flow that meanders slowly; its colour runs across it, gold-white core
  → orange → rose-magenta → violet → indigo, gold on the lower-left side,
  violet on the upper-right. Outside the band: the near-black oil, as now.
- **Haze.** fbm stretched along the flow (long, soft, coloured clouds) behind
  the lines; a gentle tone curve (1 − e^−x) so the core glows without
  clipping.
- **Motion.** It flows all the time; a scroll makes it surge (faster, longer
  streaks); the cursor's trail bends the streaks; the layers shift at
  different rates as the ring turns (depth).
- **Motes become astrophage.** They drift along the river in its colours,
  brighter inside the band, instead of up against it.
- **One strength setting** (`LOOK.river.strength`), so three versions can be
  shown: restrained, cinematic, full.

## Tasks

### Task 1: The river in the background shader

- **Files:** `components/ring/shaders.ts` (SMOKE: the river after the oil's lighting, before the grain; MOTE_VERTEX: drift along the river, colour by place), `components/ring/smoke.ts` (LOOK.river; the flow's distance kept on the JS side so a surge never jumps), `components/ring/Ring.tsx` if needed.
- **Done when:** screenshots at 1440×900 and 393×852 show the streaked river behind the panels with black either side; a screen recording shows it flowing and surging on a scroll; the shader compiles in Chrome (the ring tests pass).

### Task 2: Three strengths, Harsha picks

- **Done when:** screenshots of restrained / cinematic / full side by side, and a recording of the picked one; frame rate at phone size with the CPU slowed 4× within 5% of the live site.

### Task 3: Finish

- **Done when:** the picked strength is set; DESIGN.md describes the river; `pnpm test` and `pnpm e2e` pass; committed locally (deploy on Harsha's word).
