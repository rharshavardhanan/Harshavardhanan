# The ring as a room of screens, over oily smoke — plan

Source: Harsha's message of 2026-11-14. It asked for two things: an oily-smoke
background like zenobasi.com/work, and the ring as a cylinder around the viewer.

**Goal:** Standing in the middle of a circular room of screens: scrolling turns the room
around you, the mouse turns your head a little, and soft charcoal smoke folds slowly
behind everything.

**Architecture:**

- **Layout:** `lib/ring.ts` works out the cylinder's layout (radius, panel size as an
  angle, camera, lens) for the window, and it is tested.
- **Panels:** the vertex shader places every point of a panel on the circle with
  sin/cos.
- **Smoke:** a second, half-resolution canvas draws domain-warped noise behind the
  ring canvas, whose own background becomes transparent.

## Global constraints

- Raw WebGL2, no new dependencies. Reduced motion: no ring, no smoke (unchanged).
- Everything that worked still works: the trail, the grain, rounded corners, the
  open and back transitions, the keyboard, focus, the hit area, phones.
- Geometry fact (computed, see the summary): from inside a circle, a front panel at
  75–85% of the width leaves about 5–8% of the screen for each neighbour, not a
  quarter. Built at 76% with the camera 0.15 R behind the centre: about 7.5% each side.

### Task 1: The cylinder's layout is computed and tested

- **Goal:** `ringLayout(vw, vh)` gives:
  - radius 6
  - camera 0.15 R back
  - 55° vertical lens
  - the panel's half-angle, solved so it fills 76% of the width (62% of the height on phones)
  - step = panel angle + 0.06
  - the hit box in pixels
  - pixels per panel at the centre (for dragging)
- **Why:** Every other part reads these numbers.
- **Files:** `lib/ring.ts`, `lib/ring.test.ts`.
- **Done when:** `pnpm test lib/ring.test.ts` shows the front panel's projected width is 76% ± 1% at 1440×900, and step > 2 × half-angle.

### Task 2: Panels sit on the circle and the ring rotates

- **Goal:** In the vertex shader, angle = (panel angle + x / R) × k and point = (r sin, y, −r cos). Speed tightens the radius (r = R / (1 + 0.25 × speed), k = R / r, which keeps the arc lengths). Depth cues come from d = |angle| / step: brightness, blur and desaturation. The mouse turns the head (yaw ±3°, pitch ±1.5°, eased at 0.05).
- **Why:** Harsha's spec: the room turns around you, never slides.
- **Files:** `components/ring/shaders.ts`, `components/ring/gl.ts`, `components/ring/Ring.tsx`.
- **Done when:** `e2e/ring.e2e.ts` and `e2e/transition.e2e.ts` pass, and a screenshot at rest shows both neighbours with their outer edges taller than their inner edges.

### Task 3: Oily smoke behind the ring

- **Goal:** `<canvas class="bg-canvas">`:
  - half resolution
  - near-black with charcoal folds, by domain-warped fbm
  - distortion of 2 + 1.5 × speed
  - drifts with the mouse
  - a faint halo behind the centre
  - grain
- **Why:** Harsha's spec, to match the reference.
- **Files:** `components/ring/smoke.ts`, `components/ring/shaders.ts`, `components/ring/Ring.tsx`, `app/globals.css`.
- **Done when:** Two screenshots of `/` 2 s apart differ in the smoke, and `e2e/blend.e2e.ts` (frame contrast) and the axe audit with the ring running still pass.

### Task 4: The menu's other pages are easy to reach; no counter

- **Goal:** Home / About / Inquire / Résumé are large (h3) at the top of the menu's right column (at the top on phones). The "anomalies resolved" counter is gone. The ordinary cursor shows inside dialogs.
- **Why:** Harsha, 2026-11-14: "remove the anomalies resolved; also make the Home, About, Inquire and Résumé much easier to reach; the cursor is very hard to reach there due to the effect". The custom cursor's dot is drawn under a modal dialog (the browser puts dialogs on top), while the normal cursor was hidden everywhere, so inside the menu there was no visible cursor at all.
- **Files:** `components/Menu.tsx`, `components/Anomaly.tsx`, `lib/anomalies.ts`, `app/globals.css`, `e2e/home.e2e.ts`, `e2e/frame.e2e.ts`.
- **Done when:** `e2e/home.e2e.ts › The menu carries the credit and the other pages, large` passes: each link is at least 44px tall, there is no counter, and the dialog's cursor is not `none`.

> Tasks 1–4 done 2026-11-14.
