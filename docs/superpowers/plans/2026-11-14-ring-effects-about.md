# Ring effects and an easier About — plan

Source: Harsha's message of 2026-11-14 (a comparison of the home ring with
zenobasi.com/work by another assistant, plus "also it's harder to reach the about page").

**Goal:** The ring gets the look of the reference, and About is one click from anywhere.

The ring's changes:

- curved at rest
- a cursor that leaves a fading, gooey trail warping the films
- real film grain
- a slowly moving textured background

**Architecture:** Everything stays in the one WebGL2 canvas (`components/ring/`), drawn in three passes per frame:

1. the cursor trail, drawn into a small texture that builds on the last frame
2. the background, full screen and opaque
3. the panels, which read the trail to push their pictures and split their colours

The grain is one GLSL function shared by the background and the panels.

## Global constraints

- No new dependencies. Raw WebGL2; WebGL2 core features only (no float textures).
- Reduced motion: no ring at all (unchanged).
- Every page still works at 360px with no sideways scroll; axe stays clean.
- Corner text stays readable over the new background: the background varies the page colour by at most ±8%.

### Task 1: The ring is curved at rest

- **Goal:** Panels visibly curve when still: bend 0.6 at rest (phones 0.35), plus the speed boost.
- **Why:** At 0.25 the ring looked almost flat.
- **Files:** `components/ring/gl.ts`.
- **Done when:** On a screenshot of `/` at rest (1440×900), the outer edge of a side panel is visibly shorter than its inner edge.

### Task 2: Real film grain on panels and background

- **Goal:** Grain from screen pixels ÷ grain size, re-drawn 24 times a second (stepped), stronger in dark areas, slightly coloured.
- **Why:** The old grain re-randomised every frame and read as shimmer, not film.
- **Files:** `components/ring/shaders.ts`.
- **Done when:** The shaders compile (the ring reaches `data-state="on"` in `e2e/ring.e2e.ts`), and a 2× crop of a dark panel shows grain.

### Task 3: A moving, textured background behind the ring

- **Goal:** A full-screen layer of slow animated noise in the middle project's colour, with the same grain, fading between project colours.
- **Why:** The plain page colour between panels looked flat.
- **Files:** `components/ring/shaders.ts`, `components/ring/gl.ts`, `components/ring/Ring.tsx`.
- **Done when:** Two screenshots of `/` 2 s apart differ between the panels, and the frame still passes `e2e/blend.e2e.ts`.

### Task 4: The cursor leaves a fluid trail that warps the films

- **Goal:** Each frame, the pointer's movement is painted into a small texture that fades a little each time (decay). The panels push their pictures along the trail and split their colours by its strength.
- **Why:** The 0.003 ripple was too small to see, and it had no trail.
- **Files:** `components/ring/shaders.ts`, `components/ring/gl.ts`, `components/ring/Ring.tsx`.
- **Done when:** A screenshot taken right after moving the mouse across the middle panel shows a displaced, colour-split streak; one taken 2 s later shows the panel clean.

### Task 5: About is one click from anywhere

- **Goal:** ABOUT sits beside INQUIRE in the top-right corner from 640px up. In the menu, About, Inquire and Résumé are large serif lines rather than small labels.
- **Why:** About was only a small label inside the menu.
- **Files:** `components/Corners.tsx`, `components/Menu.tsx`, `e2e/frame.e2e.ts`.
- **Done when:** In `e2e/frame.e2e.ts`, ABOUT is visible in the corner at 1280px and leads to `/about`; at 360px nothing scrolls sideways; the menu's About link is at least 32px tall.

Each task is checked with `pnpm typecheck && pnpm lint && pnpm test && pnpm e2e`, then everything goes in one local commit.

### Task 6: The sound is a calm tick while scrolling, and off by default

- **Goal:** Sound stays off until switched on. When on, scrolling a page makes a soft wooden tick every 90px (at most about 22 a second), and turning the home ring ticks every quarter panel. The films are never heard.
- **Why:** Harsha, 2026-11-14: "I want the sound off by default, I just want that tick tick sound, calming fidgety sound while scrolling".
- **Files:** `lib/sound.ts`, `components/Sound.tsx`, `components/ring/Ring.tsx`, `components/Film.tsx`, `e2e/home.e2e.ts`.
- **Done when:** In `e2e/home.e2e.ts › Sound`, the switch starts "sound off"; after it is switched on, scrolling plays ticks (counted by wrapping the page's AudioContext) and every video stays muted.

### Task 7: Every new page starts at the top

- **Goal:** After "next project", the menu or Back, the new page starts at the top.
- **Why:** Lenis keeps its own scroll position and wrote the old page's height back after Next.js jumped to the top (found by Harsha's other assistant, 2026-11-14).
- **Files:** `components/SmoothScroll.tsx`, `e2e/case.e2e.ts`.
- **Done when:** In `e2e/case.e2e.ts`, `scrollY < 50` after "next project", after a menu link, and after Back.

> Tasks 1–7 done 2026-11-14 (104 browser tests passing).

### Task 8: A site menu that is easy to use

- **Goal:** Harsha's spec of 2026-11-14:
  - one project per line with its number, and a preview column (poster, quote, role and year)
  - a bar matching the frame, and a bottom row of links
  - hover and focus light one name and dim the rest
  - a wipe-down opening, and a closing played back
  - choosing a project morphs its poster into the new page's film
  - a modal dialog, arrow keys, `aria-current` and `aria-expanded`
  - the page locked while open (with Lenis stopped)
  - reduced motion: a fade only
  - phones: thumbnails instead of the preview
- **Files:** `components/Menu.tsx`, `components/Inquire.tsx`, `components/SmoothScroll.tsx`, `components/ring/Ring.tsx`, `components/NextProject.tsx`, `app/globals.css`, `e2e/frame.e2e.ts` (and the tests that open the menu).
- **Done when:** `e2e/frame.e2e.ts › MENU opens…` passes (7 projects one per line, `aria-current` on the current one, focus on the first, arrow keys, hover preview, Escape returns focus to MENU), and so does `› choosing a project…`.

### Task 9: The ring looks like a cinema screen

- **Goal:**
  - Each panel curves towards you at its sides (`x²`; bend 0.18 at rest + 0.35 × speed, capped at 0.45, through the 30° lens).
  - Panels fill about 85% of the width, with the neighbours peeking in.
  - Rounded corners (a distance function with `fwidth`), a softer vignette, and a faint floor glow.
  - The grain's inputs are kept small (`mod 512` / `mod 64`) so it never stripes; its strength is 0.05.
- **Files:** `components/ring/shaders.ts`, `components/ring/gl.ts`, `lib/ring.ts`, `app/globals.css`.
- **Done when:** A screenshot of `/` at rest shows a rounded panel whose sides are slightly taller than its middle, with both neighbours visible at the edges.

> Tasks 8–9 done 2026-11-14 (105 browser tests passing).
