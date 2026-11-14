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
