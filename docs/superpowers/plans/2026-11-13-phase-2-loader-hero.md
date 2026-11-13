# Phase 2: Loader, Hero and Particle Object Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task, inline. Steps use checkbox (`- [ ]`) syntax for tracking. This session has no TodoWrite tool, so these checkboxes are the running state.

**Goal:** The first screen is the real hero: the name in capitals with letters that rise, a particle object that morphs into each project's symbol as its chapter is reached, a first-visit loader, and a still-image and video fallback for phones, no-WebGL browsers and reduced motion.

**Architecture:** The hero is server-rendered HTML animated by CSS. The particle object is one client component, loaded after first paint, that eases 5,000 points toward a target shape each frame and follows `<html data-theme>`. Shapes are pure functions in `lib/shapes.ts`. The loader is static markup timed by CSS, switched on by a small inline script before first paint.

**Tech Stack:** Next.js 16.4, React 19, Tailwind CSS 4, three 0.187, @react-three/fiber 9, Vitest, Playwright, ffmpeg (for the recorded fallback).

## Global Constraints

- Source of truth: `docs/brief.md` (v2); decisions in `docs/superpowers/specs/2026-11-12-portfolio-inference-design.md` section 6.
- Runtime dependencies added in this phase: `three`, `@react-three/fiber`. Not added: `gsap`, `@react-three/drei`.
- Colour only through the five role utilities and `var(--…)` roles. No hex in components.
- Animate `transform`, `opacity`, `clip-path` and colour only.
- The particle object exists only when `(min-width: 1024px)` matches, WebGL is available and `prefers-reduced-motion` is not `reduce`.
- Under `prefers-reduced-motion: reduce`: no loader, no canvas, no video, letters do not move.
- With JavaScript off: no loader; name, subtitle, status and still image all visible.
- The subtitle is never hidden or animated.
- Copy, exactly: name `Harshavardhanan` (shown in capitals by CSS); subtitle `Software engineer & founder. I build AI products end to end, from model to interface.`; status `currently building Odovox`.
- Media file names: `public/media/hero-loop.mp4`, `public/media/hero-loop.webm`, `public/media/hero-poster.avif`.
- One local commit at the end of the phase, never pushed.

## File map

| File                                                           | Responsibility                                                   |
| -------------------------------------------------------------- | ---------------------------------------------------------------- |
| `app/page.tsx`                                                 | Hero markup; chapters make room for the object                   |
| `app/layout.tsx`                                               | Renders the loader; lets `<html>` carry script-set attributes    |
| `app/globals.css`                                              | Name sizing, letter rise, status dot, stage, loader              |
| `components/Loader.tsx`                                        | Loader markup and the inline script that switches it on          |
| `components/ParticleStage.tsx`                                 | Chooses still image, video or live object; the layer they sit in |
| `components/Particles.tsx`                                     | The WebGL particle object                                        |
| `lib/shapes.ts` + test                                         | The eight point shapes                                           |
| `lib/color.ts` + test                                          | CSS colour string to numbers                                     |
| `scripts/record-hero.mjs`                                      | Records the object into the fallback video and still             |
| `e2e/hero.e2e.ts`, `e2e/loader.e2e.ts`, `e2e/particles.e2e.ts` | Browser checks                                                   |

---

### Task 1: Hero markup and the rising name

**Goal:** The first screen shows the name in capitals filling its line at every width, each letter rising into place, with the subtitle and the status pill.

**Why:** The name is the largest thing on the site; if it overflows at one width or its letter spacing is uneven, that is the first thing a visitor and a juror see.

**Files:**

- Create: `e2e/hero.e2e.ts`
- Modify: `app/page.tsx` (replace the first `<section>`), `app/globals.css` (append)

**Interfaces:**

- Produces: CSS class `name` (sizes text to fill its `@container` parent; children `span` rise in order of `--i`); class `status-dot`. The hero is `<section data-hero>`.

- [x] **Step 1: Write the failing browser test.**

File: `e2e/hero.e2e.ts`

```ts
import { expect, test } from "@playwright/test";

for (const width of [320, 360, 768, 1280, 1920]) {
  test(`the name fills its line without overflowing at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const fit = await page.locator("h1").evaluate((h1) => {
      const first = h1.firstElementChild!.getBoundingClientRect();
      const last = h1.lastElementChild!.getBoundingClientRect();
      return (last.right - first.left) / h1.parentElement!.clientWidth;
    });
    expect(fit).toBeGreaterThan(0.95);
    expect(fit).toBeLessThanOrEqual(1);
  });
}

test("the name is one heading, read as a word, shown in capitals", async ({
  page,
}) => {
  await page.goto("/");
  const h1 = page.locator("h1");
  await expect(h1).toHaveCount(1);
  await expect(h1).toHaveText("Harshavardhanan");
  await expect(h1).toHaveAttribute("aria-label", "Harshavardhanan");
  await expect(h1).toHaveCSS("text-transform", "uppercase");
  await expect(h1.locator("span[aria-hidden]")).toHaveCount(15);
});

test("the subtitle and status are present", async ({ page }) => {
  await page.goto("/");
  const hero = page.locator("[data-hero]");
  await expect(hero).toContainText(
    "Software engineer & founder. I build AI products end to end, from model to interface.",
  );
  await expect(hero).toContainText("currently building Odovox");
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the letters do not move", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1 span").first()).toHaveCSS(
      "animation-name",
      "none",
    );
  });
});
```

- [x] **Step 2: Run it and watch it fail.**

Run: `pnpm e2e e2e/hero.e2e.ts`
Expected: FAIL (the name is not split into letters and does not fill the line).

- [x] **Step 3: Replace the hero section** in `app/page.tsx`. Remove the old first `<section>` (the one holding `<h1 className="text-display">`) and put this in its place; add the `NAME` and `KERN` constants above `export default function Home()`.

```tsx
const NAME = "Harshavardhanan";

