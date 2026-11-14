# A one-click entrance for sound — plan

Source: Harsha, 2026-11-14. Asked why sound starts only after a click, he chose
option 2: the loader ends on an Enter button, whose click lets the browser play
sound from the very first tick.

**Status: done (2026-11-14).** Tasks 1–3 built; `pnpm e2e` 109 passed,
`pnpm test` 62 passed, typecheck and lint clean. Note for checking CSS: a build
can reuse stale CSS from Turbopack's cache (`.next*/cache/turbopack`) while
the JavaScript updates; if a CSS change does not show in a test or the
preview, delete the build folder (`.next-test` or `.next`) and build again.

### Task 1: The home page's loader waits for Enter

- **Goal:** On a first visit that starts at `/`, the loader counts to 100, then shows an Enter button with keyboard focus. Clicking it (or Enter / Space) lets the browser play sound and lifts the loader; the panels fly in. Every other first page keeps the self-lifting loader, and reduced motion and no-JS get no loader, as before.
- **Why:** Browsers allow sound only after a click, key or tap; scrolling never counts. A one-click entrance guarantees the ring's ticks from the first panel.
- **Files:** `components/Loader.tsx`, `app/globals.css` (Loader), `lib/sound.ts` (also unlock on click), `e2e/loader.e2e.ts`, plus the tests that open `/` with motion.
- **Done when:** In `e2e/loader.e2e.ts`:
  - a first visit to `/` shows the loader and then an Enter button with focus, and the loader stays up until Enter is clicked, then lifts
  - after that, turning the ring makes ticks (counted)
  - a first visit to `/work/odovox` lifts on its own
  - reduced motion shows no loader

### Task 2: The loader is his name; GitHub and LinkedIn are easy to find

Source: Harsha, the same day: "where is the LinkedIn and the GitHub repo link,
also the loader should be my name", then "grey name slightly changing to
white, like a loader".

- **Goal:** The loader shows "Harshavardhanan" across the window in the serif, grey, filling with white from left to right as the counter runs to 100. GitHub ↗ and LinkedIn ↗ sit in the frame's top row on wide screens (1024px and up) and in the menu's Pages row on every screen.
- **Why:** "H.R." said nothing to a recruiter who doesn't know him, and the two profile links were buried on the About page.
- **Files:** `components/Loader.tsx`, `app/globals.css` (Loader), `components/Corners.tsx`, `components/Menu.tsx`, `e2e/loader.e2e.ts`, `e2e/frame.e2e.ts`.
- **Done when:** `e2e/loader.e2e.ts` finds "Harshavardhanan" in the loader; `e2e/frame.e2e.ts` "GitHub and LinkedIn are easy to find" passes at 1280px (frame) and 360px (menu).
- **Follow-up (found checking screenshots):** the first build filled on the site's expo-out curve over 1s: 75% white after 0.2s, so it read as a flash, not a fill. And the grey was `--muted`, close to white. Now the count and the fill share a 1.4s ease-in-out and start from a dark grey (30% white over the background); the loader lifts or shows Enter at 1.5s. Done when the loader test "the name fills from grey to white as the count runs", frozen halfway, finds between 25% and 75% of the name still grey.

### Task 3: The pointer never vanishes inside the menu

Source: Harsha: "my cursor disappears in the gap of these" (the menu's Pages
row: Home · About · Inquire · Résumé · GitHub · LinkedIn).

- **Goal:** Anywhere inside an open menu or Inquire sheet, including the gaps between links, the ordinary pointer shows.
- **Why:** The frame (`.corners`) lets the pointer through (`pointer-events: none`) so it never blocks the page; only its links take it back. The dialogs live inside the frame and inherited that, so between links the pointer fell through to the page below, where the custom cursor hides it (`cursor: none`) and the dot is switched off while a dialog is open: nothing showed.
- **Files:** `app/globals.css` (Cursor: `.corners dialog { pointer-events: auto }`), `e2e/frame.e2e.ts`.
- **Steps:** write a test that points between two Pages links and expects the element there to be inside the menu, with a cursor other than `none`; watch it fail; add the rule; watch it pass.
- **Done when:** `pnpm e2e frame` passes "the pointer stays visible between the menu's links", and fails without the rule.
