# Design

The visual system as built after the v3 "cinematic" rebuild (2026-11-14).

- What was asked for: `docs/brief-v3.md`; the facts and copy are still from `docs/brief.md`.
- What was decided: `docs/superpowers/specs/2026-11-14-v3-cinematic-design.md`.

This file records what exists.

## Idea

The site is image-first and almost wordless at the front, with every bit of evidence behind it.

- **The home page** is one screen: a ring of seven film panels in WebGL.
- **Each project page** opens like a film poster: giant title, film credits, the film, and one line read out word by word. Then it gets down to proof: the real product, a working demo, and the detail, including where it broke.
- **The frame:** small capitals pinned to the four corners hold everything together.

## Type: five sizes, nothing under 13px

| Token          | Size                                                 | Use                                                                  |
| -------------- | ---------------------------------------------------- | -------------------------------------------------------------------- |
| `text-display` | 56 to 280px                                          | project titles                                                       |
| `text-h2`      | 48 to 160px                                          | the quote lines, section titles, the menu's project names            |
| `text-h3`      | 32 to 40px                                           | synopsis, the bio's first and last lines, statements, laurel figures |
| `text-body`    | 18 to 20px                                           | prose, skills                                                        |
| `label`        | 14px Inter Tight, uppercase, 0.04em, tabular figures | the frame, credits, captions, controls                               |

Instrument Serif for everything large, Inter Tight for everything else. JetBrains Mono appears only inside the demos: `DemoFrame` sets `--label-font`, which `label` reads. One exception, asked for by Harsha: the menu's project names, 40 to 96px, sized so the longest fits its column and all seven fit the window.

## Colour

Components use five roles (`bg`, `fg`, `muted`, `accent`, `line`); a theme assigns them (`app/globals.css`, "Themes").

- **Themes:**
  - Each project has one; the neutral paper and ink themes cover the rest of the site.
  - Aftermeet is the one light project (`tone: "light"` in `content/projects.ts`).
  - `app/tokens.test.ts` enforces 4.5:1 for all text and 7:1 for labels on dark themes.
- **The home page** takes the colours of the project in the middle of the ring, fading from one to the next (700ms).
- **The frame** is ink or paper, chosen by what lies under its top row and its bottom row separately (`components/Tone.tsx`, `data-tone` / `data-tone-bottom`).
  - Over a film it is paper on a soft dark band (`data-tone="media"`).
  - On phones the home ring always uses the band, since neighbouring films slide under the corners.
  - No difference blending anywhere: contrast stays measurable.
- **Films** carry a light dimming layer, so the quote and the frame stay readable over them.

## Layout

Twelve columns, `px-gutter` margins.

| Part         | Composition                                                                                                                                                                                                                                                                                                                                                                 |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frame        | MENU (+ SOUND on desktop) · HARSHAVARDHANAN · INQUIRE; project name · SELECTED WORK · "03 / 07"                                                                                                                                                                                                                                                                             |
| Home         | the WebGL ring: 16:9 panels about 85% of the width, sides curved towards you like a cinema screen, rounded corners, neighbours peeking in, a faint floor glow (one tall panel per screen on phones); over a scroll-snap list of posters that is the fallback                                                                                                                |
| Menu         | dark full-window dialog: a bar (CLOSE ✕ · HARSHAVARDHANAN · INQUIRE); the seven names one per line, each led by its number (accent dot and "you're here" on the current one); the pointed-at poster with its line, role and year on the right; Home · About · Inquire · Résumé and the anomaly count at the bottom. Phones: one column with a small poster before each name |
| Inquire      | the contact sheet as a dialog, and as `/contact`: email filling its row (click to copy), Chennai clock, links, mailto form                                                                                                                                                                                                                                                  |
| Project page | poster (number, giant centred title, credits, torn bottom edge) over the sticky film; 220svh quote track; synopsis and three laurels; the real thing (`components/proof/`); Try it; The detail; How it fits together; What was hard (inverted, torn in and out); the next project's poster growing over two screens                                                         |
| About        | one screen at 1440×900: portrait, bio (first and last lines large), credits including Awards, one line of skills per group                                                                                                                                                                                                                                                  |

## Components

- `Menu`: the site menu, a modal `<dialog>`. Focus starts on the first project, the arrow keys move between them, and Escape plays the closing. Choosing a project fades the others and morphs its poster into the new page's film (view transition). The page is locked while it is open.
- `components/ring/`, the home ring:
  - `gl.ts`: raw WebGL2, one 48×24 grid shape, one texture per panel.
  - `shaders.ts`: three passes. The cursor trail (a feedback texture that fades 5% a frame); the moving background (slow smoky noise in the middle project's colour); the panels (curved like a cinema screen, pushed and colour-split by the trail and by speed, side panels dimmed, rounded corners, vignette). Film grain, stepped at 24 fps, is shared by both. Every uniform is commented; the settings are in `LOOK` at the top of `gl.ts`.
  - `Ring.tsx`: input, easing, the snap, which films play, open and back transitions.
- `Film`: poster plus video, the `film-<slug>` view-transition name, the AI label, a Play button under reduced motion.
- `NextProject`: the next poster, growing with scroll; it opens the next page after a 350ms hold at full size.
- `Torn`: a seeded torn-paper edge (`lib/torn.ts`). `Laurel`: a figure between two branches.
- `Frame`: CSS device frames (browser, laptop, phone). `MediaView`: a real file, or the cover with a "Placeholder" label.
- `.btn` (outline in accent), `.word` (big choice word), and the demo caption (name in accent, honest note).

## Motion

- **Library:** GSAP (ScrollTrigger, SplitText), driven by Lenis, all fetched after load. Curves are expo or power4 out.
- **Effects:**
  - `data-lines` rises line by line from a mask.
  - `data-words` brightens word by word across its track, and stays hidden until the track arrives.
  - `data-edge` (torn edges) stretches with scroll speed and settles back.
  - Media unclips; diagram lines draw down.
- **The ring:**
  - Turns are eased at 8% per 1/60s and snap after 140ms without input.
  - Opening a project: the middle panel unbends and fills the window (700ms), then the page changes inside a React `ViewTransition` (`film-<slug>`), and the film carries on from the same second.
  - Back starts expanded and settles (800ms).
- **Loader:** on a first visit, a counter and "H.R." for 1.1s, then the panels fly in from depth, nearest first (900ms, 60ms apart).
- **Under `prefers-reduced-motion`:**
  - No loader, smooth scroll or ring (the poster list is the home page).
  - No word reveal, no growing next project, and nothing opens by itself.
  - Films show their poster with a Play button. No custom cursor.
  - Demos jump to their end state.

## Cursor

A 12px dot that follows the pointer (difference blending). It grows over links, and becomes a 72px circle with a word over media ("View", "Play", "Copy"). Mouse only.

## Sound

Off by default. When on, scrolling makes a soft wooden tick every 90px, like a ratchet or a fidget wheel; the home ring ticks every quarter panel it turns. At most one tick per 45ms, each pitched a little differently. Made in the browser (`lib/sound.ts`); the films are never heard.
