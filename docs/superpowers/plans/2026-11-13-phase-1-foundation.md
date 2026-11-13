# Phase 1: Foundation Implementation Plan (brief v2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task, inline. Steps use checkbox (`- [ ]`) syntax for tracking. This session has no TodoWrite tool, so these checkboxes are the running state.

**Goal:** A running Next.js project in which the neutral tokens, the three typefaces, the page shell, smooth scrolling and the per-project theme system all work and are tested.

**Architecture:** Server-rendered App Router pages styled with Tailwind 4. Every colour is read through five roles (`bg`, `fg`, `muted`, `accent`, `line`); a theme is one CSS block that assigns them, and the browser fades between themes by itself. Three small client components (clock, smooth scroll, theme watcher) enhance HTML that is complete without them.

**Tech Stack:** Next.js 16.4, React 19, TypeScript strict, Tailwind CSS 4, Lenis 1.3, Vitest, Playwright (driving the installed Google Chrome), pnpm.

## Global Constraints

- Source of truth for copy and visuals: `docs/brief.md` (v2). Decisions it left open: `docs/superpowers/specs/2026-11-12-portfolio-inference-design.md`.
- Neutral colours, exactly: ink `#0E0E0E`, paper `#F4F2EE`, grey `#8A877F`, line `#D9D5CC`, plus `#66635C` for secondary text on paper.
- Project themes (background / accent): odovox `#0F1F1C` / `#7FF2C9`, road `#121212` / `#FFC93C`, kattral `#1C1410` / `#FF8A3D`, cache `#0B1020` / `#4D8BFF`, hallucination `#16111F` / `#B69CFF`.
- Components use only the role utilities (`bg-bg`, `text-fg`, `text-muted`, `text-accent`, `border-line`). No component names a hex colour.
- In every theme, `fg`, `muted` and `accent` are each at least 4.5:1 on `bg`.
- Typefaces: Instrument Serif (display), Inter Tight (body), JetBrains Mono (labels and numbers), loaded with `next/font/google`.
- Runtime dependency added in this phase: `lenis` only.
- Under `prefers-reduced-motion`: no smooth scroll; theme change is a 200ms fade.
- The page must be readable and navigable with JavaScript off, and at 360px wide.
- pnpm only. No commit until Task 6; then one local commit, never pushed. The file `potrait` in the repo root is not committed.
- No phone number on the site. Public email: `harshavardhananrajasimhan@gmail.com`.

## File map

| File                          | Responsibility                                                          |
| ----------------------------- | ----------------------------------------------------------------------- |
| `app/globals.css`             | Tokens, the seven themes, base element styles, grain                    |
| `app/layout.tsx`              | Fonts, metadata, skip link, header, `<main>`, smooth scroll             |
| `app/page.tsx`                | Temporary one-page skeleton: name, five themed chapters, about, contact |
| `app/tokens.test.ts`          | Contrast check on every theme                                           |
| `content/projects.ts`         | The five projects: slug, title, role, pitch                             |
| `components/ArrowUpRight.tsx` | The one icon, drawn as SVG                                              |
| `components/Header.tsx`       | Identity, clock, navigation                                             |
| `components/Clock.tsx`        | Live Chennai time                                                       |
| `components/SmoothScroll.tsx` | Starts and stops Lenis                                                  |
| `components/ThemeWatcher.tsx` | Tells the page which chapter is on screen                               |
| `lib/ist.ts` + test           | `Date` to `"23:41"` in Chennai time                                     |
| `e2e/*.e2e.ts`                | Browser checks, one file per task                                       |
| `public/grain.png`            | 128px noise tile for the film grain                                     |
| `CLAUDE.md`                   | What the project is and how to run it                                   |

---

### Task 1: Project scaffold and tooling

**Goal:** The repo is a Next.js 16 TypeScript project whose `typecheck`, `lint` and `build` scripts all pass.

**Why:** Nothing else can be built or checked until the toolchain runs.

**Files:**

- Create: everything `create-next-app` generates, `playwright.config.ts`, `CLAUDE.md`
- Modify: `package.json` (scripts), `.gitignore`

**Interfaces:**

