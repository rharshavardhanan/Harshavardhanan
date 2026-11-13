# Portfolio — design (brief v2)

Date: 2026-11-12 · Status: v2 approved 2026-11-12
(v1 "Inference" design was approved earlier the same day and is superseded by this.)

## 1. What this document is

[`docs/brief.md`](../../brief.md) is the v2 brief, saved verbatim: a neutral editorial
shell, five projects that each bring their own themed world, and one particle object
that morphs between them. It settles the concept, copy, palette, type, site map and
interactions. This document records only what the brief leaves open: how the work is
split, constraints the brief does not state, which dependencies are installed when, and
the detailed design of Phase 1.

## 2. How the work is split

Six phases, as the brief lists them. Each gets its own plan in
`docs/superpowers/plans/`, is built, verified, explained in plain language, committed
locally, and then work stops for review.

| Phase | Delivers                                                                    | Needs from Harsha first                            |
| ----- | --------------------------------------------------------------------------- | -------------------------------------------------- |
| 1     | Setup, tokens, fonts, layout shell, smooth scroll, theme system             | nothing                                            |
| 2     | Loader, hero (video fallback first, then particle object and morph targets) | nothing (stand-in media)                           |
| 3     | Work index, the five chapters with demos, per-theme cursors                 | a check of the five quiz answers                   |
| 4     | Case-study template and five pages                                          | a check of each "what was hard" paragraph          |
| 5     | About, contact, footer, menu, transitions, anomaly hunt                     | bio text; a Resend account and key, or mailto only |
| 6     | Accessibility, performance and SEO pass with a Lighthouse report            | the real media and `resume.pdf`                    |

## 3. Approach

Unchanged from the approved v1 choice: the brief's stack, trimmed, with each dependency
installed in the phase that first uses it.

- Phase 1 installs one runtime library: `lenis`.
- `gsap` arrives in Phase 2 (letter stagger, particle morph), `three`,
  `@react-three/fiber` and `@react-three/drei` with the particle object in Phase 2.
- No Framer Motion (the v2 brief no longer asks for it).

## 4. Decisions the brief did not make

### 4.1 Versions

Next.js 16.4 (App Router), React 19.3, Tailwind CSS 4.3, Lenis 1.3, Node 24, pnpm 11.
Tailwind 4 keeps its tokens in CSS, so there is no `tailwind.config` file.

### 4.2 The shell is light

The brief lists Ink as both "dark background" and "text" without saying which the shell
uses. The loader is on paper, the link-preview image is ink on paper, the portrait and
the hero fallback video sit on off-white. So the neutral shell is **paper with ink
text**, and scrolling into a project turns the page dark. An `ink` theme (ink ground,
paper text) exists for neutral dark moments such as the footer.

### 4.3 Colour contrast

Measured against WCAG AA (4.5:1). Paper text on every project background is 15:1 or
better.

| Theme           | Accent on background | Grey `#8A877F` on background |
| --------------- | -------------------- | ---------------------------- |
| Neutral (paper) | n/a                  | 3.2 **fail**                 |
| Ink             | n/a                  | 5.4                          |
| Odovox          | 12.5                 | 4.75 (narrowest pass)        |
| Road Damage     | 12.2                 | 5.2                          |
| Kattral         | 7.7                  | 5.1                          |
| Edge Cache      | 5.8                  | 5.3                          |
| Hallucination   | 8.1                  | 5.2                          |

Consequences:

- One colour is added: **`#66635C`** (5.4 on paper), used for labels and secondary text
  on paper only. Grey `#8A877F` stays the secondary colour on every dark theme.
- No project accent is ever used as text on paper (all are below 3:1 there). In the
  neutral work index, project names stay ink; the accent appears only once the page has
  changed to that project's theme.
- A unit test reads every theme out of `globals.css` and fails if any text pairing
  drops below 4.5, so "AA contrast in EVERY theme" is enforced by the build.

### 4.4 Theme system

Every colour on the site is read through five roles: `bg`, `fg`, `muted`, `accent`,
`line`. A theme is one CSS block that assigns those five. Components never name a
project colour directly.

