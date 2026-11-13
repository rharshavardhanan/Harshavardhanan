# Phase 5: About, contact, footer, menu, transitions, anomaly hunt

Brainstorm: design doc section 7. Unstated constraints found: the portrait's cream
ground does not match paper, so it is shown as a framed print; with no mail service the
form cannot honestly say "message received"; a full-screen menu must trap keyboard
focus, which the browser's own `<dialog>` already does.

**Goal:** The home page is complete from hero to footer, every page has a menu and a footer, and moving between pages is a colour wipe.

### Task 1: About

- **Goal:** Portrait, a short bio, the spec sheet, grouped skills and a wins strip.
- **Why:** It is where a recruiter checks who this is and what they know; it was the first thing Harsha looked for.
- **Files:** `components/About.tsx`, `content/about.ts`, `app/globals.css`.
- **Steps:** tests (portrait visible with alt text; five skill groups; both wins present; bio carries the draft tag); implement.
- **Done when:** the About tests in `e2e/home.e2e.ts` pass.

### Task 2: Contact and footer

- **Goal:** A form that hands the message to the visitor's mail app, the four links, and a footer with the big closing line, the anomaly count and the credit.
- **Why:** Contact is the one action the site exists to produce.
- **Files:** `components/Contact.tsx`, `components/Footer.tsx`, `app/layout.tsx`, `app/page.tsx`.
- **Steps:** tests (required fields; submitting builds a mailto address containing the name and message; status text appears; works as a plain mailto form with JavaScript off; footer text present on home and case pages); implement.
- **Done when:** the contact and footer tests pass.

### Task 3: Anomaly hunt

- **Goal:** Six small glitches (one per chapter, one in About); clicking one fixes it, and the footer counts them, across reloads.
- **Why:** The brief's quirk; it rewards the visitor who reads to the end.
- **Files:** `lib/anomalies.ts`, `components/Anomaly.tsx`, `components/Chapter.tsx`, `components/About.tsx`.
- **Steps:** tests (count starts 0 / 6; fixing one makes it 1 / 6 and survives reload; each is a labelled button); implement with `localStorage` inside try/catch.
- **Done when:** the anomaly tests pass.

### Task 4: Menu

- **Goal:** A Menu button opens a full-screen list of every destination; Escape or a choice closes it.
- **Why:** On a phone the header's links wrapped onto a second line; and the projects were not reachable from a case study without going home.
- **Files:** `components/Menu.tsx`, `components/Header.tsx`, `app/globals.css`.
- **Steps:** tests (opens, focus is inside, Escape closes and returns focus, a project link navigates); implement on `<dialog>`.
- **Done when:** the menu tests pass.

### Task 5: Page wipe, magnetic buttons, sound, 404

- **Goal:** Going to another page is covered by a wipe in the destination's colour; buttons lean toward the pointer; an off-by-default sound toggle; a 404 page in the site's voice.
- **Why:** These are the brief's remaining "elements"; each must vanish under reduced motion.
- **Files:** `components/Wipe.tsx`, `components/Magnet.tsx`, `components/Sound.tsx`, `app/not-found.tsx`, `app/layout.tsx`, `app/globals.css`.
- **Steps:** tests (wipe appears then the address changes; no wipe under reduced motion; sound toggle flips its pressed state; 404 shows the line and a way home); implement.
- **Done when:** the tests pass.

### Task 6: Verify, inspect, commit

- **Done when:** the full pipeline exits 0, the new sections have been looked at on desktop and phone, and `git log` shows the Phase 5 commit.

## As built

- All tasks done; `e2e/home.e2e.ts` has 12 tests and the suite 82.
- The contact form's success line is "message handed to your mail app · reply in < 24h once it's sent", because nothing is actually received by the site.
- The menu shows the hovered project's cover on wide screens. It does not morph the particle object, which is covered by the menu while it is open.
- Found while inspecting: the particle stage could slide 100svh past the last chapter and sit over About (since Phase 2). Fixed by pulling the hero up over the stage instead of giving the stage a negative bottom margin; a test now guards it.
- Footer line measured at 4.08 em wide; its divisor is 4.14.