// Each letter is its own box so it can rise on its own. Separate boxes lose the
// font's built-in tightening between certain pairs (A next to V), so it is put
// back here by hand: letter number -> how far to pull it left, in em.
const KERN: Record<number, number> = { 6: -0.06, 7: -0.06 };
```

```tsx
<section
  data-hero
  className="px-gutter pt-6 pb-20 lg:flex lg:min-h-[calc(100svh-3.625rem)] lg:flex-col-reverse lg:justify-between lg:pt-[9svh] lg:pb-10"
>
  {/* @container lets the name size itself from this box's width. */}
  <div className="@container">
    <h1 className="name" aria-label={NAME}>
      {[...NAME].map((letter, index) => (
        <span
          key={index}
          aria-hidden
          style={
            {
              "--i": index,
              marginLeft: KERN[index] ? `${KERN[index]}em` : undefined,
            } as React.CSSProperties
          }
        >
          {letter}
        </span>
      ))}
    </h1>
  </div>
  <div className="mt-6 lg:mt-0 lg:max-w-[42%]">
    <p className="text-lead max-w-[34ch]">
      Software engineer &amp; founder. I build AI products end to end, from
      model to interface.
    </p>
    <p className="text-label border-line mt-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono">
      <span className="status-dot" />
      currently building Odovox
    </p>
  </div>
</section>
```

- [x] **Step 4: Append the hero styles** to `app/globals.css`, and delete the `--text-display` token with its two companion lines and the comment above it (nothing uses it now).

```css
/* --- Hero name ----------------------------------------------------------
   The name always fills the width of its container. "HARSHAVARDHANAN" in
   Instrument Serif capitals is about 6.85 times as wide as its font size, so
   dividing the container's width (100cqi) by a little more than that gives a
   font size that fits exactly at any window width. */
.name {
  font-size: calc(100cqi / 6.95);
  line-height: 1;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: clip; /* hides each letter until it rises into view */
}

/* Each letter rises from below the line, one after another. --i is the
   letter's position, set in app/page.tsx. */
.name > span {
  display: inline-block;
  animation: letter-rise 900ms var(--ease-out) backwards;
  animation-delay: calc(var(--i) * 35ms + 100ms);
}

@keyframes letter-rise {
  from {
    transform: translateY(105%);
  }
}

/* While the loader is up, the letters wait. */
html[data-loading="in"] .name > span {
  animation-play-state: paused;
}

/* The small dot in "currently building Odovox". */
.status-dot {
  width: 0.5em;
  height: 0.5em;
  border-radius: 50%;
  background: var(--fg);
  animation: status-pulse 2.4s ease-in-out infinite;
}

@keyframes status-pulse {
  50% {
    opacity: 0.25;
  }
}

@media (prefers-reduced-motion: reduce) {
  .name > span,
  .status-dot {
    animation: none;
  }
}
```

- [x] **Step 5: Measure the letter pairs** and correct `KERN` and the `6.95` divisor. With the built site running, for each neighbouring pair of capitals in the name, compare the width of the pair set as one piece of text with the sum of the two letters set apart; a difference over 0.01em goes into `KERN`. Then measure the whole split name's width divided by its font size; the divisor is that number plus about 1.5%.

- [x] **Step 6: Run the browser tests.**

Run: `pnpm e2e e2e/hero.e2e.ts e2e/shell.e2e.ts`
Expected: 13 passed.

**Done when:** `pnpm e2e e2e/hero.e2e.ts e2e/shell.e2e.ts` reports 13 passed.

---

### Task 2: Loader

**Goal:** On the first visit in a browser session a paper screen shows a counter running to 100 and "H.R.", then fades to reveal the hero; later visits, reduced-motion visitors and visitors without JavaScript never see it.

**Why:** The brief asks for it and the jury scores it; built carelessly it is also the one element that can lock every visitor out of the site, so the ways it stays out of the way are tested as hard as the loader itself.

**Files:**

- Create: `components/Loader.tsx`, `e2e/loader.e2e.ts`
- Modify: `app/layout.tsx` (render `<Loader />` first inside `<body>`; add `suppressHydrationWarning` to `<html>`), `app/globals.css` (append)

**Interfaces:**

- Consumes: class `name` from Task 1.
- Produces: `Loader(): JSX.Element`. While loading, `<html data-loading="in">` for 1400ms, then `data-loading="out"` for 600ms, then the attribute is removed. `sessionStorage["loaded"]` is `"1"` once the loader has been shown.

Motion decisions (animate skill): frequency is once per session, so this is the delight tier; purpose is preventing a jarring change (the page assembling) plus delight. Tool: CSS animation, because it must stay smooth while the page's scripts load. Properties: `opacity`, `clip-path`, and a registered integer for the counter. Curve: `--ease-out`; the exit is a 500ms `ease` fade.

- [x] **Step 1: Write the failing browser test.**

File: `e2e/loader.e2e.ts`

```ts
import { expect, type Page, test } from "@playwright/test";

const loading = (page: Page) =>
  page.evaluate(() => document.documentElement.dataset.loading ?? null);

test("first visit shows the loader, then gets out of the way", async ({
  page,
}) => {
  await page.goto("/");
  expect(await loading(page)).not.toBeNull();
  await expect(page.locator(".loader")).toBeVisible();
  await expect(page.locator(".loader")).toContainText("H.R.");
  await expect.poll(() => loading(page), { timeout: 4000 }).toBeNull();
  await expect(page.locator(".loader")).toBeHidden();
  await expect(page.locator("h1")).toBeVisible();
});