- **Switching:** each chapter is a `<section data-chapter="odovox">`. A small client
  component watches which chapter crosses the middle of the window
  (`IntersectionObserver`) and writes that name to `<html data-theme>`. Leaving all
  chapters writes `neutral`.
- **The colour tween** is done by CSS, not JavaScript: the five roles are registered
  colour properties, so the browser itself fades them over 600ms whenever the theme
  changes. This replaces the brief's "ScrollTrigger colour tween" in Phase 1; the result
  is the same and it needs no animation library. Under reduced motion it is a quick 200ms fade (the brief allows
  simple fades, and an instant light-to-dark flip is harsher than a short one).
- **Case-study pages** (Phase 4) set the theme on a wrapper element; nothing to watch.
- **Without JavaScript** each chapter paints its own theme as a block, so the page is
  still correct, just without the fade.
- Line colour on dark themes is derived (`fg` mixed 18% into `bg`); on paper it is the
  brief's `#D9D5CC`.

### 4.5 Cursor

Moved out of Phase 1. The v2 cursor exists only as five per-project variants, and the
brief's Phase 1 list no longer includes it, so it is built in Phase 3 with the chapters
that give it something to change into. The neutral shell keeps the system cursor.

### 4.6 Media

Supplied so far (2026-11-13): `public/resume.pdf` and `public/media/portrait.avif`.
Every other file in the brief's media list is still missing. Phase 1 uses no media.
From Phase 2 on, stand-ins are generated in code under the brief's file names, so the
real files replace them with no code change. Slugs, from the brief's file names:
`odovox`, `road`, `kattral`, `cache`, `hallucination`.

The portrait was converted from the PNG Harsha added at the repo root (`potrait`,
kept in place and git-ignored). It was generated from the v1 prompt: its ground is a
warmer cream than paper `#F4F2EE` and it has a yellow outline. Phase 5 decides whether
it sits as a framed print or is regenerated with the v2 prompt.

The résumé PDF contains a phone number and does not mention Odovox. Harsha confirmed on
2026-11-13 that the phone number is fine inside the PDF; the rule covers the web pages.

### 4.7 Places the brief needs care

- **Odovox claims.** "Do not claim live clinics or users." The count-up row uses only
  the three facts the brief gives. `8 clinic modules` is the brief's number and matches the
  brief's list once "lab & inventory" is read as two: auth and roles, voice consult,
  live queue, scheduling, lab, inventory, billing, WhatsApp follow-ups. Odovox's own
  API has lab and inventory as separate route files, which confirms the reading.
- **"More work" and the bio** are the only placeholders allowed; both are marked as such
  on the page.
- **Spot the Hallucination** needs five question-and-answer pairs, drafted in Phase 3
  and checked by Harsha.
- **Contact form.** The brief asks for Resend with a mailto fallback. Resend needs an
  account and an API key in `.env`; until that exists the form uses mailto.

### 4.8 Working rules

- One local commit per phase, made when the phase passes its checks. Never pushed.
- No deploy unless asked.
- The plain-language explanation of each phase is given in chat, not written to a file.
- The phone number never appears on the site.

## 5. Phase 1 design

### 5.1 Goal

A running Next.js project in which the neutral tokens, the three typefaces, the page
shell, smooth scrolling and the theme system all work and are tested, so every later
phase only adds sections.

### 5.2 Structure

