# Phase 3: Work index, chapters and demos

Brainstorm: recorded in the design doc, section 7. Plans from here on state each task's
goal, reason, files, steps and check, and leave the code to the files themselves; Phase
2 showed that embedding every file in the plan doubles the work once tuning starts.

**Goal:** Below the hero the home page has a work index with two views, and five themed
chapters that each carry numbers, a working demo and a link to a case study.

## Global constraints

- Copy and numbers only from `docs/brief.md` and `public/resume.pdf`.
- Colour only through the five roles. Motion: `transform`, `opacity`, `clip-path`, colour.
- Every demo: no network, keyboard operable, labelled as scripted or simulated, still
  readable with reduced motion.
- No new runtime dependencies.

### Task 1: Project content

- **Goal:** One typed file holds everything the site says about each project.
- **Why:** The index, chapters and case studies all read the same facts; two copies would drift.
- **Files:** `content/projects.ts` (rewrite).
- **Steps:** extend `Project` with year, tags, stats, stack, live link, case-study text, flow steps, draft flag; fill all five from the brief and résumé.
- **Done when:** `pnpm typecheck` exits 0.

### Task 2: Cache simulation

- **Goal:** LRU, LFU and a learning agent can be run on a seeded request trace and return hit rates.
- **Why:** "Cache Wars" must show real results, not an animation of made-up ones.
- **Files:** `lib/cache-sim.ts`, `lib/cache-sim.test.ts`.
- **Steps:** write tests (LRU and LFU evict the right key on hand-made traces; a run is repeatable; rates are between 0 and 1); watch them fail; implement; watch them pass.
- **Done when:** `pnpm test lib/cache-sim.test.ts` passes.

### Task 3: Cover images and case videos

- **Goal:** `public/media/cover-<slug>.avif` and `case-<slug>.mp4/.webm` exist for all five projects.
- **Why:** The grid view, the hover preview, the phone chapters and the case-study heroes all need them.
- **Files:** `scripts/record-covers.mjs`, ten media files, `package.json` (script `record:covers`).
- **Steps:** write the recorder (theme set by hand, object centred, clock stepped); run it against the production build; check sizes and look at the covers.
- **Done when:** `ls public/media` lists all fifteen files and each video is under 3 MB.

### Task 4: Work index

- **Goal:** A numbered list of the five projects that can be switched to a grid of covers; hovering a row turns the particle object into that project's symbol and shows a preview at the pointer.
- **Why:** It is the recruiter's table of contents: every project reachable in one click from the first scroll.
- **Files:** `components/WorkIndex.tsx`, `components/Particles.tsx` (also follow `data-preview`), `e2e/work.e2e.ts`.
- **Steps:** write browser tests (five rows link to their chapters; toggle switches view and survives reload; phone defaults to grid; hover sets the symbol); implement.
- **Done when:** `pnpm e2e e2e/work.e2e.ts` passes.

### Task 5: Chapters, count-ups and demos

- **Goal:** Each chapter shows title, role, pitch, its numbers, a working demo and "Open case study".
- **Why:** This is the content the site exists to show.
- **Files:** `components/CountUp.tsx`, `components/demos/*.tsx` (five demos and an index), `app/page.tsx`, `app/globals.css`, `e2e/demos.e2e.ts`.
- **Steps:** write browser tests that operate each demo by keyboard to its end state; implement the demos; assemble the page; add reveal styles.
- **Done when:** `pnpm e2e e2e/demos.e2e.ts` passes.

### Task 6: Project cursors

- **Goal:** Inside a project's theme the pointer is that project's cursor.
- **Why:** The brief's per-project signature; it must never cost precision or appear where it should not.
- **Files:** `components/Cursor.tsx`, `app/layout.tsx`, `app/globals.css`, `e2e/cursor.e2e.ts`.
- **Steps:** write browser tests (absent in neutral, present in a theme, absent on phone and under reduced motion); implement.
- **Done when:** `pnpm e2e e2e/cursor.e2e.ts` passes.

### Task 7: Verify, inspect, commit

- **Done when:** `pnpm typecheck && pnpm lint && pnpm test && pnpm e2e` exits 0, the page has been looked at on desktop and phone, and `git log` shows the Phase 3 commit.

## As built

- All seven tasks done. `pnpm e2e` runs 60 tests.
- The mini learning agent in Cache Wars only narrowly beats LRU on the demo trace (47.4% against 46.5%, LFU 33.6%). That is the simulation's real result and it is shown as is.
- The work index's hover preview plays the case video with the cover as its poster.
- `app/tokens.test.ts` now ignores rules that mention `data-theme` without defining a background, since the cursor styles do.
- The hallucination demo hands keyboard focus on after "Next"; without that a keyboard user was dropped to the top of the page.