test("a second visit in the same session skips it", async ({ page }) => {
  await page.goto("/");
  await expect.poll(() => loading(page), { timeout: 4000 }).toBeNull();
  await page.reload();
  expect(await loading(page)).toBeNull();
  await expect(page.locator(".loader")).toBeHidden();
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("there is no loader", async ({ page }) => {
    await page.goto("/");
    expect(await loading(page)).toBeNull();
    await expect(page.locator(".loader")).toBeHidden();
  });
});

test("without JavaScript there is no loader and the page is readable", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator(".loader")).toBeHidden();
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("[data-hero]")).toContainText(
    "currently building Odovox",
  );
  await context.close();
});
```

- [x] **Step 2: Run it and watch it fail.**

Run: `pnpm e2e e2e/loader.e2e.ts`
Expected: the first two tests FAIL (no `.loader`, no `data-loading`).

- [x] **Step 3: Write the loader.**

File: `components/Loader.tsx`

```tsx
// The loader is plain HTML and CSS. The only JavaScript is this short script,
// which runs before the page is first drawn and decides whether to show it:
// only on the first visit in this browser session, and never for visitors who
// asked for reduced motion. It marks <html data-loading="in">, switches to
// "out" (the fade) after 1.4s, and removes the mark after 2s. The styles that
// react to those marks are under "Loader" in app/globals.css.
const SCRIPT = `(function () {
  try {
    var html = document.documentElement;
    if (sessionStorage.getItem("loaded")) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    sessionStorage.setItem("loaded", "1");
    html.dataset.loading = "in";
    setTimeout(function () { html.dataset.loading = "out"; }, 1400);
    setTimeout(function () { delete html.dataset.loading; }, 2000);
  } catch (error) {}
})();`;

export function Loader() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
      <div aria-hidden className="loader">
        <p className="loader-count px-gutter text-label text-muted py-5 font-mono" />
        <div className="px-gutter pb-10">
          <div className="@container">
            <p className="name loader-initials font-serif">H.R.</p>
          </div>
        </div>
      </div>
    </>
  );
}
```

- [x] **Step 4: Append the loader styles** to `app/globals.css`.

```css
/* --- Loader (components/Loader.tsx) --------------------------------------
   Hidden unless the inline script has marked <html data-loading>. */
.loader {
  display: none;
}

html[data-loading] .loader {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: var(--bg);
  transition: opacity 500ms ease;
}

html[data-loading="out"] .loader {
  opacity: 0;
}

/* "H.R." is drawn in from the left. */
.loader-initials {
  animation: loader-draw 900ms var(--ease-out) backwards;
}

@keyframes loader-draw {
  from {
    clip-path: inset(0 100% 0 0);
  }
}

/* The counter is a number the browser animates from 0 to 100 and prints
   with leading zeros: 000, 001 ... 100. */
@property --loader-count {
  syntax: "<integer>";
  inherits: false;
  initial-value: 0;
}

@counter-style loader-digits {
  system: numeric;
  symbols: "0" "1" "2" "3" "4" "5" "6" "7" "8" "9";
  pad: 3 "0";
}

.loader-count {
  font-variant-numeric: tabular-nums;
  counter-reset: loader var(--loader-count);
  animation: loader-count 1200ms var(--ease-out) forwards;
}

.loader-count::after {
  content: counter(loader, loader-digits);
}

@keyframes loader-count {
  to {
    --loader-count: 100;
  }
}
```

- [x] **Step 5: Wire it into the layout.** In `app/layout.tsx`: add `import { Loader } from "@/components/Loader";`; add the `suppressHydrationWarning` attribute to `<html>` (the script changes `<html>` before React starts, and this tells React that is expected); render `<Loader />` as the first child of `<body>`.

- [x] **Step 6: Run the browser tests.**

Run: `pnpm e2e e2e/loader.e2e.ts e2e/shell.e2e.ts e2e/theme.e2e.ts`
Expected: 17 passed.

**Done when:** `pnpm e2e e2e/loader.e2e.ts e2e/shell.e2e.ts e2e/theme.e2e.ts` reports 17 passed.

---

### Task 3: Shapes and colour parsing

**Goal:** Eight named point shapes and a CSS-colour parser exist as pure, tested functions.

**Why:** The shapes are the only part of the particle object that can be wrong in a way a browser test cannot see (a `NaN`, a shape of the wrong length, a tooth with no roots); catching that in milliseconds keeps the WebGL work about rendering only.

**Files:**

- Create: `lib/shapes.ts`, `lib/shapes.test.ts`, `lib/color.ts`, `lib/color.test.ts`

**Interfaces:**

- Produces: `COUNT = 5000`; `type ShapeName = "dot" | "cloud" | "waveform" | "tooth" | "road" | "tiles" | "blocks" | "bubble"`; `shapeNames: ShapeName[]`; `shape(name: ShapeName): Float32Array` of length `COUNT * 3`, cached, the same every time; `insideTooth(x: number, y: number): boolean`; `parseColor(css: string): [number, number, number]` with each number from 0 to 1.

- [x] **Step 1: Write the failing tests.**

File: `lib/shapes.test.ts`

```ts
import { expect, test } from "vitest";
import { COUNT, insideTooth, shape, shapeNames } from "./shapes";

test("there are eight shapes", () => {
  expect(shapeNames).toEqual([
    "dot",
    "cloud",
    "waveform",
    "tooth",
    "road",
    "tiles",
    "blocks",
    "bubble",
  ]);
});

test.each(shapeNames)("%s has one finite position per point", (name) => {
  const points = shape(name);
  expect(points).toHaveLength(COUNT * 3);
  expect(points.every(Number.isFinite)).toBe(true);
  expect(Math.max(...points.map(Math.abs))).toBeLessThan(1.7);
});