- Produces: scripts `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `e2e`, `format`; import alias `@/*` to the repo root; Playwright serving the production build at `http://localhost:3100`, picking up files named `*.e2e.ts`.

- [x] **Step 1: Scaffold** with `create-next-app@16.4.6` in a lowercase scratch folder (npm rejects the capital in `Harshavardhanan` as a package name) and copy it in, without its README.
- [x] **Step 2: Install** `lenis`, and as dev dependencies `vitest`, `prettier`, `@playwright/test`.
- [x] **Step 3: Add scripts** `typecheck` (`tsc --noEmit`), `test` (`vitest run`), `e2e` (`playwright test`), `format` (`prettier --write .`).
- [x] **Step 4: Write the Playwright config.**

File: `playwright.config.ts`

```ts
import { defineConfig } from "@playwright/test";

// Browser checks run against the production build, in the Google Chrome that
// is already installed, so no extra browser download is needed.
export default defineConfig({
  testDir: "e2e",
  testMatch: "**/*.e2e.ts",
  use: { baseURL: "http://localhost:3100", channel: "chrome" },
  webServer: {
    command: "pnpm build && pnpm start --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
```

- [x] **Step 5: Ignore test output** (`/test-results/`, `/playwright-report/` in `.gitignore`).
- [x] **Step 6: Write the project `CLAUDE.md`** (rewritten for brief v2).

File: `CLAUDE.md`

```md
# Harshavardhanan — portfolio

Personal portfolio of Harshavardhanan Rajasimhan. A neutral editorial shell (paper and
ink); scrolling into a project turns the whole page into that project's colour world.

@AGENTS.md

## Read first

- `docs/brief.md` — the brief (v2), verbatim. Source of truth for copy, palette, type, site map.
- `docs/superpowers/specs/2026-11-12-portfolio-inference-design.md` — decisions the brief left open.
- `PRODUCT.md` — who the site is for. Recruiters win over spectacle.
- `docs/superpowers/plans/` — one plan per phase. Six phases; stop for review after each.

## Stack

Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS 4 (tokens live in
`app/globals.css`, there is no tailwind.config), Lenis. pnpm only.

## Commands

- `pnpm dev` — dev server on http://localhost:3000 (the next free port if 3000 is taken)
- `pnpm test` — unit tests (Vitest, files named `*.test.ts`)
- `pnpm e2e` — browser tests (Playwright, files named `*.e2e.ts`; builds and serves on port 3100, needs Google Chrome)
- `pnpm typecheck` · `pnpm lint` · `pnpm build`

## Rules

- Colour: components use only the five role utilities (`bg-bg`, `text-fg`, `text-muted`,
  `text-accent`, `border-line`). Hex values live only in the theme blocks in
  `app/globals.css`; `app/tokens.test.ts` checks every theme for AA contrast.
- A project's `slug` in `content/projects.ts` is also its theme name and its
  `data-chapter` value.
- Animate `transform`, `opacity` and colour only, and honour `prefers-reduced-motion`.
- Every page works with JavaScript off, with a keyboard, and at 360px wide.
- One local commit per finished phase. Never push. Do not commit `potrait`.
```

- [x] **Step 7: Run the checks.** `pnpm typecheck && pnpm lint && pnpm build` exited 0 on 2026-11-12; the build listed the route `/`.

**Done when:** `pnpm typecheck && pnpm lint && pnpm build; echo $?` prints `0`.

---

### Task 2: Tokens, themes, typefaces and the page skeleton

**Goal:** The home page renders the real name, subtitle, five project chapters, about facts and contact links in the three typefaces on paper, with a skip link, and no theme has a text colour below AA.

**Why:** Every later phase draws from these tokens and themes. A wrong role or an unloaded font found later means restyling every section built on it; a theme that fails contrast would be copied into five chapters and five case studies.

**Files:**

- Create: `content/projects.ts`, `public/grain.png`, `components/ArrowUpRight.tsx`
- Replace: `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `app/tokens.test.ts`, `e2e/shell.e2e.ts`

**Interfaces:**

- Produces: Tailwind utilities `bg-`/`text-`/`border-` + `bg | fg | muted | accent | line`; `text-display | text-title | text-lead | text-body | text-label`; `font-serif | font-sans | font-mono`; `px-gutter`; `ease-out`. Theme names `neutral | ink | odovox | road | kattral | cache | hallucination`, applied with `data-theme="…"` on any element. `<main id="main">`. `projects: Project[]` with `{ slug, title, role?, pitch }`. Each chapter is `<section data-chapter={slug}>`. Section ids `work`, `about`, `contact`.

- [x] **Step 1: Write the failing contrast test.**

File: `app/tokens.test.ts`

```ts
import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

// Reads the themes straight out of the stylesheet, so there is one place to
// change a colour and this test always checks the real values.
const css = readFileSync(new URL("./globals.css", import.meta.url), "utf8");

// Finds every block that starts [data-theme="name"] and collects its roles,
// for example { name: "road", roles: { bg: "#121212", accent: "#ffc93c" } }.
const themes = [
  ...css.matchAll(/\[data-theme="([a-z]+)"\][^{}]*\{([^}]*)\}/g),
].map(([, name, body]) => ({
  name,
  roles: Object.fromEntries(
    [...body.matchAll(/--([a-z]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [
      m[1],
      m[2],
    ]),
  ),
}));

// WCAG relative luminance of a #rrggbb colour.
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

test("the stylesheet defines all seven themes", () => {
  expect(themes.map((theme) => theme.name).sort()).toEqual([
    "cache",
    "hallucination",
    "ink",
    "kattral",
    "neutral",
    "odovox",
    "road",
  ]);
});

describe.each(themes)("$name theme", ({ roles }) => {
  test.each(["fg", "muted", "accent"])(
    "%s text on the background meets WCAG AA",
    (role) => {
      expect(contrast(roles[role], roles.bg)).toBeGreaterThanOrEqual(4.5);
    },
  );
});
```

- [x] **Step 2: Run it and watch it fail.**

Run: `pnpm test`
Expected: FAIL on "the stylesheet defines all seven themes" (the stylesheet has no themes yet).

- [x] **Step 3: Write the browser test.**

File: `e2e/shell.e2e.ts`

```ts
import { expect, test } from "@playwright/test";

test.describe("desktop", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("renders the three typefaces", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const family = (selector: string) =>
      page
        .locator(selector)
        .first()
        .evaluate((el) => getComputedStyle(el).fontFamily);
    expect(await family("h1")).toContain("Instrument Serif");
    expect(await family("h1 + p")).toContain("Inter Tight");
    expect(await family("main dl")).toContain("JetBrains Mono");
    for (const name of ["Instrument Serif", "Inter Tight", "JetBrains Mono"]) {
      expect(
        await page.evaluate((n) => document.fonts.check(`16px "${n}"`), name),
      ).toBe(true);
    }
  });

  test("has exactly one h1, and it is the name", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText("Harshavardhanan");
  });

  test("shows the five projects in order", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-chapter] h2")).toHaveText([
      "Odovox",
      "Automated Road Damage Survey",
      "Kattral Academy",
      "Edge Cache RL",
      "Hallucination Detection in LLMs",
    ]);
  });

  test("keyboard: the skip link comes first and lands in main", async ({
    page,
  }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveText("Skip to content");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() => !!document.activeElement?.closest("main")),
    ).toBe(true);
  });
});

test.describe("phone", () => {
  test.use({
    viewport: { width: 360, height: 740 },
    hasTouch: true,
    isMobile: true,
  });

  test("nothing overflows sideways at 360px", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
```

- [x] **Step 4: Make the grain tile.**

```bash
magick -size 128x128 xc: +noise Random -colorspace Gray -strip public/grain.png
```

- [x] **Step 5: Write the stylesheet.**

File: `app/globals.css`

```css
@import "tailwindcss";

/* Design tokens. Tailwind turns each one into utility classes:
   --text-lead gives text-lead; --spacing-gutter gives px-gutter. */
@theme {
  /* Wipe Tailwind's default palette and type scale, so only ours exist. */
  --color-*: initial;
  --text-*: initial;

  /* Fluid type: clamp(smallest, grows with the window, largest). */
  /* The name is 15 letters, about 5.9 times its font size wide. On a phone
     14.5vw makes it fill the width; on wider screens the second value takes
     over so it leaves room beside it. */
  --text-display: min(14.5vw, 3rem + 5vw, 12rem);
  --text-display--line-height: 0.9;
  --text-display--letter-spacing: -0.02em;
  --text-title: clamp(2rem, 1.2rem + 3.5vw, 4.5rem);
  --text-title--line-height: 1.02;
  --text-title--letter-spacing: -0.015em;
  --text-lead: clamp(1.25rem, 1.05rem + 0.9vw, 1.75rem);
  --text-lead--line-height: 1.3;
  --text-body: clamp(1rem, 0.95rem + 0.2vw, 1.125rem);
  --text-body--line-height: 1.55;
  --text-label: 0.75rem;
  --text-label--line-height: 1.5;
  --text-label--letter-spacing: 0.02em;

  /* Side margin of the page. */
  --spacing-gutter: clamp(1rem, 4vw, 4rem);

  /* One strong ease-out for things that enter or respond. */
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
}

/* Colours are never used by name. Components use five ROLES, and the active
   theme decides what each role is: bg-bg, text-fg, text-muted, text-accent,
   border-line. The font files are loaded in app/layout.tsx. */
@theme inline {
  --color-bg: var(--bg);
  --color-fg: var(--fg);
  --color-muted: var(--muted);
  --color-accent: var(--accent);
  --color-line: var(--line);

  --font-serif: var(--font-instrument-serif), "Times New Roman", serif;
  --font-sans: var(--font-inter-tight), system-ui, sans-serif;
  --font-mono: var(--font-jetbrains-mono), ui-monospace, monospace;
}

/* Telling the browser these five variables are colours lets it fade them
   smoothly when the theme changes, with no JavaScript animation. */
@property --bg {
  syntax: "<color>";
  inherits: true;
  initial-value: #f4f2ee;
}
@property --fg {
  syntax: "<color>";
  inherits: true;
  initial-value: #0e0e0e;
}
@property --muted {
  syntax: "<color>";
  inherits: true;
  initial-value: #66635c;
}
@property --accent {
  syntax: "<color>";
  inherits: true;
  initial-value: #0e0e0e;
}
@property --line {
  syntax: "<color>";
  inherits: true;
  initial-value: #d9d5cc;
}

/* --- Themes -----------------------------------------------------------
   A theme assigns the five roles. Put data-theme="road" on any element and
   everything inside it uses the road colours. app/tokens.test.ts reads these
   blocks and fails if any text colour is too faint on its background.

   Each project theme has a second selector. It only applies when JavaScript
   is off: then nothing sets data-theme on <html>, and each chapter colours
   itself instead. */

/* Neutral shell: ink on paper. Grey #8a877f is too faint on paper, so
   secondary text here uses the darker #66635c. */
:root,
[data-theme="neutral"] {
  --bg: #f4f2ee;
  --fg: #0e0e0e;
  --muted: #66635c;
  --accent: #0e0e0e;
  --line: #d9d5cc;
}

/* Neutral, inverted: paper on ink. */
[data-theme="ink"] {
  --bg: #0e0e0e;
  --fg: #f4f2ee;
  --muted: #8a877f;
  --accent: #f4f2ee;
  --line: #373736;
}

[data-theme="odovox"],
html:not([data-theme]) [data-chapter="odovox"] {
  --bg: #0f1f1c;
  --fg: #f4f2ee;
  --muted: #8a877f;
  --accent: #7ff2c9;
  --line: #384542;
}

[data-theme="road"],
html:not([data-theme]) [data-chapter="road"] {
  --bg: #121212;
  --fg: #f4f2ee;
  --muted: #8a877f;
  --accent: #ffc93c;
  --line: #3b3a3a;
}

[data-theme="kattral"],
html:not([data-theme]) [data-chapter="kattral"] {
  --bg: #1c1410;
  --fg: #f4f2ee;
  --muted: #8a877f;
  --accent: #ff8a3d;
  --line: #433c38;
}

[data-theme="cache"],
html:not([data-theme]) [data-chapter="cache"] {
  --bg: #0b1020;
  --fg: #f4f2ee;
  --muted: #8a877f;
  --accent: #4d8bff;
  --line: #353945;
}

[data-theme="hallucination"],
html:not([data-theme]) [data-chapter="hallucination"] {
  --bg: #16111f;
  --fg: #f4f2ee;
  --muted: #8a877f;
  --accent: #b69cff;
  --line: #3e3a44;
}

/* Without JavaScript, a chapter paints its own background. */
html:not([data-theme]) [data-chapter] {
  background: var(--bg);
  color: var(--fg);
}

@layer base {
  html {
    background: var(--bg);
    color: var(--fg);
    /* The fade between themes. Everything on the page inherits the five
       roles from <html>, so the whole page changes together.
       ponytail: restyles the whole page for 0.6s per change; if that ever
       costs frames, fade only background-color and color instead. */
    transition:
      --bg 600ms ease,
      --fg 600ms ease,
      --muted 600ms ease,
      --accent 600ms ease,
      --line 600ms ease;
  }
  @media (prefers-reduced-motion: reduce) {
    html {
      transition-duration: 200ms;
    }
  }

  h1,
  h2,
  h3 {
    @apply font-serif;
    font-weight: 400;
    text-wrap: balance;
  }

  p {
    text-wrap: pretty;
  }

  /* Links show an underline in the accent colour on hover; hover styles only
     apply on devices that really hover, so a tap on a phone never sticks. */
  a {
    text-decoration: underline transparent;
    text-underline-offset: 0.25em;
    transition: text-decoration-color 150ms ease;
  }
  @media (hover: hover) {
    a:hover {
      text-decoration-color: var(--accent);
    }
  }

  /* Keyboard focus is always a clear outline in the accent colour. */
  :focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
  }

  ::selection {
    background: var(--fg);
    color: var(--bg);
  }

  /* Film grain: one small noise tile, repeated over the whole window at 3%
     and nudged a few times a second. It sits above the page and ignores clicks. */
  body::after {
    content: "";
    position: fixed;
    inset: -128px;
    z-index: 50;
    pointer-events: none;
    background: url("/grain.png");
    opacity: 0.03;
    animation: grain 0.6s steps(1) infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    body::after {
      animation: none;
    }
  }
}

@keyframes grain {
  0% {
    transform: translate(0, 0);
  }
  25% {
    transform: translate(-37px, 53px);
  }
  50% {
    transform: translate(61px, -29px);
  }
  75% {
    transform: translate(-83px, -71px);
  }
}
```

- [x] **Step 6: Write the arrow icon.**

File: `components/ArrowUpRight.tsx`

```tsx
// The "leaves this page" arrow. Drawn as SVG so it looks the same in every
// font, and sized in em so it scales with the text beside it.
export function ArrowUpRight() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 10 10"
      className="ml-1 inline-block size-[0.7em] fill-none stroke-current"
      strokeWidth="1.25"
    >
      <path d="M1.5 8.5 8.5 1.5M3 1.5h5.5V7" />
    </svg>
  );
}
```

- [x] **Step 7: Write the project list.**

File: `content/projects.ts`

```ts
// The five projects, in the order they appear on the site.
// `slug` is a project's short id. It is also the name of its colour theme in
// app/globals.css and, later, its address: /work/<slug>.
export type Project = {
  slug: "odovox" | "road" | "kattral" | "cache" | "hallucination";
  title: string;
  role?: string;
  pitch: string;
};

export const projects: Project[] = [
  {
    slug: "odovox",
    title: "Odovox",
    role: "Founder",
    pitch:
      "A voice-first operating system for Indian dental clinics. Dentists speak, and Odovox turns it into clinical records, prescriptions, treatment plans, appointments, bills and WhatsApp follow-ups. The doctor verifies every record before it’s saved.",
  },
  {
    slug: "road",
    title: "Automated Road Damage Survey",
    pitch:
      "Detecting potholes from dashcam video, and measuring exactly how the detector fails in a new region.",
  },
  {
    slug: "kattral",
    title: "Kattral Academy",
    role: "Software Developer, Zerofence",
    pitch:
      "A live-classroom platform. Teachers create classes; students join with a code for real-time video, screen sharing and chat.",
  },
  {
    slug: "cache",
    title: "Edge Cache RL",
    pitch: "Teaching a cache what to forget, using reinforcement learning.",
  },
  {
    slug: "hallucination",
    title: "Hallucination Detection in LLMs",
    pitch: "Catching AI answers that aren’t supported by the facts.",
  },
];
```

- [x] **Step 8: Write the layout.**

File: `app/layout.tsx`

```tsx
import type { Metadata, Viewport } from "next";
import {
  Instrument_Serif,
  Inter_Tight,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";

// next/font downloads each typeface at build time and serves it from this
// site, so there is no request to Google when someone visits. `variable` is
// the CSS variable name that app/globals.css reads.
const serif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
});
const sans = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Harshavardhanan — Software engineer & founder",
    template: "%s — Harshavardhanan",
  },
  description:
    "Portfolio of Harshavardhanan Rajasimhan, software engineer and founder in Chennai. He builds AI products end to end: Odovox, road-damage detection, live classrooms, RL caching and hallucination detection.",
};

export const viewport: Viewport = {
  themeColor: "#f4f2ee",
};

// The design direction, kept in the page source so any later edit can be
// checked against it. React cannot write an HTML comment directly, so it
// travels inside a hidden element.
const CONTRACT = `<!--
THESIS: A quiet editorial shell about one engineer; each project takes the whole page over with its own colour world and a working miniature. Refuses the grid of same-size project cards.
OWN-WORLD: Paper #F4F2EE ground, ink #0E0E0E type, hairlines, film grain. Instrument Serif display, Inter Tight body, JetBrains Mono for labels and numbers. Five dark project worlds, each one background and one accent, reached by scrolling.
STORY: The visitor reads who he is, scrolls through five projects that each change the room, operates a demo, opens a case study, and writes to him.
FIRST VIEWPORT: The full name in giant serif at left; subtitle beneath; a calm particle object at right; header with H.R., Chennai clock, Work / About / Contact, Resume; status pill "currently building Odovox".
FORM: Pinned by the brief (docs/brief.md, v2), no roll. Key: brief-v2-pinned-2026-11-12.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="text-body font-sans antialiased">
        <div hidden dangerouslySetInnerHTML={{ __html: CONTRACT }} />
        {/* Hidden above the window until a keyboard user tabs to it. */}
        <a
          href="#main"
          className="bg-fg text-label text-bg left-gutter fixed top-4 z-70 -translate-y-24 px-4 py-2 font-mono transition-transform duration-150 ease-out focus:translate-y-0"
        >
          Skip to content
        </a>
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
```

- [x] **Step 9: Write the page skeleton.**

File: `app/page.tsx`

```tsx
import { ArrowUpRight } from "@/components/ArrowUpRight";
import { projects } from "@/content/projects";

// TEMPORARY SKELETON. It proves the tokens, typefaces and themes with real
// copy. Phase 2 replaces the top with the hero; Phase 3 replaces the chapters
// with the real ones; Phase 5 replaces About and Contact.

const facts = [
  ["Based in", "Chennai, India"],
  ["Studying", "B.Tech CSE (AI & Robotics), VIT Chennai, 2023–27"],
  ["Now", "Founder, Odovox"],
  ["Previously", "Software Developer, Zerofence"],
];

const links = [
  { label: "Email", href: "mailto:harshavardhananrajasimhan@gmail.com" },
  { label: "GitHub", href: "https://github.com/rharshavardhanan" },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/harshavardhanan-rajasimhan",
  },
];

