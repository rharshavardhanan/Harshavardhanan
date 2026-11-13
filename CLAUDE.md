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
`app/globals.css`, there is no tailwind.config), Lenis, three.js with
react-three-fiber (the particle object only, loaded after first paint). pnpm only.

## Commands

- `pnpm dev` — dev server on http://localhost:3000 (the next free port if 3000 is taken)
- `pnpm test` — unit tests (Vitest, files named `*.test.ts`)
- `pnpm e2e` — browser tests (Playwright, files named `*.e2e.ts`; builds and serves on port 3100, needs Google Chrome)
- `pnpm typecheck` · `pnpm lint` · `pnpm build`
- `pnpm record:hero` — re-records the hero's fallback video and still from the live particle object (needs `pnpm build && pnpm start --port 3100` running, ffmpeg and ImageMagick)

## Rules

- Colour: components use only the five role utilities (`bg-bg`, `text-fg`, `text-muted`,
  `text-accent`, `border-line`). Hex values live only in the theme blocks in
  `app/globals.css`; `app/tokens.test.ts` checks every theme for AA contrast.
- A project's `slug` in `content/projects.ts` is also its theme name and its
  `data-chapter` value.
- Animate `transform`, `opacity` and colour only, and honour `prefers-reduced-motion`.
- Every page works with JavaScript off, with a keyboard, and at 360px wide.
- One local commit per finished phase. Never push. `potrait` (the portrait's source PNG) is git-ignored.