test("a shape is the same every time it is asked for", () => {
  expect(shape("road")).toBe(shape("road"));
});

test("the dot is tiny and every other shape is not", () => {
  const spread = (name: (typeof shapeNames)[number]) =>
    Math.max(...shape(name).map(Math.abs));
  expect(spread("dot")).toBeLessThan(0.05);
  for (const name of shapeNames.filter((n) => n !== "dot")) {
    expect(spread(name)).toBeGreaterThan(0.5);
  }
});

test("the tooth has a crown, two roots and a gap between them", () => {
  expect(insideTooth(0, 0.4)).toBe(true); // middle of the crown
  expect(insideTooth(0.3, -0.5)).toBe(true); // right root
  expect(insideTooth(-0.3, -0.5)).toBe(true); // left root
  expect(insideTooth(0, -0.6)).toBe(false); // between the roots
  expect(insideTooth(0, 0.9)).toBe(false); // above the crown
  expect(insideTooth(0.9, 0.4)).toBe(false); // beside the crown
});
```

File: `lib/color.test.ts`

```ts
import { expect, test } from "vitest";
import { parseColor } from "./color";

const rounded = (css: string) =>
  parseColor(css).map((n) => Math.round(n * 255));

test("reads the forms a browser reports a colour in", () => {
  expect(rounded("rgb(127, 242, 201)")).toEqual([127, 242, 201]);
  expect(rounded("rgba(127, 242, 201, 0.5)")).toEqual([127, 242, 201]);
  expect(rounded("color(srgb 0.498 0.949 0.788)")).toEqual([127, 242, 201]);
  expect(rounded(" #7ff2c9")).toEqual([127, 242, 201]);
});
```

- [x] **Step 2: Run them and watch them fail.**

Run: `pnpm test lib/shapes.test.ts lib/color.test.ts`
Expected: FAIL, cannot resolve `./shapes` and `./color`.

- [x] **Step 3: Write the colour parser.**

File: `lib/color.ts`

```ts
/**
 * Turns a CSS colour, in any form a browser reports one, into three numbers
 * from 0 to 1 (red, green, blue). Handles "rgb(127, 242, 201)",
 * "color(srgb 0.5 0.95 0.79)" and "#7ff2c9".
 */
export function parseColor(css: string): [number, number, number] {
  const value = css.trim();
  if (value.startsWith("#")) {
    const n = parseInt(value.slice(1, 7), 16);
    return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  const [r, g, b] = (value.match(/[\d.]+/g) ?? []).map(Number);
  const scale = value.startsWith("rgb") ? 255 : 1;
  return [r / scale, g / scale, b / scale];
}
```

- [x] **Step 4: Write the shapes.**

File: `lib/shapes.ts`

```ts
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
  | "bubble";

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
    return [Math.cos(angle) * radius, y * 0.03 * Math.cbrt(rand()), Math.sin(angle) * radius];
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
```

- [x] **Step 5: Run the tests and watch them pass.**

Run: `pnpm test lib/shapes.test.ts lib/color.test.ts`
Expected: PASS, 13 passed.

**Done when:** `pnpm test` reports 37 passed.

---

### Task 4: The particle object

**Goal:** On a desktop browser a particle cloud sits to the right of the hero, drifts, yields to the pointer, and becomes each project's symbol in that project's accent colour as its chapter reaches mid-screen.

**Why:** It is the brief's one connecting idea ("the bridge: one morphing object"). Without it the themed chapters are only colour changes.

**Files:**

- Create: `components/Particles.tsx`, `components/ParticleStage.tsx`, `e2e/particles.e2e.ts`
- Modify: `package.json` (dependencies), `app/page.tsx` (wrap hero and chapters, add the stage, narrow chapter text), `app/globals.css` (append)

**Interfaces:**

- Consumes: `shape`, `COUNT`, `ShapeName` and `parseColor` from Task 3; `<html data-theme>` from Phase 1; `<html data-loading>` from Task 2.
- Produces: `ParticleStage(): JSX.Element` rendering `<div class="stage" data-mode="poster | video | particles">`. While the live object runs, its wrapper carries `data-shape="<ShapeName>"`. `window.__particleTime` (a number) overrides the object's clock, for recording.

Motion decisions (animate skill): the object is ambient and continuous; purpose is spatial consistency (it tells the visitor which project they are in) and, in the hero, delight. Tool: a `requestAnimationFrame` loop (react-three-fiber's), because the target changes at any moment and must be interruptible. Motion model: each point closes a fixed fraction of the remaining distance per unit time (exponential smoothing), which behaves like a critically damped spring and cannot overshoot; points have different rates so a morph arrives as a wave. Idle drift repeats every 8 seconds exactly so it can be recorded as a seamless loop.

- [x] **Step 1: Install.**

```bash
pnpm add three @react-three/fiber && pnpm add -D @types/three
```

- [x] **Step 2: Write the failing browser test.**

File: `e2e/particles.e2e.ts`

```ts
import { expect, type Page, test } from "@playwright/test";

const scrollToChapter = (page: Page, name: string) =>
  page
    .locator(`[data-chapter="${name}"]`)
    .evaluate((el) => el.scrollIntoView({ block: "center" }));

test.describe("desktop", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("the particle object appears and starts as the cloud", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await expect(page.locator(".stage")).toHaveAttribute(
      "data-mode",
      "particles",
    );
    await expect(page.locator(".stage canvas")).toHaveCount(1);
    await expect(page.locator("[data-shape]")).toHaveAttribute(
      "data-shape",
      "cloud",
    );
    expect(errors).toEqual([]);
  });

  for (const [chapter, symbol] of [
    ["road", "road"],
    ["kattral", "tiles"],
    ["cache", "blocks"],
    ["hallucination", "bubble"],
  ]) {
    test(`reaching ${chapter} turns it into the ${symbol}`, async ({
      page,
    }) => {
      await page.goto("/");
      await expect(page.locator("[data-shape]")).toHaveCount(1);
      await scrollToChapter(page, chapter);
      await expect(page.locator("[data-shape]")).toHaveAttribute(
        "data-shape",
        symbol,
      );
    });
  }

  test("reaching odovox plays the waveform, then the tooth", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("[data-shape]")).toHaveCount(1);
    await scrollToChapter(page, "odovox");
    await expect(page.locator("[data-shape]")).toHaveAttribute(
      "data-shape",
      "waveform",
    );
    await expect(page.locator("[data-shape]")).toHaveAttribute(
      "data-shape",
      "tooth",
    );
  });

  test("leaving the chapters returns it to the cloud", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-shape]")).toHaveCount(1);
    await scrollToChapter(page, "cache");
    await expect(page.locator("[data-shape]")).toHaveAttribute(
      "data-shape",
      "blocks",
    );
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.locator("[data-shape]")).toHaveAttribute(
      "data-shape",
      "cloud",
    );
  });
});

