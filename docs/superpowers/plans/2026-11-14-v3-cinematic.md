# Portfolio v3: cinematic rebuild — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Turn the long, text-first home page into a full-screen ring of seven film panels. Each project page becomes a short film poster followed by the proof, the demo and the detail. Nothing is lost, and it works at 360px.

**Architecture:**

- Next.js 16 App Router pages: `/`, `/work/[slug]`, `/about` and `/contact`.
- The ring is raw WebGL2 drawn over a server-rendered list of links, which is also the fallback.
- The shared transition is a React `<ViewTransition>`.
- The corners are fixed client components that read `<html data-active>`.

**Tech stack:** Next.js 16.4, React 19.3 (`ViewTransition`), Tailwind 4, GSAP (ScrollTrigger, SplitText) loaded after page load, WebGL2, Vitest, Playwright.

Spec: `docs/superpowers/specs/2026-11-14-v3-cinematic-design.md`.

## Global constraints

- Components use only the five colour roles. Hex values live only in the theme blocks of `app/globals.css`.
- Five text sizes, nothing under 13px. Motion uses only transform, opacity, clip-path and colour, and honours reduced motion.
- Every page works with JavaScript off, with a keyboard, and at 360px wide with no sideways scroll.
- Facts only from the brief, the résumé and the repos.
  - Odovox never claims live clinics.
  - Kattral shows no product screens.
  - The phone number never appears on the site.
- Tests never open real apps (stub `window.open` and mailto).
- One local commit per phase, gated on green checks. Never push.
- No new runtime dependencies. three.js and @react-three/fiber are removed.

Each phase ends with `pnpm typecheck && pnpm lint && pnpm test && pnpm e2e` passing, then a commit.

---

## Phase 1: Frame, menu, Inquire, type, dev error

> Done 2026-11-14 (d07bd12).

### Task 1.1: The dev server shows no prerender error

- **Goal:** Loading `/` in `pnpm dev` logs no "unstable value `Date.now()`" error.
- **Why:** The open/read/close calls in `pngSize` trip Cache Components' clock check on every request. This is the "current Next.js dev error" the brief names.
- **Files:** `lib/media.ts`.
- **Steps:**
  1. Replace `openSync`/`readSync`/`closeSync` with `readFileSync(file).subarray(0, 24)`.
  2. Reload `/` on the running dev server (port 3200).
- **Done when:** `curl -s localhost:3200/ >/dev/null; tail -50 <dev log> | grep -c "unstable value"` prints `0`.

### Task 1.2: The films are on the site with posters, and fall back cleanly

- **Goal:** `film(slug)` returns the mood film and poster where one exists, and the particle recording otherwise. `ai` is true only for mood films.
- **Why:** Every later phase (ring, menu posters, hero) reads films through this one function.
- **Files:**
  - create `public/media/mood/*` (6 mp4 + 6 avif) and `public/media/mood/README.txt`
  - modify `lib/media.ts` and `.gitignore` (`videos/`)
  - test: `lib/media.test.ts`
- **Steps:**
  1. Write a test in which `film("odovox")` gives `{src:"/media/mood/mood-odovox.mp4", poster:"/media/mood/poster-odovox.avif", ai:true}` and `film("hallucination")` gives `{src:"/media/case-hallucination.mp4", poster:"/media/cover-hallucination.avif", ai:false}`. Run it and see it fail.
  2. Encode each source as 1280×720 H.264 (CRF 26, `+faststart`, AAC 96k), and grab a poster at 3s as AVIF.
  3. Implement `FILM_NAME: Record<Slug,string>` and `film(slug): Film`.
  4. Run the tests and see them pass.
- **Done when:** `pnpm test lib/media.test.ts` passes, and `ls public/media/mood | wc -l` prints `13`.

### Task 1.3: Labels are sans everywhere except in demos

- **Goal:**
  - `.label` renders in Inter Tight at 14px, uppercase, 0.04em tracking.
  - Inside a demo figure it renders in JetBrains Mono.
  - `text-h2` is clamp(3rem, 9vw, 10rem).
