# Phones: the ring stays centred after a swipe — plan

Source: Harsha, 2026-11-14, a phone screenshot of the live site: "after one
scroll the home page slightly shifts to the left; make it responsive to all
screen sizes". The panel was cut off on the left with a gap on the right; the
fixed frame (MENU, INQUIRE, the bottom row) had not moved.

**Status: done (2026-11-14).** `pnpm test` 68, `pnpm e2e` 116 passed (one run
had a one-off failure in the Aftermeet demo's paste test, unrelated: it passed
alone and on the rerun). Camera shift after a swipe, films frozen on one
frame (`scratchpad/frozen.cjs`):

| size | live (old) | fixed |
| --- | --- | --- |
| 360×740 | 31.5px | 0 |
| 393×852 | 35px | 0 |
| 768×1024 (now up and down) | panel 1049px on 768 | 0 |
| 1024×1366 (now up and down) | (same overflow) | 0 |
| 1024×768, 1280×800, 1920×1080 | – | 0 |
| 740×360 (now sideways) | – | same frame position, checked by eye |

## Root cause (reproduced)

`scratchpad/phone.cjs`: a 393×852 touch phone, one upward swipe, then the
centre panel's margins along the middle row.

| finger at        | margins before | after              |
| ---------------- | -------------- | ------------------ |
| x = 330 (right)  | 31 / 31        | 0 / 70 (35px left) |
| x = 196 (middle) | 31 / 31        | 32 / 31            |

The page never scrolled sideways (scrollX 0, width 393). The camera did:
`components/ring/Ring.tsx` turns the head up to 3° towards the pointer (`look`,
from `s.mouse`), and `onMove` sets `s.mouse` from every pointer, touch
included. A mouse keeps moving, so the turn follows it; a finger lifts off at
the side and the head stays turned there.

### Task 1: Only a mouse turns the head

- **Goal:** After any swipe or tap on a touch screen the ring eases back to dead centre; with a mouse, the head still follows the pointer.
- **Why:** On phones the whole room ends up turned to one side after a swipe.
- **Files:** `components/ring/Ring.tsx` (`onMove`: remember whether the last pointer was a mouse; the head turn and the smoke's lean aim at the middle otherwise), `e2e/ring.e2e.ts`.
- **Steps:** a test that swipes with the finger on the right of a touch phone and expects equal margins; watch it fail (0 / 70); fix; watch it pass.
- **Done when:** `pnpm e2e ring` passes "a swipe on a phone leaves the ring centred", and fails without the fix.

### Task 2: Every size checked

- **Goal:** The home ring is centred, with no sideways page scroll, at 360×740, 393×852, 768×1024, 1024×768, 1280×800, 1440×900 and 1920×1080, before and after a swipe or wheel turn.
- **Done when:** a sweep script reports equal margins (±2px) and `scrollWidth == width` at each, with screenshots checked by eye; the full suite passes.

### Task 3: The window's shape picks the ring's direction

Found by the Task 2 sweep: at 768×1024 (a tablet held upright) the ring ran
sideways and its front panel was 1049px wide on a 768px screen, both edges
cut off, no neighbours. `lib/ring.ts` chose the direction by width alone
(`vw < 768`). Sideways, a 45° panel takes tan(22.5°) / (tan(22°) × vw/vh) of
the width: more than all of it on any upright window (every iPad portrait, a
narrow desktop window), and a phone on its side got the up-and-down layout.

- **Goal:** Sideways only when the window is at least 1.2 times as wide as it is tall (the front panel then takes at most 85% of the width); otherwise up and down. The front panel fits the window at every size.
- **Files:** `lib/ring.ts`, `lib/ring.test.ts`.
- **Done when:** `pnpm test lib/ring.test.ts` passes "the window's shape picks the direction; the front panel always fits" over 13 sizes from 360×740 to 2560×1080, including 768×1024, 1024×1366, 1000×1000 and a phone on its side (740×360); and the sweep shows 768×1024 running up and down, centred.