test.describe("phone", () => {
  test.use({
    viewport: { width: 360, height: 740 },
    hasTouch: true,
    isMobile: true,
  });

  test("there is no canvas", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".stage")).toHaveAttribute("data-mode", "video");
    await expect(page.locator("canvas")).toHaveCount(0);
  });
});

test.describe("desktop with reduced motion", () => {
  test.use({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });

  test("there is no canvas and no video", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header time")).toHaveText(/^\d\d:\d\d IST$/);
    await expect(page.locator(".stage")).toHaveAttribute("data-mode", "poster");
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.locator("video")).toHaveCount(0);
  });
});
```

- [x] **Step 3: Write the particle object.**

File: `components/Particles.tsx`

```tsx
"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { parseColor } from "@/lib/color";
import { COUNT, type ShapeName, shape } from "@/lib/shapes";

declare global {
  interface Window {
    /** Set by scripts/record-hero.mjs to step the animation frame by frame. */
    __particleTime?: number;
  }
}

const LOOP = 8; // seconds; the idle drift repeats exactly, so it records as a seamless loop
const CAMERA = { position: [0, 0, 5] as [number, number, number], fov: 30 };
const VIEW = Math.tan((15 * Math.PI) / 180) * 5; // half of what the camera sees, in scene units
const REACH = 0.45; // how close the pointer must be to push a point
const PUSH = 0.16; // how far it pushes

// Which shapes a theme shows, in order. Anything not listed shows the cloud.
const SEQUENCE: Record<string, ShapeName[]> = {
  odovox: ["waveform", "tooth"],
  road: ["road"],
  kattral: ["tiles"],
  cache: ["blocks"],
  hallucination: ["bubble"],
};

// One fixed random number (0 to 1) per point, used to vary its speed and drift.
const seeds = new Float32Array(COUNT);
for (let i = 0, s = 99; i < COUNT; i++) {
  s = (s * 16807) % 2147483647;
  seeds[i] = s / 2147483647;
}