export default function Home() {
  return (
    <>
      <section className="px-gutter pt-[14vh] pb-40">
        <h1 className="text-display">Harshavardhanan</h1>
        <p className="text-lead mt-8 max-w-[34ch]">
          Software engineer &amp; founder. I build AI products end to end, from
          model to interface.
        </p>
      </section>

      {/* One chapter per project. data-chapter is what selects the theme. */}
      <div id="work">
        {projects.map((project, index) => (
          <section
            key={project.slug}
            data-chapter={project.slug}
            aria-labelledby={project.slug}
            className="px-gutter grid min-h-[80vh] grid-cols-12 content-center gap-x-4 py-24"
          >
            <p
              aria-hidden
              className="text-label text-accent col-span-2 pt-[0.9em] font-mono md:pt-[1.6em]"
            >
              0{index + 1}
            </p>
            <div className="col-span-10 md:col-span-9">
              <h2 id={project.slug} className="text-title">
                {project.title}
              </h2>
              {project.role && (
                <p className="text-label text-muted mt-3 font-mono">
                  {project.role}
                </p>
              )}
              <p className="text-lead mt-8 max-w-[44ch]">{project.pitch}</p>
            </div>
          </section>
        ))}
      </div>

      <section
        id="about"
        aria-labelledby="about-title"
        className="px-gutter grid grid-cols-12 gap-x-4 gap-y-10 pt-40 pb-24"
      >
        <h2 id="about-title" className="text-title col-span-12 md:col-span-5">
          About
        </h2>
        <dl className="text-label border-line col-span-12 border-t font-mono md:col-span-7">
          {facts.map(([term, detail]) => (
            <div
              key={term}
              className="border-line grid grid-cols-3 gap-x-4 border-b py-3"
            >
              <dt className="text-muted">{term}</dt>
              <dd className="col-span-2">{detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        id="contact"
        aria-labelledby="contact-title"
        className="px-gutter pt-24 pb-16"
      >
        <h2 id="contact-title" className="text-title max-w-[14ch]">
          Have a hard problem? <em>Let’s build it.</em>
        </h2>
        <ul className="text-label mt-10 flex flex-wrap gap-x-8 gap-y-2 font-mono">
          {links.map((link) => (
            <li key={link.label}>
              <a href={link.href} className="inline-block py-2">
                {link.label}
                {link.href.startsWith("http") && <ArrowUpRight />}
              </a>
            </li>
          ))}
        </ul>
        <p className="text-label text-muted mt-24 font-mono">
          Phase 1 of 6: foundation. The hero, demos and case studies come next.
        </p>
      </section>
    </>
  );
}
```

- [x] **Step 10: Run the unit test.**

Run: `pnpm test`
Expected: PASS, 22 passed.

- [x] **Step 11: Run the browser test.**

Run: `pnpm e2e e2e/shell.e2e.ts`
Expected: 5 passed.

- [x] **Step 12: Confirm the direction contract survives the build.**

Run: `grep -rl "brief-v2-pinned-2026-11-12" .next/server/app | head -1`
Expected: prints a file path.

**Done when:** `pnpm test` reports 22 passed, `pnpm e2e e2e/shell.e2e.ts` reports 5 passed, and the grep in Step 12 prints a path.

---

### Task 3: Header with the Chennai clock

**Goal:** Every page opens with `H.R. · Chennai · HH:MM IST` showing the current time in Chennai, and links to Work, About, Contact and the résumé.

**Why:** The header is the only navigation until the menu arrives in Phase 5; a clock that showed the visitor's local time instead of Chennai's would be a visible factual error.

**Files:**

- Create: `lib/ist.ts`, `lib/ist.test.ts`, `components/Clock.tsx`, `components/Header.tsx`, `e2e/header.e2e.ts`
- Modify: `app/layout.tsx` (import `Header`; render `<Header />` directly above `<main id="main">`)

**Interfaces:**

- Consumes: `ArrowUpRight`; section ids `work`, `about`, `contact` from Task 2.
- Produces: `formatIST(date: Date): string` returning 24-hour `"HH:MM"`; `Clock(): JSX.Element`; `Header(): JSX.Element`.

- [x] **Step 1: Write the failing unit test.**

File: `lib/ist.test.ts`

```ts
import { expect, test } from "vitest";
import { formatIST } from "./ist";

test("shows Chennai time whatever the machine's time zone", () => {
  // Chennai is UTC+5:30, so 06:11 UTC is 11:41 there.
  expect(formatIST(new Date("2026-06-15T06:11:00Z"))).toBe("11:41");
});

test("rolls past midnight as 00, not 24", () => {
  expect(formatIST(new Date("2026-01-01T18:35:00Z"))).toBe("00:05");
});
```

- [x] **Step 2: Run it and watch it fail.**

Run: `pnpm test lib/ist.test.ts`
Expected: FAIL, cannot resolve `./ist`.

- [x] **Step 3: Implement.**

File: `lib/ist.ts`

```ts
// Built once and reused: creating a formatter is slow, using one is fast.
const ist = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** The time in Chennai as "HH:MM", wherever the visitor is. */
export function formatIST(date: Date): string {
  return ist.format(date);
}
```

- [x] **Step 4: Run it and watch it pass.**

Run: `pnpm test lib/ist.test.ts`
Expected: PASS, 2 passed.

- [x] **Step 5: Write the browser test.**

File: `e2e/header.e2e.ts`

```ts
import { expect, test } from "@playwright/test";

test("the header shows the time in Chennai", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("header time")).toHaveText(/^\d\d:\d\d IST$/);
});

test("every header link leads somewhere that exists", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Primary" });
  for (const name of ["Work", "About", "Contact"]) {
    const href = await nav.getByRole("link", { name }).getAttribute("href");
    await expect(page.locator(href!)).toHaveCount(1);
  }
  await expect(nav.getByRole("link", { name: "Résumé" })).toHaveAttribute(
    "href",
    "/resume.pdf",
  );
});

test("without JavaScript the header still reads sensibly", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("header")).toContainText("H.R. · Chennai");
  await expect(page.locator("h1")).toHaveText("Harshavardhanan");
  await context.close();
});
```

- [x] **Step 6: Write the clock.**

File: `components/Clock.tsx`

```tsx
"use client";

