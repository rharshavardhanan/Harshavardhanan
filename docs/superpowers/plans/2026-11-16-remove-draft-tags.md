# Remove the project draft tags

**Goal:** No project page shows "Draft · Harsha to confirm".

**Asked by Harsha (2026-11-16):** "remove draft harsha to confirm from every project".

**Constraint the ask didn't state:** the tag sat only on "What was hard", on four
projects (odovox, kattral, cache, hallucination). Removing it presents those four
texts as confirmed. Kattral's (the NextAuth → backend-token bridge) has not been
confirmed as Harsha's part; that is flagged to him, not blocked on.

**Out of scope:** the About page's own "Draft · Harsha to rewrite" tag on the bio
(`content/about.ts`, `bioIsDraft`): not a project. Mentioned to Harsha.

**Scope (ponytail):** with no project flagged, the `draft` field and its render
are dead code, so they go too, not just the four flags.

## Task 1: No draft tag on any project page

- **Goal:** every project page renders without the draft tag, and the field that
  drove it no longer exists.
- **Why:** the tag tells a recruiter the copy isn't final; Harsha wants it gone.
- **Files:**
  - `e2e/case.e2e.ts` (assert no tag on every project)
  - `content/projects.ts` (drop `draft?: boolean`, the four `draft: true`, the header comment about it)
  - `app/work/[slug]/page.tsx` (drop the tag's render)
  - `CLAUDE.md` (the `content/` line that describes `draft: true`)
- **Steps:**
  - [x] Change the case test to expect zero "Harsha to confirm" tags on every project.
  - [x] Run it: odovox, kattral, cache, hallucination fail (red).
  - [x] Remove the field, flags, render and doc line.
  - [x] Run typecheck, lint, unit tests and the full e2e suite (green).
  - [x] Commit locally; push only when Harsha asks.
- **Done when:** `pnpm e2e e2e/case.e2e.ts` passes with the zero-tag assertion for
  all seven projects, `grep -rn "Harsha to confirm\|draft" app components content`
  shows only the About bio's own flag, and `pnpm typecheck && pnpm lint && pnpm test`
  exit 0.