- **Why:** The brief removes monospace from the main experience.
- **Files:**
  - `app/globals.css`
  - `components/demos/DemoFrame.tsx` (`style={{"--label-font":"var(--font-mono)"}}` and the `font-mono` class)
  - remove `font-mono` from `Menu`, `layout` and `page`
  - `app/layout.tsx` (mono `preload: false`)
- **Done when:** In the browser test `frame.e2e.ts › labels`, a corner label's font family matches `/Inter Tight/`, and a demo caption's matches `/JetBrains Mono/`.

### Task 1.4: A four-corner frame on every page

- **Goal:**
  - Top row: MENU (with SOUND on desktop), HARSHAVARDHANAN (link home), INQUIRE.
  - Bottom row: the current project's name, SELECTED WORK, and the counter "03 / 07".
  - Text is 14px and tinted ink or paper by what lies under it.
- **Why:** This is the brief's global frame. The old header and footer go.
- **Files:**
  - create `components/Corners.tsx` (server) and `components/CornerStatus.tsx` (client: reads `html[data-active]` with a MutationObserver)
  - rename `HeaderTone.tsx` to `Tone.tsx` (samples the top and bottom rows; writes `data-tone` and `data-tone-bottom`; also listens for a `tone` event)
  - delete `Header.tsx` and `Footer.tsx`
  - modify `app/layout.tsx` and `app/globals.css` (`.corners`, `.corner-top`, `.corner-bottom`)
- **Interfaces:** Pages set `document.documentElement.dataset.active = slug` (the case page through `ThemeSetter`, the home page through the ring). `CornerStatus` maps a slug to its title and position from `projects`.
- **Done when:**
  - `e2e/frame.e2e.ts` passes. At 1280 and at 360, the MENU, HARSHAVARDHANAN and INQUIRE links are visible, and so is the bottom counter on `/work/scp` (`/0?3 \/ 07/`).
  - `document.documentElement.scrollWidth <= 360` at 360px.

### Task 1.5: The menu is a full-screen index with posters

- **Goal:** MENU opens a dialog that lists the seven projects in giant serif.
  - Hovering or focusing a project shows its poster behind the list.
  - It also has About, Inquire and Résumé, the anomaly count, the sound switch and the © line.
  - Without JavaScript, MENU links to `/#projects`.
- **Files:** `components/Menu.tsx` (receives `posters: Record<Slug,string>` from `Corners`), `app/globals.css` (Menu).
- **Done when:** In `e2e/frame.e2e.ts › menu`, 7 links show under `dialog nav`, hovering "Aftermeet" makes `.menu-poster img[src*="poster-aftermeet"]` visible, and Escape closes the dialog.

### Task 1.6: Inquire overlay and the /contact page