import { useSyncExternalStore } from "react";
import { formatIST } from "@/lib/ist";

// Asks React to re-check the time once a second.
function subscribe(onTick: () => void) {
  const id = setInterval(onTick, 1000);
  return () => clearInterval(id);
}

const getTime = () => formatIST(new Date());
// The server cannot know when the page will be read, so it sends a blank.
const getServerTime = () => "--:--";

// useSyncExternalStore re-renders only when the "HH:MM" text really changes
// (once a minute), and avoids a mismatch between server and browser HTML.
export function Clock() {
  const time = useSyncExternalStore(subscribe, getTime, getServerTime);
  return <time dateTime={time === "--:--" ? undefined : time}>{time} IST</time>;
}
```

- [x] **Step 7: Write the header.**

File: `components/Header.tsx`

```tsx
import Link from "next/link";
import { ArrowUpRight } from "./ArrowUpRight";
import { Clock } from "./Clock";

// These jump to sections of the home page. When a second page exists
// (Phase 4) they become "/#work" and so on.
const sections = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export function Header() {
  return (
    <header className="px-gutter text-label flex flex-wrap items-baseline justify-between gap-x-8 py-3 font-mono">
      <p className="text-muted">
        <Link href="/" className="text-fg inline-block py-2">
          H.R.
        </Link>{" "}
        · Chennai · <Clock />
      </p>
      <nav aria-label="Primary">
        <ul className="flex gap-x-6">
          {sections.map((section) => (
            <li key={section.href}>
              <a href={section.href} className="inline-block py-2">
                {section.label}
              </a>
            </li>
          ))}
          <li>
            <a href="/resume.pdf" className="inline-block py-2">
              Résumé
              <ArrowUpRight />
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
```

- [x] **Step 8: Add the header to the layout.** In `app/layout.tsx` add `import { Header } from "@/components/Header";` and render `<Header />` on the line above `<main id="main">`.

- [x] **Step 9: Run the browser test.**

Run: `pnpm e2e e2e/header.e2e.ts`
Expected: 3 passed.

**Done when:** `pnpm test lib/ist.test.ts` reports 2 passed and `pnpm e2e e2e/header.e2e.ts` reports 3 passed.

---

### Task 4: Smooth scrolling

**Goal:** Wheel and trackpad scrolling is eased by Lenis, except for visitors who ask for reduced motion, who get the browser's own scrolling.

**Why:** The scroll-driven work in later phases assumes one smooth scroll position; and forcing it on someone who asked for less motion is an accessibility failure the brief calls out.

**Files:**

- Create: `components/SmoothScroll.tsx`, `e2e/scroll.e2e.ts`
- Modify: `app/layout.tsx` (import `SmoothScroll`; render `<SmoothScroll />` after `</main>`)

**Interfaces:**

- Produces: `SmoothScroll(): null`. While active, `<html>` carries the class `lenis`.

- [x] **Step 1: Write the browser test.**

File: `e2e/scroll.e2e.ts`

```ts
import { expect, test } from "@playwright/test";

test("smooth scrolling is on by default", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/lenis/);
});

