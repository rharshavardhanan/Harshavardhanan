# Portrait and résumé assets

Brainstorm (thin, by design): the request is to put two supplied files where the brief
already says they go. The only things the request did not state were found by looking:
the résumé was added at the repo root under its original name, not at
`public/resume.pdf`; and the portrait was generated from the v1 prompt (cream ground,
yellow outline), so its background will not match paper `#F4F2EE` exactly.

### Task 1: Place the portrait and the résumé

**Goal:** `public/media/portrait.avif` and `public/resume.pdf` exist and are served by the site.

**Why:** The header's Résumé link 404s until the PDF is at that path, and Phase 5's About section expects the portrait under the brief's file name.

**Files:**

- Create: `public/media/portrait.avif` (from `potrait`, 1122×1402, AVIF)
- Move: `Harshavardhanan_Rajasimhan_Resume.pdf` → `public/resume.pdf`
- Modify: `.gitignore` (ignore the source file `/potrait`), `e2e/header.e2e.ts` (the résumé link must resolve)
- Modify: `docs/superpowers/specs/2026-11-12-portfolio-inference-design.md`, `PRODUCT.md` (close the open items)

**Steps:**

- [x] Add a browser test that `/resume.pdf` and `/media/portrait.avif` are served; run it and watch it fail.
- [x] Convert `potrait` to AVIF at its own size; look at the result beside the original.
- [x] Move the résumé to `public/resume.pdf`.
- [x] Check the résumé text for a phone number (the brief keeps the phone number off the site) and report what is found; do not edit the PDF.
- [x] Ignore `/potrait` in git; leave the original file where it is.
- [x] Run the test again.

**Done when:** `pnpm e2e e2e/header.e2e.ts` reports 4 passed, and `file public/media/portrait.avif` reports an AVIF image.

Not committed on its own: these files go into the Phase 2 commit, per the one-commit-per-phase rule.