function Swarm({ onShape }: { onShape: (name: ShapeName) => void }) {
  const canvas = useThree((state) => state.gl.domElement);
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.PointsMaterial>(null);
  const goal = useRef(shape("cloud")); // the shape the points are heading for
  const pointer = useRef({ x: 99, y: 99 }); // far away until the mouse moves
  const frame = useRef({ last: 0, drift: 0.05 });

  const { start, sprite } = useMemo(() => {
    // During the loader the object begins as a dot; otherwise as the cloud.
    const loading = document.documentElement.dataset.loading !== undefined;
    // A soft round dot, drawn once and used for every point.
    const dot = document.createElement("canvas");
    dot.width = dot.height = 64;
    const ctx = dot.getContext("2d")!;
    const glow = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    glow.addColorStop(0, "white");
    glow.addColorStop(0.35, "white");
    glow.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 64, 64);
    return {
      start: shape(loading ? "dot" : "cloud").slice(),
      sprite: new THREE.CanvasTexture(dot),
    };
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    let timer = 0;

    const show = (name: ShapeName) => {
      goal.current = shape(name);
      onShape(name);
    };

    // Runs now, and whenever the page's theme or loading state changes.
    const sync = () => {
      window.clearTimeout(timer);
      if (html.dataset.loading === "in") return show("dot");
      const [first, second] = SEQUENCE[html.dataset.theme ?? ""] ?? ["cloud"];
      show(first);
      if (second) timer = window.setTimeout(() => show(second), 1600);
    };

    // Where the pointer is, in the same units as the shapes.
    const onMove = (event: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      pointer.current.x =
        (((event.clientX - box.left) / box.width) * 2 - 1) * VIEW;
      pointer.current.y =
        -(((event.clientY - box.top) / box.height) * 2 - 1) * VIEW;
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(html, {
      attributes: true,
      attributeFilter: ["data-theme", "data-loading"],
    });
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [canvas, onShape]);

  // Runs once per screen refresh.
  useFrame((state) => {
    const cloud = points.current;
    if (!cloud || !material.current) return;

    const time = window.__particleTime ?? state.clock.elapsedTime;
    const dt = Math.min(Math.max(time - frame.current.last, 0), 0.05);
    frame.current.last = time;

    const target = goal.current;
    const attribute = cloud.geometry.attributes
      .position as THREE.BufferAttribute;
    const now = attribute.array as Float32Array;
    const wave = (Math.PI * 2 * time) / LOOP;

    // The cloud drifts freely; a symbol holds its shape and only shimmers.
    const wanted = target === shape("cloud") ? 0.05 : 0.012;
    frame.current.drift +=
      (wanted - frame.current.drift) * (1 - Math.exp(-dt * 2));
    const drift = frame.current.drift;
    const { x: px, y: py } = pointer.current;

    for (let i = 0; i < COUNT; i++) {
      const j = i * 3;
      const seed = seeds[i];
      const phase = seed * Math.PI * 2;

      // Where this point wants to be: its place in the shape, plus a slow drift...
      let x = target[j] + drift * Math.sin(wave + phase);
      let y = target[j + 1] + drift * Math.cos(wave * 2 + phase * 1.7);
      const z = target[j + 2] + drift * Math.sin(wave + phase * 2.3);

      // ...pushed aside if the pointer is close.
      const dx = x - px;
      const dy = y - py;
      const distance = Math.hypot(dx, dy);
      if (distance < REACH) {
        const force = (1 - distance / REACH) ** 2 * PUSH;
        x += (dx / (distance || 1)) * force;
        y += (dy / (distance || 1)) * force;
      }

      // Close a fraction of the gap. Each point has its own pace, so a change
      // of shape arrives as a wave, and it can never overshoot.
      const k = 1 - Math.exp(-dt * (2 + 4 * seed));
      now[j] += (x - now[j]) * k;
      now[j + 1] += (y - now[j + 1]) * k;
      now[j + 2] += (z - now[j + 2]) * k;
    }
    attribute.needsUpdate = true;

    // A slow sway of the whole object.
    cloud.rotation.y = 0.22 * Math.sin(wave);
    cloud.rotation.x = 0.06 * Math.cos(wave);

    // Take the colour from the page's theme, so it fades in step with it.
    const accent = getComputedStyle(document.documentElement).getPropertyValue(
      "--accent",
    );
    const [r, g, b] = parseColor(accent);
    material.current.color.setRGB(r, g, b, THREE.SRGBColorSpace);
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[start, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={material}
        map={sprite}
        size={0.034}
        sizeAttenuation
        transparent
        opacity={0.8}
        depthWrite={false}
      />
    </points>
  );
}

export default function Particles({ onReady }: { onReady: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(true);

  // Stop drawing while the object is scrolled out of view.
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) =>
      setOnScreen(entry.isIntersecting),
    );
    observer.observe(wrap.current!);
    return () => observer.disconnect();
  }, []);

  const onShape = useCallback((name: ShapeName) => {
    if (wrap.current) wrap.current.dataset.shape = name;
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        flat
        frameloop={onScreen ? "always" : "never"}
        dpr={[1, 2]}
        camera={CAMERA}
        gl={{ antialias: false, alpha: true }}
        style={{ pointerEvents: "none" }}
        onCreated={onReady}
      >
        <Swarm onShape={onShape} />
      </Canvas>
    </div>
  );
}
```

- [x] **Step 4: Write the stage.**

File: `components/ParticleStage.tsx`

```tsx
"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState, useSyncExternalStore } from "react";

// three.js is large, so it is fetched only when the live object will be
// shown, and only after the page has first been drawn.
const Particles = dynamic(() => import("./Particles"), { ssr: false });

// What the stage shows:
//   "poster"     a still image (the server's answer, and reduced motion's)
//   "video"      the looping video (phones, tablets, no WebGL)
//   "particles"  the live object (desktop)
type Mode = "poster" | "video" | "particles";

const WIDE = "(min-width: 1024px)";
const REDUCE = "(prefers-reduced-motion: reduce)";

let webgl: boolean | undefined;
function hasWebGL() {
  if (webgl === undefined) {
    const canvas = document.createElement("canvas");
    webgl = !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  }
  return webgl;
}

function subscribe(onChange: () => void) {
  const queries = [WIDE, REDUCE].map((query) => window.matchMedia(query));
  queries.forEach((query) => query.addEventListener("change", onChange));
  return () =>
    queries.forEach((query) => query.removeEventListener("change", onChange));
}

function getMode(): Mode {
  if (window.matchMedia(REDUCE).matches) return "poster";
  return window.matchMedia(WIDE).matches && hasWebGL() ? "particles" : "video";
}

const getServerMode = (): Mode => "poster";

export function ParticleStage() {
  const mode = useSyncExternalStore(subscribe, getMode, getServerMode);
  const [drawn, setDrawn] = useState(false); // the live object has drawn a frame
  const live = mode === "particles" && drawn;

  return (
    // The still and the video have a white background. "multiply" blending
    // makes white vanish into whatever colour the page is.
    <div
      aria-hidden
      data-mode={mode}
      className={`stage ${live ? "" : "mix-blend-multiply"}`}
    >
      <div className="stage-box">
        {!live && (
          <Image
            src="/media/hero-poster.avif"
            alt=""
            width={720}
            height={720}
            loading="eager"
            sizes="(min-width: 1024px) 34vw, 100vw"
            className="absolute inset-0 size-full object-cover"
          />
        )}
        {mode === "video" && (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 size-full object-cover"
          >
            <source src="/media/hero-loop.webm" type="video/webm" />
            <source src="/media/hero-loop.mp4" type="video/mp4" />
          </video>
        )}
        {mode === "particles" && <Particles onReady={() => setDrawn(true)} />}
      </div>
    </div>
  );
}
```

- [x] **Step 5: Append the stage styles** to `app/globals.css`.

```css
/* --- Particle stage (components/ParticleStage.tsx) -----------------------
   The layer that holds the particle object, its still image and its video.
   On a phone it is an ordinary block above the name. On a desktop it sticks
   to the window from the hero to the end of the last chapter, behind the
   text; the negative margin stops it pushing the hero down. */
.stage {
  position: relative;
  z-index: -1;
  padding-inline: var(--spacing-gutter);
  pointer-events: none;
}

.stage-box {
  position: relative;
  margin-inline: auto;
  width: 100%;
  max-width: 28rem;
  aspect-ratio: 1;
}

@media (min-width: 1024px) {
  .stage {
    position: sticky;
    top: 0;
    height: 100svh;
    margin-bottom: -100svh;
  }

  .stage-box {
    position: absolute;
    top: 44%;
    right: var(--spacing-gutter);
    width: min(34vw, 60svh);
    max-width: none;
    translate: 0 -50%;
  }
}

.stage img,
.stage video {
  transition: opacity 600ms ease;
}

/* During the loader the stage sits above it, so the dot is visible, and the
   still and video stay out of sight until the loader has gone. */
html[data-loading] .stage {
  z-index: 90;
}

html[data-loading] .stage img,
html[data-loading] .stage video {
  opacity: 0;
}
```

- [x] **Step 6: Put the stage on the page.** In `app/page.tsx`: add `import { ParticleStage } from "@/components/ParticleStage";`. Wrap the hero `<section data-hero>` and the `<div id="work">` together in one `<div>` whose first child is `<ParticleStage />`, with this comment above it: `{/* The particle object stays on screen from here to the end of the last chapter. */}`. In each chapter, change the content column from `col-span-10 md:col-span-9` to `col-span-10 lg:col-span-6` so the text leaves room for the object.

- [x] **Step 7: Run the browser test.** The still image does not exist until Task 5, so the image request 404s for now; that does not affect these checks.

Run: `pnpm e2e e2e/particles.e2e.ts`
Expected: 9 passed.

**Done when:** `pnpm e2e e2e/particles.e2e.ts` reports 9 passed.

---

### Task 5: Recorded fallback

**Goal:** Phones, tablets, no-WebGL browsers, reduced-motion visitors and no-JavaScript visitors see the particle cloud as a looping video or a still, blended seamlessly into the page.

**Why:** Most recruiters will first open the link on a phone, where the live object is deliberately not created; without this the phone hero has an empty square.

**Files:**

- Create: `scripts/record-hero.mjs`, `public/media/hero-loop.mp4`, `public/media/hero-loop.webm`, `public/media/hero-poster.avif`
- Modify: `package.json` (script `record:hero`), `e2e/particles.e2e.ts` (append), `CLAUDE.md` (one line under Commands)

**Interfaces:**

- Consumes: `window.__particleTime` and `[data-shape]` from Task 4; `sessionStorage["loaded"]` from Task 2.
- Produces: the three media files; `pnpm record:hero` regenerates them from a running production build.

- [x] **Step 1: Append the failing browser tests** to `e2e/particles.e2e.ts`.

```ts
test("the fallback media is served", async ({ request }) => {
  for (const [path, type] of [
    ["/media/hero-poster.avif", "image/avif"],
    ["/media/hero-loop.webm", "video/webm"],
    ["/media/hero-loop.mp4", "video/mp4"],
  ]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    expect(response.headers()["content-type"]).toContain(type);
  }
});

test.describe("phone fallback", () => {
  test.use({
    viewport: { width: 360, height: 740 },
    hasTouch: true,
    isMobile: true,
  });

  test("the video plays", async ({ page }) => {
    await page.goto("/");
    const video = page.locator(".stage video");
    await expect(video).toHaveCount(1);
    await expect
      .poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime))
      .toBeGreaterThan(0);
  });
});