test("a header link scrolls to its section", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/lenis/);
  await page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: "Contact" })
    .click();
  await expect(page.locator("#contact")).toBeInViewport();
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("scrolling is left to the browser", async ({ page }) => {
    await page.goto("/");
    // Wait for the page's scripts to be running before checking an absence.
    await expect(page.locator("header time")).toHaveText(/^\d\d:\d\d IST$/);
    await expect(page.locator("html")).not.toHaveClass(/lenis/);
    await page.mouse.wheel(0, 600);
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(0);
  });
});
```

- [x] **Step 2: Implement.**

File: `components/SmoothScroll.tsx`

```tsx
"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

// Renders nothing. It only switches smooth scrolling on, and switches it off
// again if the visitor has asked their system for reduced motion.
export function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;

    // Runs now, and again whenever the visitor changes the system setting.
    const sync = () => {
      lenis?.destroy();
      // autoRaf: Lenis runs its own animation loop.
      // anchors: links such as #work glide to their section.
      lenis = reduce.matches
        ? null
        : new Lenis({ autoRaf: true, anchors: true });
    };

    sync();
    reduce.addEventListener("change", sync);
    return () => {
      reduce.removeEventListener("change", sync);
      lenis?.destroy();
    };
  }, []);

  return null;
}
```

- [x] **Step 3: Add it to the layout.** In `app/layout.tsx` add `import { SmoothScroll } from "@/components/SmoothScroll";` and render `<SmoothScroll />` on the line after `</main>`.

- [x] **Step 4: Run the browser tests, including Task 2's keyboard test**, since smooth scrolling must not break the skip link.

Run: `pnpm e2e e2e/scroll.e2e.ts e2e/shell.e2e.ts`
Expected: 8 passed.

**Done when:** `pnpm e2e e2e/scroll.e2e.ts e2e/shell.e2e.ts` reports 8 passed.

---

### Task 5: Theme watcher

**Goal:** Scrolling a project chapter to the middle of the window turns the whole page into that project's colours, and scrolling out returns it to paper.

**Why:** This is the v2 concept ("every project gets its own world"). Phases 3 and 4 build ten themed surfaces on it, so the switch has to be proven before they exist.

**Files:**

- Create: `components/ThemeWatcher.tsx`, `e2e/theme.e2e.ts`
- Modify: `app/page.tsx` (import `ThemeWatcher`; render `<ThemeWatcher />` as the first child of the fragment)

**Interfaces:**

- Consumes: `<section data-chapter={slug}>` and the theme blocks from Task 2.
- Produces: `ThemeWatcher(): null`. While mounted, `<html data-theme>` is the slug of the chapter crossing the middle of the window, or `neutral`.

Motion decisions (animate skill): frequency is a handful of times per visit; purpose is spatial consistency (it tells the visitor they have entered a different place). Tool: a CSS transition on registered colour properties, because the change is a plain A-to-B and must retarget cleanly if the visitor scrolls on mid-fade. Properties: colour only. Curve and duration: `ease`, 600ms, longer than a UI response because it is a scene change, not feedback; 200ms under reduced motion.

- [x] **Step 1: Write the failing browser test.**

File: `e2e/theme.e2e.ts`

```ts
import { expect, type Page, test } from "@playwright/test";

