# Design

The visual system as built. `docs/brief.md` says what was asked for; this records what
exists, so later work matches it.

## Idea

A quiet editorial shell about one engineer. Each project takes the whole window over
with its own colour world and a miniature a visitor can operate. One particle object
ties them together: a sphere in the shell, each project's symbol in its chapter.

## Colour

Components never name a colour. They use five roles, and the active theme assigns them
(`app/globals.css`, "Themes"):

| Role | Utility | Neutral | Ink | In a project theme |
|---|---|---|---|---|
| `bg` | `bg-bg` | paper `#F4F2EE` | ink `#0E0E0E` | the project's background |
| `fg` | `text-fg` | ink | paper | paper |
| `muted` | `text-muted` | `#66635C` | `#8A877F` | `#8A877F` |
| `accent` | `text-accent`, `bg-accent` | ink | paper | the project's accent |
| `line` | `border-line` | `#D9D5CC` | `#373736` | foreground mixed 18% into background |

Project themes: odovox `#0F1F1C` / `#7FF2C9`, road `#121212` / `#FFC93C`, kattral
`#1C1410` / `#FF8A3D`, cache `#0B1020` / `#4D8BFF`, hallucination `#16111F` / `#B69CFF`.

- The shell is light. Project accents are never text on paper.
- A theme is applied with `data-theme` on any element. On the home page the chapter
  crossing mid-screen sets it on `<html>`; the browser fades the roles over 600ms.
- The footer is always `ink`. The "next project" block on a case study wears the next
  project's theme.
- `app/tokens.test.ts` fails the build if any theme's text falls below 4.5:1.

## Type

- **Instrument Serif**: headings, figures, the name. Italic for emphasis only.
- **Inter Tight**: everything read as prose.
- **JetBrains Mono**: labels, numbers, roles, tags, small controls.

Sizes are five fluid tokens: `text-display` (case-study titles), `text-title`,
`text-lead`, `text-body`, `text-label`. Two lines are sized from their container so
they always fill it: the name (`.name`) and the footer line (`.lets-build`).

## Layout

- Twelve columns, `gap-x-4`, side margin `px-gutter` (1rem to 4rem).
- Sections are separated by space and hairlines, not boxes. The only framed things are
  demos (a hairline frame with a mono caption row) and the portrait.
- On wide screens the particle object owns the right four columns from the hero to the
  end of the last chapter; text there stays in the left seven.
- Chapters all share one order: number, title, role, pitch, three figures, demo, link.

## Components

- **Button** `.btn`: accent outline, fills on hover, leans toward the pointer.
  `.btn-quiet`: underlined mono text. `.seg`: one option in a row of choices.
- **Figure** `.stat`: a serif number or short phrase over a mono label, counting up
  once when first seen.
- **Demo frame**: title left in accent, an honest note right ("Scripted example",
  "Simulated in your browser").
- **Flow**: numbered steps down a hairline with accent dots.
- **Draft tag**: a small outlined mono label on any copy Harsha has not confirmed.

## Motion

Only `transform`, `opacity`, `clip-path` and colour move. One strong ease-out
(`--ease-out`) for anything that enters or responds.

- Authored moments: the loader (once per session), the name's letters rising, the
  particle morph, the colour change between worlds, the page wipe.
- Text marked `data-reveal` rises as it scrolls in, driven by the scroll position.
- Under `prefers-reduced-motion`: no loader, no live particles or video, no smooth
  scroll, no wipe, no custom cursor, demos jump to their end state, colour changes in
  200ms.

## Cursor

Outside project themes, the system cursor. Inside one, that project's cursor, drawn
exactly at the pointer: mic dot, detection box with label, raised-hand dot, block,
scan line. Mouse only.

## Media

Covers, case videos, the hero still and loop, and the link-preview image are all
recorded from the site's own particle object (`scripts/`). Replacement artwork saved
under the same file names needs no code change. The portrait is shown as a framed
print because its paper is warmer than the page's.
