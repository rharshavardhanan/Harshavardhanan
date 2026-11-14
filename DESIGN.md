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

Instrument Serif for everything large, Inter Tight for everything else. JetBrains Mono appears only inside the demos: `DemoFrame` sets `--label-font`, which `label` reads. Two exceptions, asked for by Harsha: his name in the frame (Instrument Serif, 22 to 40px, written as a name, not small capitals), and the menu's project names, 40 to 96px, sized so the longest fits its column and all seven fit the window.

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

| Part         | Composition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frame        | MENU · Harshavardhanan (serif) · ABOUT (from 640px) · GITHUB ↗ · LINKEDIN ↗ (from 1024px) · INQUIRE; project name · SELECTED WORK · "03 / 07"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Home         | a room of screens: you stand near the middle of a circle and the seven 16:9 panels stand on its rim, facing you, each curved exactly with it. Scrolling turns the room around you; the mouse turns your head a little. Each panel covers 45° of the circle; you stand at its middle with a 44° lens, so the front panel fills about 64% of the width and 65% of the height (its edges 8% taller than its middle), and about 13% of each neighbour shows at the edges. Behind it, a dark glossy oil surface (noise as a height map, lit by diffuse, specular and rim light) that the cursor drags like a finger through oil, with a faint halo behind the front panel. On phones the room turns up and down. Under it all, a scroll-snap list of posters is the fallback |
| Menu         | dark full-window dialog: a bar (CLOSE ✕ · HARSHAVARDHANAN · INQUIRE); the seven names one per line, each led by its number (accent dot and "you're here" on the current one); on the right, Home · About · Inquire · Résumé ↗ · GitHub ↗ · LinkedIn ↗ large, then the pointed-at poster with its line, role and year. Phones: those four links first, then one name per row with a small poster                                                                                                                                                                                                                                                                                                                                                                         |
| Inquire      | the contact sheet as a dialog, and as `/contact`: email filling its row (click to copy), Chennai clock, links, mailto form                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Project page | poster (number, giant centred title, credits, torn bottom edge) over the sticky film; 220svh quote track; synopsis and three laurels; the real thing (`components/proof/`); Try it; The detail; How it fits together; What was hard (inverted, torn in and out); the next project's poster growing over two screens                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| About        | one screen at 1440×900: portrait, bio (first and last lines large), credits including Awards, one line of skills per group                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

## Components

- `Menu`: the site menu, a modal `<dialog>`. Focus starts on the first project, the arrow keys move between them, and Escape plays the closing. Choosing a project fades the others and morphs its poster into the new page's film (view transition). The page is locked while it is open.
- `components/ring/`, the home ring:
  - `gl.ts`: raw WebGL2, one 48×24 grid shape, one texture per panel.
  - `shaders.ts`: the cursor trail (a feedback texture that fades 5% a frame); the panels, placed on the circle with sin and cos (`VERTEX`), then pushed and colour-split by the trail and by speed, and softer, greyer and darker the further round they are, with rounded corners and a vignette; and the oil surface `SMOKE` (on its own half-resolution canvas, `smoke.ts`, with its own cursor trail, `trail.ts`: one WebGL context cannot read another's pictures). Film grain, stepped at 24 fps, is multiplied into the films (black stays black; 0.025 in front, up to 0.07 at the sides) and added to the smoke (0.035). Every uniform is commented; the settings are in `LOOK` in `gl.ts` and `smoke.ts`, and the room's proportions are in `lib/ring.ts`.
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
- **Loader:** on a first visit, a counter to 100 and "Harshavardhanan" centred across the window in the serif, dark grey (30% white), filling with white from left to right (a clipped copy on top). The count and the fill share one steady ease-in-out over 1.4s, so the white edge moves with the number. On the home page it then waits on an Enter button (focused): that click is what lets the browser play the ring's ticks from the first panel. Other pages lift by themselves at 1.5s. Then the panels fly in from depth, nearest first (900ms, 60ms apart).
- **Under `prefers-reduced-motion`:**
  - No loader, smooth scroll or ring (the poster list is the home page).
  - No word reveal, no growing next project, and nothing opens by itself.
  - Films show their poster with a Play button. No custom cursor.
  - Demos jump to their end state.

## Cursor

A 12px dot that follows the pointer (difference blending). It grows over links, and becomes a 72px circle with a word over media ("View", "Play", "Copy"). Mouse only. Inside the menu and Inquire (drawn above the dot) the ordinary pointer shows instead, everywhere in them: the frame lets the pointer through, so its dialogs take it back whole (`.corners dialog`), not just their links.

## Sound

No switch (Harsha, 2026-11-14). The sounds play from the visitor's first click, key or tap (browsers allow none before that), and never under reduced motion. All are made in the browser (`lib/sound.ts`, Web Audio); none is a file:

- **tick:** a soft, dull "tok". It is 10ms of noise × exp(-t/0.5ms), rendered once (OfflineAudioContext) through a 1kHz band-pass (Q 0.9) and a 3kHz low-pass, with its peak set to 0.56. One plays for each panel reaching the home ring's centre; pages scroll silently. At most one per 35ms, each detuned ±25 cents.
- **click:** the same, softer and lower (4ms, 1400Hz), on opening a panel.
- **select:** a sine falling from 1200 to 900Hz over 60ms, on other links.
- **menuOpen / menuClose:** 120ms of noise through a low-pass sweeping 600→2400Hz, or back.

Everything runs through one master gain (0.8); the studio is suspended while the tab is hidden. The films are never heard.
