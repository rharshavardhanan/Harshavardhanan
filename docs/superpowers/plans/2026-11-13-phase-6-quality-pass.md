# Phase 6: Accessibility, performance and SEO pass

Brainstorm: the brief sets the bar (Lighthouse mobile 90 or more, LCP under 2.5s, AA
contrast in every theme, full metadata). Unstated: the site's address is not known yet,
so absolute links in metadata must come from an environment variable with a safe
fallback; and scores must be measured on the production build, not the dev server.

### Task 1: Metadata, link preview, icons, sitemap

- **Goal:** Every page has a title, description, canonical address, Open Graph and Twitter card, the site has a Person record for search engines, a sitemap, a robots file and its own icon.
- **Why:** Markup and metadata are scored separately by the Developer Award, and are where past winners were weakest.
- **Files:** `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`, `app/icon.svg`, `app/apple-icon.png`, `public/media/og.png`, `scripts/make-og.mjs`, `lib/site.ts`, `e2e/seo.e2e.ts`.
- **Steps:** tests (og tags present with an absolute image address; JSON-LD parses and names Harsha; `/sitemap.xml` lists six pages; `/robots.txt` points at it; icon served); implement.
- **Done when:** `pnpm e2e e2e/seo.e2e.ts` passes.

### Task 2: Accessibility audit

- **Goal:** axe finds no violations on the home page in any theme, on a case study, or on the 404 page.
- **Why:** "AA contrast in EVERY theme" and keyboard support are non-negotiable in the brief.
- **Files:** `e2e/a11y.e2e.ts`, `package.json` (dev dependency `@axe-core/playwright`), whatever the audit says to fix.
- **Steps:** write the audit as a test; run; fix each finding at its cause; re-run.
- **Done when:** `pnpm e2e e2e/a11y.e2e.ts` passes.

### Task 3: Performance

- **Goal:** Lighthouse mobile scores of 90 or more for performance, accessibility, best practices and SEO on the home page and one case study, with LCP under 2.5s.
- **Why:** The brief's stated bar; most recruiters open the link on a phone.
- **Files:** whatever the reports say to fix; report saved to `docs/lighthouse/`.
- **Steps:** run Lighthouse against the production build; fix the largest costs; re-run; record the numbers.
- **Done when:** the recorded scores meet the bar, or any that do not are stated with the reason.

### Task 4: Design record and final review

- **Goal:** `DESIGN.md` describes the built visual system; the site has had one last look at 360, 768, 1280 and 1920.
- **Files:** `DESIGN.md`.
- **Done when:** the full pipeline exits 0 and `git log` shows the Phase 6 commit.

## As built

- Metadata, Person record, sitemap, robots, icons and a generated link-preview image are in; `e2e/seo.e2e.ts` has 4 tests.
- axe: 14 audits, no violations. Two labelling problems fixed.
- Lighthouse (default settings): home 90 / 100 / 100 / 100, case study 93 / 100 / 100 / 100. LCP is 1.8 s with throttling applied and 3.2 to 3.5 s in Lighthouse's default estimate; details in `docs/lighthouse/2026-11-13.md`.
- The hero fallback is now one `<video>` whose poster is the still; the video is fetched after the page has loaded.
- The finish review was done in this session, not by a separate reviewer; `DESIGN.md` was written from the built site.
