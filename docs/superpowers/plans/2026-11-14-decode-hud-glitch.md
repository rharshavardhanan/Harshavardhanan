# Text decode, ring HUD, Hallucination glitch — plan

Source: Harsha, 2026-11-14, a pasted spec: three elements inspired by igloo.inc
(our own implementation, in our design). Build in order 1, 2, 3 and **stop after
each for review** (this request overrides the "build straight through" habit).

## Part 1: text decode

What it is: random characters ("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/_-") that
settle, left to right, into the real text.

Decisions taken while planning (for review):

- **Timing.** For text of n characters over a duration D (0.8s): letter i locks
  at (i+1)·D/n, so the per-letter delay is D/n and the last letter locks at
  exactly D. Before locking, each letter shows 3–6 random characters, each held
  40ms (25 a second: choppy, readable), so its flicker starts up to 0.24s before
  its lock (sooner for the first letters, whose lock comes earlier: their
  flickers are just quicker). Before its flicker starts a letter is blank.
  Spaces never flicker, so word shapes hold.
- **Width.** Instead of measuring and fixing a width, the real text stays in
  place, made transparent, and the noise is drawn over it in a layer that
  cannot change the layout (absolutely positioned, clipped). The box is always
  exactly the final text's: no measuring, no jump, and wrapping works.
- **Screen readers.** The spec asked for aria-label on the element. ARIA 1.2
  forbids aria-label on plain spans and paragraphs (axe flags it, and the e2e
  suite runs axe), so instead the real text itself stays in the page (only its
  colour is transparent while decoding; screen readers still read it) and the
  noise layer is aria-hidden. Same result for listeners.
- **Where.** The frame's bottom row (project name, "03 / 07") each time it
  changes; the menu's project names and numbers each time it opens (staggered
  like the rows' rise); on project pages the credits values, the "03 / 07" over
  the title and each section's label, once, as they come into view. Not the
  demos' and proofs' captions (figure captions, some of them live status text).
- **No GSAP.** Labels on the page are found when the page is handed to React
  (a layout effect in `Motion.tsx`, before it waits for GSAP) and decode when
  an IntersectionObserver sees them, so in-view labels decode before they are
  seen, except on a hard reload, where the server's HTML paints first.
- **Reduced motion and no JavaScript:** the plain text, nothing else.

### Task 1.1: the decode's timing, as pure functions

- **Goal:** `plan(text, duration, random)` says when each letter starts flickering, when it locks and which characters it shows; `frame(text, letters, t)` gives the text at time t.
- **Why:** The timing is the whole effect; as pure functions it can be tested exactly.
- **Files:** create `lib/scramble.ts`, `lib/scramble.test.ts`.
- **Done when:** `pnpm test lib/scramble.test.ts` passes: final text at t ≥ D; letters lock left to right at (i+1)·D/n; every letter shows 3–6 characters from the set before locking; spaces stay spaces; nothing shows before a letter's flicker starts.

### Task 1.2: the frame and the menu decode

- **Goal:** The frame's bottom row decodes each new project name and count; the menu's names and numbers decode as it opens; the text's box never changes size while decoding; screen readers only ever get the real text; reduced motion shows plain text.
- **Why:** These are the labels that change while you watch.
- **Files:** `lib/scramble.ts` (`scramble()`), create `components/Decode.tsx`, `components/CornerStatus.tsx`, `components/Menu.tsx`, `app/globals.css` (Decode), create `e2e/decode.e2e.ts`.
- **Done when:** `pnpm e2e decode` passes "the frame decodes the project as the ring turns" (noise seen, then the real name; width unchanged; the noise is aria-hidden), "the menu's names decode as it opens", "reduced motion: no decode".

### Task 1.3: labels on project pages decode as they come into view

- **Goal:** Credits values, the counter over the title and section labels decode once, when first seen.
- **Files:** `lib/scramble.ts` (`wrap()`), `components/Motion.tsx`, `app/work/[slug]/page.tsx` (`data-decode` on those three).
- **Done when:** `pnpm e2e decode` passes "a project page's credits and section labels decode once, in view", and the whole suite (`pnpm e2e`, `pnpm test`, typecheck, lint) passes.

**Part 1 status: built 2026-11-14, waiting for Harsha's review.** `pnpm test`
67 passed (scramble 4), `pnpm e2e` 115 passed (decode 4); screenshots of the
menu (0.45s / 0.65s / 1.3s) and a project page mid-decode checked.

Then stop for Harsha's review.

## Part 2: HUD on the centre ring panel (after review of part 1)

To check before building: every note on the panels must be a real figure from
the brief, the résumé or the repos. "mAP50 0.389" must match the site's
figure; "POTHOLE 0.87" and "HANDOVER t=1.2s" need a source or Harsha's word.

## Part 3: Hallucination glitch (after review of part 2)
