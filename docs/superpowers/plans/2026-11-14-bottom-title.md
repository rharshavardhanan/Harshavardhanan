# The project's name at the bottom centre, in the serif — plan

Source: Harsha, 2026-11-14 (a screenshot of the frame's bottom-left
"AFTERMEET"): "can this display in the bottom centre, a little bit larger
and a different font?"

### Task 1: The bottom row: SELECTED WORK · Project name · 02 / 07

- **Goal:** The project in front is named at the bottom centre in Instrument Serif, written as a title (not capitals), 20–28px (between the 14px labels and Harsha's 22–40px name above it); SELECTED WORK moves to the left (on phones its place stays, empty, so the name stays centred); the count stays right. The name still decodes on change and truncates rather than collide on narrow phones.
- **Why:** At 14px in capitals in a corner, the film's title read as a minor label.
- **Files:** `components/CornerStatus.tsx`, `app/globals.css` (`.corner-project`, the bottom row's three columns 1 : 2.4 : 1), `e2e/frame.e2e.ts`, `e2e/decode.e2e.ts` (they found the name as the row's first child), `DESIGN.md` (the frame row; the serif exception).
- **Status: done (2026-11-14).** 120 e2e, 80 unit; screenshots at 1440 and 393 checked (the longest name is cut short on a phone: about 180px for 240px of name).
- **Done when:** `pnpm e2e frame` passes "the project's name is at the bottom centre, in the serif" at 1280×800 and 360×740 (its middle within 2px of the window's, font Instrument Serif, not uppercase); `pnpm e2e` and `pnpm test` pass; screenshots at 1440 and 393 checked.

### Follow-up (2026-11-15): Space Mono, bigger on desktop, legible everywhere

Harsha: "more cyber, technical, AI/ML font", "legible and aesthetic as well",
then "more size in desktop". Four candidates rendered in place (JetBrains Mono,
Space Mono, Chakra Petch, Oxanium); Harsha chose **Space Mono**: capitals,
0.1em, 20px at 1280 → 23px at 1440 → 28px; phones 15px, 0.02em, a wider
middle column (1 : 3.6 : 1); long names wrap (never cut) at every width.
Found while checking and fixed: on a 360px phone Sequential Conformal
Prediction's scroll cue sat under the two-line name (the phone title block is
now a little tighter), and on a 1280×800 laptop its credits reached the bottom
row; the name now steps aside while a project page's big title is on screen
(IntersectionObserver over every title block, html[data-title-shown]).
Tests: "...in Space Mono" (1280, 360: font, capitals, size, centred, not cut,
≤ 2 lines), "...steps aside while the big title is on screen", "...title block
clears the frame's bottom row" (360).