const paper = "rgb(244, 242, 238)";
const backgrounds = {
  odovox: "rgb(15, 31, 28)",
  road: "rgb(18, 18, 18)",
  kattral: "rgb(28, 20, 16)",
  cache: "rgb(11, 16, 32)",
  hallucination: "rgb(22, 17, 31)",
};

const pageBackground = (page: Page) =>
  page.evaluate(
    () => getComputedStyle(document.documentElement).backgroundColor,
  );

const scrollToChapter = (page: Page, name: string) =>
  page
    .locator(`[data-chapter="${name}"]`)
    .evaluate((el) => el.scrollIntoView({ block: "center" }));

test("the page is paper until a project is reached", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "neutral");
  expect(await pageBackground(page)).toBe(paper);
});

for (const [name, colour] of Object.entries(backgrounds)) {
  test(`scrolling into ${name} turns the whole page its colour`, async ({
    page,
  }) => {
    await page.goto("/");
    await scrollToChapter(page, name);
    await expect(page.locator("html")).toHaveAttribute("data-theme", name);
    await expect.poll(() => pageBackground(page)).toBe(colour);
  });
}

test("scrolling back out returns the page to paper", async ({ page }) => {
  await page.goto("/");
  await scrollToChapter(page, "cache");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "cache");
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.locator("html")).toHaveAttribute("data-theme", "neutral");
  await expect.poll(() => pageBackground(page)).toBe(paper);
});

