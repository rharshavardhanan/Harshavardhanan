# Design

The visual system as built (after the redesign of 2026-11-14). `docs/brief.md` and
`docs/brief-redesign.md` say what was asked for; this records what exists.

## Idea

A quiet editorial shell about one engineer; each project takes the screen over in its
own colour with a working miniature of what it does. One particle object travels
through it: a large sphere behind the name, then each project's symbol.

## Type: five sizes, nothing under 13px

| Token | Size | Use |
|---|---|---|
| `text-display` | 56 to 280px | the name, chapter titles, giant figures |
| `text-h2` | 56 to 120px | section titles, figures, big choice words |
| `text-h3` | 32 to 40px | statements, dictation, the bio, skills |
| `text-body` | 18 to 20px | prose |
| `label` | 13 to 14px mono, uppercase, 0.06em | labels, numbers, controls |

Instrument Serif for everything large, Inter Tight for prose, JetBrains Mono for
labels. Two lines fill their container exactly: the name (`.name`) and the contact
email (`.email-fit`); so does the footer line (`.lets-build`).

## Colour

Components use five roles (`bg`, `fg`, `muted`, `accent`, `line`); a theme assigns
them (`app/globals.css`, "Themes"). Project backgrounds and accents are as in the brief, plus the sixth project
(`scp`, Sequential Conformal Prediction): lab steel `#10171B`, alarm coral `#FF6A4D`;
and the one light project (`aftermeet`): manila `#F4E9DB`, ink, ember `#9F4500`.
A light project sets `tone: "light"` in `content/projects.ts`.
Secondary text is `#5C5952` on paper and `#B0ADA5` on every dark theme, at least 7:1
there. `app/tokens.test.ts` enforces 4.5:1 for all text and 7:1 for dark-theme labels.

- **Each section paints its own colour** with two layers behind it: the previous
  section's colour and its own. Its own colour arrives as a circle growing from the
  bottom of the window (0.8s, expo in-out). No grey blend.
- **The header** is ink over light parts and paper over dark ones (`data-tone`). Over
  a full-bleed photograph (`data-tone="media"`) a dark band fades in behind it.
- **The hero name** is white with difference blending: dark on paper, light where it
  crosses the particles.

## Layout

Twelve columns, `px-gutter` margins. Borders are almost gone: at most one hairline per
section; separation is by space, scale and colour. Every section has its own
composition:

| Part | Composition |
|---|---|
| Hero | name across the full width, centred over a 74svh particle sphere; pinned while it shrinks away |
| Work index | full-width serif rows; the others dim on hover; a preview trails the pointer; grid view 7/5, 5/7, 12 |
| Odovox | giant title; pitch beside a tilting browser frame; demo beside a sticky laptop recording; three giant figures |
| Sequential CP | a lab notebook: title, three synced recordings of one start, two monitor clips with controls, the matched-α / matched-FAR toggle |
| Aftermeet | a dossier: facts pinned in a narrow left column, the live site, workspace, demo, phone and extension scrolling on the right |
| Road Damage | full-bleed photo under the title; a full-width bar chart; two big choice words |
| Kattral | a pinned sideways strip of three panels; gradient avatars with a speaking ring |
| Edge Cache | centred; three racing percentages and a round Run button; laptop recording |
| Hallucination | one giant answer in the middle; Supported and Made up left and right; scan-line verdict |
| Case study | full-bleed video, large pitch, full-width product, statements with display figures, self-drawing diagram, parallax gallery, inverted "what was hard", demo, huge next-project link |
| About | five-column portrait, bio at h3, skills as big lines, wins marquee |
| Contact | email filling its row (click to copy), underlined fields in large type |

## Components

- `.btn` outline in accent, fills on hover, leans to the pointer; `.btn-quiet`
  underlined; `.word` a big choice word (accent and underlined when chosen).
- `Frame` CSS device frames: browser, laptop, phone.
- `MediaView` real file from `public/media/real/` or the particle cover with a
  "Placeholder · file name" label. A tall screenshot in a wide slot is shown whole,
  in a phone outline on the project's cover.
- Demo caption: name in accent left, honest note right, one hairline under it.

## Motion

Expo/power4 out, 0.8 to 1.4s, staggers about 0.07s. Text with `data-lines` rises line
by line from a mask. Media with `data-scale-in` unclips and settles from 110%. Chart
bars draw in; diagram lines draw down; gallery items drift (parallax). GSAP
(ScrollTrigger, SplitText) driven by Lenis at lerp 0.1, all fetched after load.

Under `prefers-reduced-motion`: no loader, no smooth scroll, no pinning, no sideways
strip, no wipes, no line reveals, no custom cursor, no particle movement or video;
demos jump to their end state.

## Cursor

A 12px dot (difference blending) that follows the pointer; it grows over links and
becomes an 80px circle with a word ("View", "Play", "Copy") over media. Mouse only.
