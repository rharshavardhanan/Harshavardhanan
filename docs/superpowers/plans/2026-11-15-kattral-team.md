# Kattral: a team project, credited as one — plan

Source: Harsha, 2026-11-15: "Kattral is not my own project, it is a project I
helped build"; "I built the LiveKit web UI, the classroom feature"; "it was a
team of 4: Hanish Vigneshwar, Akilesh Guhan, Karthik J". It stays in his work.

The page claimed the opposite ("Full stack: owned by one developer"; "with the
whole stack owned by one developer", from the v2 brief's "Owned the full
stack"). Assumed: "Akilesh Guhan" is the "Akileshguhan A" credited on the SCP
page (same spelling used); to confirm.

**Status: done (2026-11-15).** 80 unit, 129 e2e; the page checked at 1440 and 360.

### Task 1: Kattral says what Harsha built, and who built the rest

- **Goal:** No sole-ownership claim anywhere; a Team credit names the other three; the stats and "built" lead with his two parts (the classroom feature, the LiveKit web UI); the result says a team of four built it at Zerofence, May–July 2026. Still marked draft ("What was hard" is about the sign-in bridge, which may not be his part: to confirm).
- **Files:** `content/projects.ts` (kattral), `e2e/case.e2e.ts`, `e2e/frame.e2e.ts` (the title-block clearance test covers every project, since a Team row makes Kattral's credits as tall as SCP's).
- **Done when:** `pnpm e2e case` passes "Kattral credits its team and Harsha's part" (Team row with all three names; "one developer" nowhere on the page); `pnpm e2e frame` passes the clearance test for all seven projects at 360×740; full suites pass.
