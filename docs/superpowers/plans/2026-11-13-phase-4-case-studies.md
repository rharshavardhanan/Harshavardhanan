# Phase 4: Case-study pages

Brainstorm: design doc section 7 (drafted copy is tagged; no new dependencies).

**Goal:** Each project has its own page at `/work/<slug>`, in its own colours, that a recruiter can read in a minute: what the problem was, what was built, what came of it, how it fits together, and what was hard.

### Task 1: Page template

- **Goal:** `/work/odovox`, `/work/road`, `/work/kattral`, `/work/cache` and `/work/hallucination` render from `content/projects.ts`.
- **Why:** Every "Open case study" link on the home page currently leads nowhere.
- **Files:** `app/work/[slug]/page.tsx`, `components/ThemeSetter.tsx`, `components/LoopVideo.tsx`, `components/Flow.tsx`, `components/Header.tsx` (links work from any page), `app/globals.css`, `e2e/case.e2e.ts`.
- **Steps:** write browser tests (each page: status 200, one h1, themed background, the five sections, the demo, a next link that reaches every project in a loop; unknown slug is a 404; drafted sections carry the tag; reduced motion gets no video); implement the template; add the display type size and flow styles.
- **Done when:** `pnpm e2e e2e/case.e2e.ts` passes.

### Task 2: Verify, inspect, commit

- **Done when:** the full pipeline exits 0, one case study has been looked at on desktop and phone, and `git log` shows the Phase 4 commit.

## As built

- Done. `e2e/case.e2e.ts` has 9 tests.
- `partialPrefetching` was removed from `next.config.ts`: with it on, an unknown address under `/work/` answered 200 with the not-found text; without it the answer is a proper 404.
- After a client-side navigation Next.js keeps the previous page in the document, hidden. Tests therefore ask for the visible heading by role.
- Header links are `/#work`, `/#about`, `/#contact` so they work from case studies.