- **Goal:**
  - INQUIRE opens a dialog with the huge copy-on-click email, links, the mailto form, and "Chennai · HH:MM IST".
  - `/contact` renders the same content as a page (that is the INQUIRE link's href).
- **Files:**
  - create `components/Inquire.tsx` (link plus dialog) and `components/ContactBody.tsx` (from `Contact.tsx`, which is deleted)
  - create `app/contact/page.tsx`
  - `components/Wipe.tsx` skips `[data-no-wipe]` links
- **Done when:** In `e2e/frame.e2e.ts › inquire`, clicking INQUIRE shows a dialog containing the email, and with JavaScript off `/contact` shows the email and the form.

### Task 1.7: New project order, tests updated, Phase 1 committed

- **Goal:** Projects run odovox, aftermeet, scp, road, kattral, cache, hallucination, and the suite is green.
- **Files:** `content/projects.ts`, the e2e files that assert the header or footer (`header`, `shell`, `cursor`, `a11y`, `blend`).
- **Done when:** All four checks pass, and `git log -1 --format=%s` reads "v3 phase 1: corner frame, menu index, Inquire, type".

## Phase 2: Home WebGL ring

> Done 2026-11-14. Task 5.1 (proof components) moved into this phase: deleting
> the old home page deleted the chapters that held each project's real material,
> so it had to land in the same commit to keep the suite green.

### Task 2.1: The ring's maths is pure and tested

- **Goal:** `lib/ring.ts` exports:
  - `wrap(x, n)`: maps x into [-n/2, n/2)
  - `nearest(offset, n)`: the index in 0…n-1 of the panel nearest the centre
  - `ease(current, target, dt, rate=0.08)`: frame-rate-independent easing
  - `panelSize(vw, vh)`: `{w, h, gap, vertical}`
- **Files:** `lib/ring.ts`, `lib/ring.test.ts`.
- **Done when:** `pnpm test lib/ring.test.ts` passes with these cases:
  - `wrap(6.4, 7)` ≈ -0.6
  - `nearest(-0.6, 7)` = 6
  - `ease(0, 1, 1/60)` ≈ 0.08
  - `panelSize(360, 740).vertical` is true

### Task 2.2: The home page is one screen with a list of seven film links

- **Goal:** `/` renders `<ol id="projects">` of seven links, each with its poster, number and title, as a scroll-snap strip: sideways at 768px and up, vertical below. There is no hero, chapters, About or Contact.
- **Files:**
  - `app/page.tsx` and `app/globals.css` (`.reel`)
  - delete `Hero`, `WorkIndex`, `ParticleStage`, `Particles`, `ThemeWatcher`, `SectionPaint`, `lib/shapes*` and `scripts/record-hero.mjs`, plus the e2e tests `hero`, `particles`, `work`, `home`, `theme`, `scroll` and `blend`
  - create `app/about/page.tsx` (from `About.tsx`; finished in 6.1)
  - remove three, @react-three/fiber and @types/three
- **Done when:** `e2e/ring.e2e.ts › fallback` passes: with JavaScript off, `/` has 7 links in `#projects` whose `img` src matches poster or cover, and nothing scrolls sideways at 360px.

### Task 2.3: A WebGL ring of curved film panels

- **Goal:** With JavaScript and WebGL, and without reduced motion, a canvas draws the seven panels.
  - Wheel, drag, touch and the arrow keys move it, with easing at 0.08 and a snap.
  - Speed bends the panels harder and adds RGB split and blur.
  - Side panels are darker and less saturated.
  - The centre panel ripples under the cursor.
  - The centre ±1 panels play video.
  - `<html data-active>` follows the centre panel, and so do the page colours.
  - A transparent link over the centre panel carries `data-cursor="View"`.
- **Files:** `components/ring/Ring.tsx` (client loader, input, list sync), `components/ring/gl.ts` (WebGL setup, draw), `components/ring/shaders.ts` (GLSL with a comment on every uniform).
- **Done when:** `e2e/ring.e2e.ts` passes:
  - the canvas is visible
  - pressing ArrowRight changes `html[data-active]` from `odovox` to `aftermeet`
  - the corner counter reads `02 / 07`
  - focusing the 5th list link sets `data-active="kattral"`

### Task 2.4: Phase 2 committed

- **Done when:** All four checks pass, and the commit "v3 phase 2: WebGL film ring" exists.

## Phase 3: Home to project shared transition

### Task 3.1: The centre panel grows into the project's film

- **Goal:** Clicking the centre panel (or pressing Enter on it) does four things:
  1. animates `uExpand` from 0 to 1 (unbend, fill the window)
  2. saves the film time to `sessionStorage["film-time"]`
  3. navigates inside a view transition named `film-<slug>`
  4. starts the project film at that saved time

  Coming back to `/` starts the ring expanded on the same project, then it settles.

- **Files:** `components/ring/Ring.tsx`, `components/Film.tsx` (new: the project page film, with `ViewTransition`), `app/globals.css` (`::view-transition-group(.film)`).
- **Done when:**
  - `e2e/transition.e2e.ts` passes: clicking `[data-ring-hit]` reaches `/work/odovox`, and `article [data-film] video` exists.
  - After `page.goBack()`, `html[data-active]` is `odovox`.
- **Commit:** "v3 phase 3: shared film transition".

## Phase 4: Project page template

### Task 4.1: Each project page opens like a film poster

- **Goal:** `/work/[slug]` starts with these parts:
  - a giant centred title and a credits table
  - the film sticky behind
  - a title block with a torn bottom edge that scrolls away to reveal the film
  - the quote revealed word by word (`data-words`)
  - an "AI-generated film" label when `film.ai`
  - the synopsis and the stats as laurels
- **Files:**
  - `content/projects.ts` (`quote`, `status?`)
  - `lib/torn.ts` plus a test (a deterministic jagged path)
  - `components/Torn.tsx`, `components/Laurel.tsx`, `components/Film.tsx`
  - `components/Motion.tsx` (`data-words`, `data-edge`)
  - `app/work/[slug]/page.tsx`
- **Done when:** `pnpm test lib/torn.test.ts` passes, and `e2e/case.e2e.ts` passes:
  - an `h1` holds the title
  - a `dl` has the terms Role and Built with
  - `[data-words]` reads "Know when to hand over." on `/work/scp`
  - 3 `.laurel` elements
  - the AI label shows on `/work/odovox`
  - no AI label on `/work/hallucination`
- **Commit:** "v3 phase 4: film-poster project pages".

## Phase 5: Proof, demo, deep detail, next project

### Task 5.1: Each project's real material sits in one proof component

- **Goal:** `components/proof/{Odovox,Aftermeet,Scp,Road,Kattral,Cache,Hallucination}.tsx` hold everything the chapters showed (phones, synced clips, monitor videos, browser frames, dashboard, ROC, the Kattral note), laid out 2–3 per row in device frames. `CASE_MEDIA`, `components/chapters/` and `previews` are gone.
- **Done when:** In `e2e/scp.e2e.ts` and `e2e/aftermeet.e2e.ts` (moved to the case pages), the synced clips play and pause on `/work/scp`, and `/work/aftermeet` shows the browser frame and the extension caption.

### Task 5.2: Demo unboxed, then the deep detail, then the next project

- **Goal:** The demo takes the full width with no box. The deep detail follows: problem, built, result, the "How it fits together" flow, what was hard (inverted, with curved edges), and live and code links. Last comes a 200svh "next project" section whose poster grows from 40% to full screen. At 98% or more for 300ms it navigates (no auto-navigation under reduced motion). It is also a plain link.
- **Files:** `app/work/[slug]/page.tsx`, `components/NextProject.tsx`, `components/demos/DemoFrame.tsx`.
- **Done when:** In `e2e/case.e2e.ts › next`, scrolling to the bottom of `/work/odovox` reaches `/work/aftermeet`, and `e2e/demos.e2e.ts` passes against the case pages.
- **Commit:** "v3 phase 5: proof, demos, deep detail, next project".

## Phase 6: About, loader, sound, mobile, reduced motion, quality

### Task 6.1: /about fits one screen

- **Goal:** On a 1440×900 window, `/about` shows the portrait (with the grain shift on hover), the 3–4 line bio, a credits list (Based in, Studying, Now, Previously, Awards) and one line of skills per group, with no scrolling.
- **Done when:** In `e2e/about.e2e.ts`, `document.scrollingElement.scrollHeight <= 900` at 1440×900, and every credit term is visible.

### Task 6.2: The loader hands over to the panels flying in

- **Goal:** On the first visit, the loader counts 0→100 with "H.R.", then the panels fly in from depth, staggered. It never runs with reduced motion.
- **Done when:** `e2e/loader.e2e.ts` passes.

### Task 6.3: The sound switch plays the film's own sound

- **Goal:** It is off by default. When on, the centre film (home) or the hero film (project page) is unmuted, and only that one.
- **Done when:** In `e2e/frame.e2e.ts › sound`, after the switch is pressed, `document.querySelectorAll("video:not([muted])")`, filtered to those whose `.muted` is false, has a length of at most 1.

### Task 6.4: Reduced motion, keyboard, 360px and axe are all clean

- **Goal:** Every route passes axe and has no sideways scroll at 360px. With reduced motion, `/` shows the list (no canvas) and project pages show a poster with a play button instead of autoplay.
- **Done when:** `e2e/a11y.e2e.ts` passes for `/`, `/about`, `/contact` and all 7 `/work/*`.

### Task 6.5: Lighthouse at 90 or more on mobile, docs updated

- **Goal:**
  - Mobile Lighthouse performance is 90 or more for `/` and `/work/odovox`, and accessibility is 100.
  - `DESIGN.md`, `CLAUDE.md` and `PRODUCT.md` describe v3.
- **Done when:** `docs/lighthouse/2026-11-14-v3.md` records the scores.
- **Commit:** "v3 phase 6: about, loader, sound, mobile, quality".