test("without JavaScript the still image is shown", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  const still = page.locator(".stage img");
  await expect(still).toBeVisible();
  expect(
    await still.evaluate((img: HTMLImageElement) => img.naturalWidth),
  ).toBeGreaterThan(0);
  await context.close();
});
```

- [x] **Step 2: Run them and watch them fail.**

Run: `pnpm e2e e2e/particles.e2e.ts`
Expected: the three new tests FAIL (404s).

- [x] **Step 3: Write the recorder.**

File: `scripts/record-hero.mjs`

```js
// Records the live particle cloud into the fallback video and still image:
//   public/media/hero-loop.mp4, hero-loop.webm, hero-poster.avif
//
// How to run it:
//   1. pnpm build && pnpm start --port 3100     (leave it running)
//   2. pnpm record:hero                         (in a second terminal)
//
// It opens the site in Chrome, turns the page white, hides everything except
// the particle object, and steps the object's clock one frame at a time
// through one 8-second loop, saving a picture of each frame. ffmpeg joins the
// pictures into the two videos. Because the object's drift repeats exactly
// every 8 seconds, the video loops seamlessly.
// Needs Google Chrome, ffmpeg and ImageMagick (magick).
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const URL = process.argv[2] ?? "http://localhost:3100/";
const FPS = 24;
const SECONDS = 8;
const VIDEO = 480; // pixels square; thousands of moving dots make large files
const STILL = 720;
const OUT = "public/media";

const frames = mkdtempSync(join(tmpdir(), "hero-frames-"));
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 2,
});

// Skip the loader and take control of the object's clock.
await page.addInitScript(() => {
  sessionStorage.setItem("loaded", "1");
  window.__particleTime = -8;
});
await page.goto(URL);
await page.addStyleTag({
  content: `
    html { background: white !important }
    body::after { display: none }
    header, [data-hero], #work { visibility: hidden }
  `,
});
await page.locator('[data-shape="cloud"]').waitFor();

// Sets the clock, then waits two screen refreshes so the frame is drawn.
const step = (time) =>
  page.evaluate(
    (t) =>
      new Promise((done) => {
        window.__particleTime = t;
        requestAnimationFrame(() => requestAnimationFrame(done));
      }),
    time,
  );

