# Sixth project: Sequential Conformal Prediction

Design: design doc section 9. One local commit when done.

### Task 1: Content, theme, media
- **Goal:** the project exists in `content/projects.ts` with its theme, cover, case video and real clips.
- **Why:** everything else reads from these.
- **Files:** `content/projects.ts`, `app/globals.css`, `lib/media.ts`, `lib/anomalies.ts`, `public/media/real/scp-*.mp4`, `public/media/case-scp.*`, `public/media/cover-scp.avif`.
- **Done when:** `pnpm test` passes with the contrast test covering eight themes.

### Task 2: Particle symbol
- **Goal:** the particle object becomes a robot arm in this chapter.
- **Files:** `lib/shapes.ts` (+ test), `components/Particles.tsx`.
- **Done when:** `pnpm test lib/shapes.test.ts` passes with nine shapes.

### Task 3: Videos in the browser and the demo
- **Goal:** the same-seed comparison plays in sync under one control; the monitor clips have native controls; the matched-α / matched-FAR toggle works by keyboard.
- **Files:** `components/SyncedClips.tsx`, `components/demos/ScpDemo.tsx`, `components/demos/index.tsx`, `components/chapters/Scp.tsx`, `app/page.tsx`, `components/WorkIndex.tsx`, `components/chapters/parts.tsx`, `app/work/[slug]/page.tsx`.
- **Done when:** new browser tests in `e2e/scp.e2e.ts` pass.

### Task 4: Tests, docs, inspect, commit
- **Done when:** the full pipeline exits 0, the chapter and case study have been looked at on desktop and phone, and the commit exists.

## As built
- Done. `e2e/scp.e2e.ts` (5 tests); suite 117 browser tests, 52 unit tests.
- The recording overlay band is 120px tall in the source; the hero video and cover are cropped below it.
- "¼" is not in the label font's subset; the label says "quarter speed".
- In small capitals α becomes Α ("A"); the axis label keeps it lowercase.
- Media-slot videos load only near the screen (`components/LazyVideo.tsx`).