test("without JavaScript each chapter paints its own theme", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  for (const [name, colour] of Object.entries(backgrounds)) {
    await expect(page.locator(`[data-chapter="${name}"]`)).toHaveCSS(
      "background-color",
      colour,
    );
  }
  expect(await pageBackground(page)).toBe(paper);
  await context.close();
});
```

- [x] **Step 2: Run it and watch it fail.**

Run: `pnpm e2e e2e/theme.e2e.ts`
Expected: 7 failed (no `data-theme` on `<html>`), 1 passed (the no-JavaScript case is pure CSS from Task 2).

- [x] **Step 3: Implement.**

File: `components/ThemeWatcher.tsx`

```tsx
"use client";

import { useEffect } from "react";

// Renders nothing. It watches every <section data-chapter="..."> on the page
// and writes the name of the one crossing the middle of the window to
// <html data-theme="...">. The colours themselves, and the fade between
// them, are CSS: see the theme blocks in app/globals.css.
export function ThemeWatcher() {
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.theme = "neutral";

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const name = (entry.target as HTMLElement).dataset.chapter!;
          if (entry.isIntersecting) {
            html.dataset.theme = name;
          } else if (html.dataset.theme === name) {
            // Only the chapter that is active may hand the page back.
            html.dataset.theme = "neutral";
          }
        }
      },
      // Shrinks the watched area to a line across the middle of the window.
      { rootMargin: "-50% 0px -50% 0px" },
    );

    document
      .querySelectorAll("[data-chapter]")
      .forEach((chapter) => observer.observe(chapter));

    return () => {
      observer.disconnect();
      delete html.dataset.theme;
    };
  }, []);

  return null;
}
```

- [x] **Step 4: Add it to the page.** In `app/page.tsx` add `import { ThemeWatcher } from "@/components/ThemeWatcher";` and render `<ThemeWatcher />` as the first child of the fragment.

- [x] **Step 5: Run the browser test.**

Run: `pnpm e2e e2e/theme.e2e.ts`
Expected: 8 passed.

**Done when:** `pnpm e2e e2e/theme.e2e.ts` reports 8 passed.

---

### Task 6: Phase verification and commit

**Goal:** Phase 1 is proven as a whole, looked at once at desktop and phone width, and saved as one commit.

**Why:** Each task was checked alone; only a full run shows they still pass together, and the commit is the restore point Phase 2 builds from.

**Files:**

- Modify: whatever the inspection round shows needs fixing
- Create: screenshots in the scratchpad (not in the repo)

**Interfaces:**

- Consumes: everything above.

- [x] **Step 1: Run everything.**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm e2e`
Expected: exit 0; Vitest 24 passed; Playwright 19 passed.