// One loop to let the points settle, then one loop recorded.
for (let i = 0; i < FPS * SECONDS; i++) await step(i / FPS - SECONDS);
const box = page.locator(".stage-box");
for (let i = 0; i < FPS * SECONDS; i++) {
  await step(i / FPS);
  await box.screenshot({
    path: join(frames, `${String(i).padStart(4, "0")}.png`),
  });
}
await browser.close();

// Each line is one ffmpeg command: the pictures in, one video out.
const ffmpeg = (...output) =>
  execFileSync(
    "ffmpeg",
    [
      ...["-y", "-framerate", FPS, "-i", join(frames, "%04d.png")],
      ...["-vf", `scale=${VIDEO}:${VIDEO}:flags=lanczos`, "-an"],
      ...["-pix_fmt", "yuv420p", ...output],
    ].map(String),
    { stdio: "ignore" },
  );
ffmpeg(
  "-c:v",
  "libx264",
  "-crf",
  32,
  "-preset",
  "slow",
  "-movflags",
  "+faststart",
  `${OUT}/hero-loop.mp4`,
);
ffmpeg("-c:v", "libvpx-vp9", "-b:v", 0, "-crf", 45, `${OUT}/hero-loop.webm`);

execFileSync("magick", [
  join(frames, "0000.png"),
  ...["-resize", `${STILL}x${STILL}`, "-strip", "-quality", "55"],
  `${OUT}/hero-poster.avif`,
]);
rmSync(frames, { recursive: true });
console.log(`Recorded ${FPS * SECONDS} frames into ${OUT}`);
```

- [x] **Step 4: Add the script** `"record:hero": "node scripts/record-hero.mjs"` to `package.json`, and under Commands in `CLAUDE.md` add: ``- `pnpm record:hero` — re-records the hero's fallback video and still from the live particle object (needs `pnpm build && pnpm start --port 3100` running, ffmpeg and ImageMagick)``.

- [x] **Step 5: Record.**

```bash
pnpm build && (pnpm start --port 3100 &) && sleep 3 && pnpm record:hero; lsof -nP -tiTCP:3100 -sTCP:LISTEN | xargs kill
ls -la public/media/
```

Expected: the three files exist; each video is under 3 MB.

- [x] **Step 6: Check the loop and the blend by eye.** Extract the first and last frames of the MP4 and compare them; view a phone screenshot of the hero and confirm no rectangle is visible around the cloud.

- [x] **Step 7: Run the browser test.**

Run: `pnpm e2e e2e/particles.e2e.ts`
Expected: 12 passed.

**Done when:** `pnpm e2e e2e/particles.e2e.ts` reports 12 passed and `ls public/media` lists `hero-loop.mp4`, `hero-loop.webm`, `hero-poster.avif`.

---

### Task 6: Phase verification, inspection and commit

**Goal:** Phase 2 is proven as a whole, every shape and screen size has been looked at, and the phase is saved as one commit.

**Why:** Tests prove the object reports the right shape name; only looking proves a tooth reads as a tooth.

**Files:**

- Modify: whatever the inspection round shows needs fixing (shape constants in `lib/shapes.ts`, sizes in `app/globals.css`)

- [x] **Step 1: Run everything.**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm e2e`
Expected: exit 0; Vitest 37 passed; Playwright 44 passed.

- [x] **Step 2: Run the design detector once.**

Run: `node ~/.agents/skills/impeccable/scripts/detect.mjs --json app components`
Expected: no findings beyond what the brief pins.

- [x] **Step 3: Capture and inspect**, in one batch: the loader mid-count (desktop and phone); the hero at 360, 768, 1280 and 1920; each of the seven visible shapes on desktop in its theme; the phone hero. Judge: does each symbol read at a glance; does the name sit clear of the object; is any text covered by particles; is the letter spacing even. Fix everything in one batch, re-record the fallback if the cloud changed, capture once more. Two rounds at most.

- [x] **Step 4: Re-run Step 1** if anything changed.

- [x] **Step 5: Commit.**

```bash
git add -A && git commit -m "Phase 2: loader, hero and particle object"
```

**Done when:** `pnpm typecheck && pnpm lint && pnpm test && pnpm e2e; echo $?` prints `0`, and `git log --oneline` shows the Phase 2 commit.

---

## Deferred, on purpose

- **GSAP**: Phase 3, with scroll reveals and count-ups.
- **Morph on hovering a project** in the work index: Phase 3, when the index exists. The object already follows one attribute, so this is one more writer of it.
- **Static cover images in chapters on phones**: Phase 3, with the chapters.
- **Impeccable finish review and `DESIGN.md`**: end of Phase 3, when the page is no longer a skeleton below the hero.

## As built (differences from the first draft above)

- `KERN` holds all thirteen measured letter pairs, not only AV and VA, and the name's divisor is 6.97.
- `e2e/shell.e2e.ts` reads the body typeface from `[data-hero] p`, since the subtitle is no longer the `h1`'s next sibling.
- The per-point random seeds are built once at the top of `components/Particles.tsx`, because the linter forbids reassigning a variable inside a component.
- After looking at the shapes: the cloud is a hollow sphere (80% of points on the surface), the road is 25% larger, the block stack has more points on edges than faces, and the loader's dot is round.
- Chapter text is 5 columns wide on desktop, not 6, so the widest symbol (the waveform) never touches it.
- The video is 480px at 24 frames a second (644 KB MP4, 1.4 MB WebM); the first recording at 720px and 30 was 3.8 MB. The MP4 is listed first because for this footage it is the smaller file. The recorder hides everything but the object, since the hero's name otherwise shows in the bottom of each frame.
