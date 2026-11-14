# Harshavardhanan — portfolio

Personal portfolio of Harshavardhanan Rajasimhan. A neutral editorial shell (paper and
ink); scrolling into a project turns the whole page into that project's colour world.

@AGENTS.md

## Read first

- `docs/brief.md` — the brief (v2), verbatim. Source of truth for copy, palette, site map.
- `docs/brief-redesign.md` — the art-direction pass that replaced the layouts (type scale, compositions, motion).
- `docs/superpowers/specs/2026-11-12-portfolio-inference-design.md` — decisions the brief left open.
- `PRODUCT.md` — who the site is for. Recruiters win over spectacle.
- `DESIGN.md` — the visual system as built: colour roles, type, layout, components, motion.
- `docs/superpowers/plans/` — one plan per phase (all six are built).
- `docs/lighthouse/` — measured scores and how to re-run them (latest: `2026-11-14-redesign.md`).

## Stack

Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS 4 (tokens live in
`app/globals.css`, there is no tailwind.config), Lenis and GSAP (ScrollTrigger,
SplitText; both fetched after load), three.js with react-three-fiber (the particle
object, desktop only). pnpm only.

## Commands

- `pnpm dev` — dev server on http://localhost:3000 (the next free port if 3000 is taken)
- `pnpm test` — unit tests (Vitest, files named `*.test.ts`)
- `pnpm e2e` — browser tests (Playwright, files named `*.e2e.ts`; builds and serves on port 3100, needs Google Chrome)
- `pnpm typecheck` · `pnpm lint` · `pnpm build`
- `pnpm record:hero` — re-records the hero's fallback video and still from the live particle object (needs `pnpm build && pnpm start --port 3100` running, ffmpeg and ImageMagick)
- `pnpm record:covers` · `pnpm make:og` — re-record the project covers and case videos, and the link-preview image (same requirements)

## Where things are

- `content/` — every word and number on the site (`projects.ts`, `about.ts`). Text marked `draft: true` shows a draft tag.
- `components/` — one file per part of a page; `components/chapters/` has one file per project chapter, `components/demos/` the five demos.
- `components/Motion.tsx` — every scroll animation, switched on by `data-` attributes (`data-lines`, `data-wipe-layer`, `data-strip`...). Render it last inside each page.
- `public/media/real/` — real screenshots and recordings; see the README there for file names.
- `lib/` — small pure functions with tests (`shapes.ts`, `cache-sim.ts`, `ist.ts`, `site.ts`).
- `NEXT_PUBLIC_SITE_URL` — set to the real domain when there is one (see `lib/site.ts`).

## Rules

- Colour: components use only the five role utilities (`bg-bg`, `text-fg`, `text-muted`,
  `text-accent`, `border-line`). Hex values live only in the theme blocks in
  `app/globals.css`; `app/tokens.test.ts` checks every theme for AA contrast.
- A project's `slug` in `content/projects.ts` is also its theme name and its
  `data-chapter` value.
- Five text sizes only (`text-display`, `text-h2`, `text-h3`, `text-body`, `label`); nothing under 13px.
- Animate `transform`, `opacity`, `clip-path` and colour only, and honour `prefers-reduced-motion`.
- Every page works with JavaScript off, with a keyboard, and at 360px wide.
- One local commit per finished phase. Never push. `potrait` (the portrait's source PNG) is git-ignored.
