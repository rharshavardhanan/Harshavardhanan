# Harshavardhanan — portfolio

Personal portfolio of Harshavardhanan Rajasimhan. Image-first: the home page is one
screen, a WebGL ring of seven project films; each project page opens like a film
poster, then shows the real product, a working demo and the detail.

@AGENTS.md

## Read first

- `docs/brief-v3.md` — the current brief ("Cinematic Rebuild"), verbatim: structure, motion, art direction.
- `docs/brief.md` — the v2 brief, verbatim. Still the source of truth for facts, figures and copy.
- `docs/superpowers/specs/2026-11-14-v3-cinematic-design.md` — decisions v3 left open or changed (with approval).
- `PRODUCT.md` — who the site is for. Recruiters win over spectacle.
- `DESIGN.md` — the visual system as built: type, colour, layout, components, motion.
- `docs/superpowers/plans/2026-11-14-v3-cinematic.md` — the v3 plan (all six phases built).
- `docs/lighthouse/` — measured scores and how to re-run them (latest: `2026-11-14-v3.md`).

## Stack

Next.js 16 (App Router), React 19 (`ViewTransition`), TypeScript strict, Tailwind CSS 4
(tokens live in `app/globals.css`, there is no tailwind.config), Lenis and GSAP
(ScrollTrigger, SplitText; both fetched after load), raw WebGL2 for the home ring (no
3D library). pnpm only.

## Commands

- `pnpm dev` — dev server on http://localhost:3000 (the next free port if 3000 is taken).
  If a CSS change does not show up, stop it, delete `.next/dev`, and start it again.
- `pnpm build && pnpm start --port 3300` — the production build, for previewing.
- `pnpm test` — unit tests (Vitest, files named `*.test.ts`)
- `pnpm e2e` — browser tests (Playwright, files named `*.e2e.ts`; builds into `.next-test/` and serves on port 3100, so a preview on `.next` keeps working; needs Google Chrome)
- `pnpm typecheck` · `pnpm lint` · `pnpm build`
- `pnpm make:og` — re-make the link-preview image (needs a production server running; pass its URL)
- Live at https://harshavardhanan.vercel.app (Vercel project `harshavardhanan`, free Hobby plan).
  The GitHub repo is connected: every push to `main` builds and deploys to production.
  A manual deploy uploads the folder, git-ignored files included, so deploy a clean export:
  `git archive HEAD | tar -x -C <dir>`, copy `.vercel/` in, then `vercel deploy --prod --cwd <dir>`.

## Where things are

- `content/` — every word and number on the site (`projects.ts`, `about.ts`). Text marked `draft: true` shows a draft tag.
- `app/page.tsx` — the home page: the ring over a plain list of the seven projects (the fallback).
- `components/ring/` — the ring: `Ring.tsx` (input, easing, transitions), `gl.ts` (WebGL), `shaders.ts` (the look; every uniform is commented).
- `app/work/[slug]/page.tsx` — every project page; `components/proof/` holds each project's real material, `components/demos/` the seven demos.
- `components/Corners.tsx` — the four-corner frame; `Menu.tsx`, `Inquire.tsx` (and `/contact`), `Sound.tsx`, `Tone.tsx`.
- `components/Film.tsx`, `NextProject.tsx`, `Torn.tsx`, `Laurel.tsx` — the film-poster parts.
- `components/Motion.tsx` — every scroll animation, switched on by `data-` attributes (`data-lines`, `data-words`, `data-edge`...). Render it last inside each page.
- `public/media/mood/` — the AI mood films and posters (see its README; raw files go in `videos/`, which is git-ignored). `public/media/real/` — real screenshots and recordings (README there).
- `lib/` — small pure functions with tests (`ring.ts`, `torn.ts`, `media.ts`, `cache-sim.ts`, `meeting-extract.ts`, `ist.ts`, `site.ts`).
- `NEXT_PUBLIC_SITE_URL` — set to a custom domain if there ever is one (see `lib/site.ts`); on Vercel the vercel.app address is used by itself.

## Rules

- Colour: components use only the five role utilities (`bg-bg`, `text-fg`, `text-muted`,
  `text-accent`, `border-line`). Hex values live only in `app/globals.css`;
  `app/tokens.test.ts` checks every theme for AA contrast.
- A project's `slug` in `content/projects.ts` is also its theme name and its URL.
- Five text sizes only (`text-display`, `text-h2`, `text-h3`, `text-body`, `label`); nothing under 13px.
- Animate `transform`, `opacity`, `clip-path` and colour only, and honour `prefers-reduced-motion`.
- Every page works with JavaScript off, with a keyboard, and at 360px wide.
- Never call Harsha a founder anywhere on the site (Odovox is a personal project). Every AI film is credited as AI-generated in its project's credits;
  no caption on the film itself (Harsha, 2026-11-14: the Gemini ✦ in its corner shows it).
- One local commit per finished piece. Push only when Harsha asks: a push to `main` goes live. `potrait` (the portrait's source PNG) and `videos/` are git-ignored.