| File                          | Purpose                                                                                                                                                                                                                                                                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/globals.css`             | Tailwind import, tokens, the seven themes (neutral, ink, five projects), base styles, focus outline, grain                                                                                                                                                                                                                            |
| `app/layout.tsx`              | Loads the three fonts, base metadata, skip link, header, `<main id="main">`, smooth scroll, theme watcher                                                                                                                                                                                                                             |
| `app/page.tsx`                | Temporary "calibration sheet": the name as the one `h1`, the subtitle, real contact links, the type scale, then one short section per project theme. It proves the system and gives the theme watcher something to switch between. Phase 2 replaces the top with the hero; Phase 3 replaces the theme sections with the real chapters |
| `app/tokens.test.ts`          | Contrast check on every theme                                                                                                                                                                                                                                                                                                         |
| `components/Header.tsx`       | `H.R.` · `Chennai · [clock]` · Work / About / Contact · Résumé                                                                                                                                                                                                                                                                        |
| `components/Clock.tsx`        | Live Chennai time; blank on the server, filled in on the client                                                                                                                                                                                                                                                                       |
| `components/SmoothScroll.tsx` | Starts Lenis; does nothing under reduced motion                                                                                                                                                                                                                                                                                       |
| `components/ThemeWatcher.tsx` | Writes the active chapter's name to `<html data-theme>`                                                                                                                                                                                                                                                                               |
| `components/ArrowUpRight.tsx` | The one icon                                                                                                                                                                                                                                                                                                                          |
| `lib/ist.ts`                  | `Date` in, `"23:41"` in `Asia/Kolkata` out                                                                                                                                                                                                                                                                                            |
| `e2e/*.e2e.ts`                | Playwright browser checks against the production build                                                                                                                                                                                                                                                                                |

Header links point at `#work`, `#about` and `#contact`. The calibration sheet carries
those three ids on existing sections so no link is dead; the real sections take the ids
over as they are built.

### 5.3 Behaviour under each condition

| Condition                | Smooth scroll      | Theme change                         |
| ------------------------ | ------------------ | ------------------------------------ |
| Desktop or touch         | on                 | fades over 600ms                     |
| `prefers-reduced-motion` | off, native scroll | instant                              |
| JavaScript disabled      | native scroll      | each chapter is a solid themed block |

### 5.4 Testing

- **Unit (Vitest):** `formatIST` across a date boundary; the contrast test.
- **Static:** `pnpm typecheck`, `pnpm lint`, `pnpm build` clean.
- **Browser (Playwright, installed Chrome):** the three fonts are the ones rendered; one
  `h1`; the skip link is first in tab order; nothing overflows sideways at 360px; the
  clock shows Chennai time; smooth scroll is on by default and off under reduced motion;
  scrolling a chapter to the middle of the window changes the page background to that
  theme's colour and scrolling back restores paper; with JavaScript off a chapter still
  has its own background.

### 5.5 Done when

`pnpm test`, `pnpm e2e`, `pnpm typecheck` and `pnpm lint` all exit 0, and the page has
been inspected once at desktop and phone width.

## 6. Phase 2 design (loader, hero, particle object)

Approved to build on 2026-11-13. The brief fixes what appears; this records how.

### 6.1 Composition

- **Desktop (1024px and wider):** subtitle and status pill top-left, the particle object
  right of centre, the name in capitals across the full width at the bottom of the first
  screen. The name is sized from its container's width, so it always fills the line
  exactly.
- **Phone and tablet:** the visual first, then name, subtitle, pill.
- The capitals come from CSS (`text-transform`); the text in the page is
  "Harshavardhanan", which is what search engines and screen readers get.
- Each letter is its own box so it can rise on its own. That loses the font's built-in
  spacing between pairs such as A and V, so those pairs are measured and put back.

### 6.2 The particle object

- One fixed set of 5,000 points. A shape is a list of 5,000 positions; the object eases
  every point toward the current shape's position each frame. Because it eases from
  wherever the points are now, it can change shape mid-morph without a jump.
- **No GSAP in this phase.** The brief suggests GSAP for the morph; a per-frame ease
  does the same job in a few lines and handles interruption better. GSAP arrives in
  Phase 3 with the scroll-driven reveals and count-ups. **No drei either**; nothing here
  needs it.
- Shapes are generated in code (`lib/shapes.ts`): dot, cloud, waveform, tooth, road
  with pothole, video tiles, block stack, speech bubble. Odovox plays waveform, then
  tooth.
- The object follows `<html data-theme>`, which the theme watcher already sets, so it
  needs no new wiring. Its colour is the theme's `accent`, read from CSS each frame, so
  it fades in step with the page.
- It lives in a layer that stays on screen from the hero to the end of the last chapter
  and then scrolls away, so it never sits behind the About or Contact text. Chapter text
  moves to the left 8 of 12 columns to leave it room.
- It is created only at 1024px and wider, with WebGL available and reduced motion off.
  The library loads after first paint, and drawing pauses when the layer is off screen.

### 6.3 Fallback

- Everyone first gets a still image of the cloud (`hero-poster.avif`), including with
  JavaScript off. On desktop the live object replaces it once ready.
- Phones, tablets and browsers without WebGL then get the looping video
  (`hero-loop.webm` / `.mp4`). Under reduced motion the still image stays; a looping
  video is motion.
- **The video and still are recorded from the site's own particle object**
  (`scripts/record-hero.mjs`), so they match it exactly. The brief planned the video
  first and the object second; the order is swapped because the one is made from the
  other. A Veo clip saved under the same file names replaces them with no code change.
- The video is recorded on white and blended onto the page (`multiply`), so its
  background always matches the paper exactly.

### 6.4 Loader

- Paper, a mono counter 000 to 100, and "H.R." in the name's size and position. On
  desktop the particle object shows as a dot and spreads into the cloud as the loader
  leaves.
- It is CSS-timed: 1.4s, then a 0.5s fade. A small inline script decides whether to show
  it (first visit in the session, reduced motion off) before the page first paints. It
  does not wait on JavaScript loading, so a slow phone is not held on the loader.
- The subtitle is never hidden or animated, so the largest text is painted at once and
  the loader does not delay the performance score's main measure.
- With JavaScript off there is no loader and the name's letters still rise.

## 7. Phases 3 to 6 design (built back to back from 2026-11-13)

Harsha chose "build it all, no stops" after seeing Phases 1 and 2. Review happens at
the end; anything drafted on his behalf is marked on the page and listed for him.

### 7.1 No animation library

GSAP is still not installed. Count-ups are a 25-line component; reveals use the
browser's scroll-driven animations (`animation-timeline: view()`), which need no
JavaScript and simply do not run in browsers without them; the page wipe is CSS driven
by one attribute. If a later effect needs GSAP it is added then.

### 7.2 Media stand-ins

Only the portrait and résumé were supplied. The five covers and five case videos are
recorded from the site's own particle symbols in each project's colours
(`scripts/record-covers.mjs`), under the brief's file names, so the whole set is one
family and nothing is passed off as footage. Generated images or Veo clips saved under
the same names replace them with no code change. No paid image generation was used.

### 7.3 Demos

All five run in the browser with no network calls, work by keyboard, and state plainly
that they are scripted or simulated.

- **Road Damage** has no dashcam video to draw boxes on, so the demo is a top-down
  strip of the scored clip's 17 potholes with the detections of each model drawn on it,
  beside the three mAP50 figures. Positions are illustrative and labelled so; counts
  are the résumé's.
- **Cache Wars** runs a real simulation (`lib/cache-sim.ts`): LRU, LFU and a small
  learning agent on a seeded request trace. Its numbers are the simulation's own and
  are labelled as such; the project's "+10–15%" figure is shown separately.
- **Spot the Hallucination** uses five well-established facts, drafted for Harsha to
  check.

### 7.4 Facts taken from the résumé

- The pothole count (10 of 17 against 4) is on a scored 60-second dashcam clip, and
  compares a pothole-specialised model with the general model.
- At a 10% budget the benefit-maximising schedule repairs 0.5% of the worst-condition
  roads, against 39% under worst-first. This is a failure of the optimiser and is
  presented as one.
- Years are known only for Odovox and Kattral (2026). The other three show no year.

### 7.5 Drafted copy

Case-study "what was hard" text for Odovox, Kattral, Edge Cache and Hallucination
Detection is reasoned from the brief's facts, not reported by Harsha. Those sections,
and the bio, carry a visible "draft" tag until he confirms them (`draft: true` in
`content/projects.ts`).

### 7.6 Contact form

No Resend account exists, so the form opens the visitor's mail app with the message
filled in, and says so. It does not claim a message was received.

### 7.7 Cursors

Inside a project's theme the system arrow is replaced by that project's cursor, drawn
exactly at the pointer (no lag). Outside project themes, on touch devices and under
reduced motion the system cursor is untouched.
