# Generated sounds and the ring's proportions — plan

Source: Harsha's message of 2026-11-14. It asked for two things: sounds like
zenobasi.com/work's, generated in code; and the ring retuned to measurements of
that site.

## Global constraints

- No sound files: every sound is made with the Web Audio API.
- Sound stays off by default and starts only after a gesture. The choice is
  remembered in localStorage, which can fail, so it is wrapped in try/catch.
- Nothing about the ring's input, transitions or accessibility changes.

### Task 1: One sound module with five generated sounds

- **Goal:** `lib/sound.ts` provides `play(name)`, `setEnabled(on)` and `unlock()`, and makes five sounds:
  - tick (12ms of noise, exp(-t/1.5ms), bandpass 3200 Hz, Q 1.2)
  - click (bandpass 1800 Hz, 4ms decay)
  - select (a sine from 1200 to 900 Hz over 60ms)
  - menuOpen / menuClose (120ms of noise through a lowpass sweeping 600→2400 Hz, and back)

  Around them:
  - a master gain of 0.8, controlled by the SOUND switch
  - the AudioContext starts on the first pointerdown, keydown or touchend
  - it suspends while the tab is hidden

- **Where each sound plays:**
  - The ring ticks each time a new panel reaches the centre (at most every 35ms, detuned ±25 cents).
  - A panel click or Enter plays click; any other link plays select; the menu plays open and close.
  - Page scrolling keeps its tick every 90px (Harsha's earlier request).
- **Files:** `lib/sound.ts`, `components/Sound.tsx`, `components/ring/Ring.tsx`, `components/Menu.tsx`, `e2e/home.e2e.ts`.
- **Done when:** In `e2e/home.e2e.ts › Sound`:
  - the switch starts off, with no sounds
  - once on, scrolling plays ticks
  - after a reload the switch is still on
  - no film is ever heard

### Task 2: The ring matches the reference's proportions

- **Goal:** These targets, measured on a 1440×900 screenshot:
  - Camera at the circle's middle with a 44° lens; each panel covers 45° (width 0.785 R, height 0.53 R); gap 0.045 rad; corners 1.5% of the width.
  - Speed tightens the radius by at most 15%: R / (1 + min(speed, 1) × 0.18).
  - The centre panel is at full brightness; the falloff starts past d = 0.5.
  - Phones: each panel covers 30° vertically, so it keeps about 65% of the height.
- **Files:** `lib/ring.ts`, `lib/ring.test.ts`, `components/ring/gl.ts`, `components/ring/shaders.ts`.
- **Done when:** On a 1440×900 screenshot, measured from the pixels:
  - middle height ≈ 585px
  - edge height ≈ 630px
  - width ≈ 935px
  - ≈ 190px of each neighbour visible

> Both tasks done 2026-11-14. Measured on a 1440×900 screenshot: width 922px,
> middle height 592px, edge height 636px (20px in from the corner), 199px of
> each neighbour. 106 browser tests and 62 unit tests passing.