- [x] **Step 2: Run the design detector once.**

Run: `node ~/.agents/skills/impeccable/scripts/detect.mjs --json app components`
Expected: no findings, or only findings the brief explicitly pins (film grain, mono labels, numbered chapters). Fix anything else.

- [x] **Step 3: Capture and inspect** the page at 1280×800 and 360×740: the top, one chapter mid-screen (themed), and the about and contact sections. Check against the craft floor: the name fits at 360px, the header wraps cleanly, spacing above headings exceeds spacing below, pitch measure is under 75 characters, focus outline is visible in a dark theme. Fix everything found in one batch, then capture once more. Two rounds at most.

- [x] **Step 4: Re-run Step 1** if Step 2 or 3 changed any file.

- [x] **Step 5: Commit**, leaving `potrait` out.

```bash
git add -A -- . ':!potrait' && git commit -m "Phase 1: foundation (tokens, themes, typefaces, shell, smooth scroll)"
```

**Done when:** `pnpm typecheck && pnpm lint && pnpm test && pnpm e2e; echo $?` prints `0`, `git log --oneline` shows one commit, and `git status --short` shows only `?? potrait`.

---

## Deferred, on purpose

- **GSAP, three.js, R3F**: Phase 2, with the letter stagger and the particle object.
- **Custom cursors**: Phase 3, with the per-project variants.
- **Menu, page transitions, footer**: Phase 5.
- **Impeccable finish review and `DESIGN.md`**: end of Phase 2, when the first real viewport exists to review.
- **`metadataBase`, Open Graph, JSON-LD, sitemap, favicon set**: Phase 6.
