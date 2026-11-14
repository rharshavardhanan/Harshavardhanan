# Contrast pass and the AI-film caption — plan

Source: Harsha, 2026-11-14: "remove the AI-generated film [label], everybody
knows it is AI-generated from the Gemini icon", then a pasted brief: the home
page sits in a grey haze; fix it with deep blacks and clear layers, not
saturation; remove the caption ("the credit belongs in the project credits and
on About").

Measured first (1440×900, before-shots in the scratchpad, `contrast/`):

|                                     | mean | spread (sd) | darkest 2% | brightest 2% |
| ----------------------------------- | ---- | ----------- | ---------- | ------------ |
| Odovox frame in a plain `<video>`   | 129  | 45          | 28         | 215          |
| the same in the ring's centre panel | 126  | 41          | 29         | 195          |

- **No double gamma.** The texture is uploaded as plain RGBA8 and drawn
  straight out, with no `pow()` anywhere in the panel shader; a double
  conversion would move the mean and lift the shadows, and neither moved. The
  panel loses some top end (215 → 195) to its 75% corner darkening and the
  multiplied grain. The milkiness is mostly the film's own grade (its blacks
  start at 28).
- **The background is the haze:** 17–37 out of 255 in open areas (#111 to
  #252525), against a target of ~8 (#080808) with folds at most ~42 (#2a2a2a).
  Its brightness is 0.025 + 0.10 × diffuse (+ shine and rim): flat areas face
  the light at about 0.6, so ~0.085; the halo behind the panel lifts the
  middle up to 60% more; the floor glow (CSS) adds more under the panel.
- **The frame's text** is #f4f2ee (96% white) at full opacity over the dark
  home page; measured text pixels reach 242. It already meets "90–100% white";
  it uses the tone system (components/Tone.tsx, with contrast tests), not
  difference blending, and stays as it is.

**Status: done (2026-11-14).** `pnpm test` 67, `pnpm e2e` 115 passed. Measured on
the after-shot (same frame, same boxes; 0–255):

| | before | after |
|---|---|---|
| centre panel: mean / spread / darkest 2% | 126 / 41 / 29 | 127 / 46 / 23 |
| gap between panels (mean, max) | 23, 35 | 9, 16 |
| band above the panel | 30, 43 | 13, 20 |
| floor under the panel | 38, 175 | 15, 31 |
| top-left corner | 16, 24 | 5, 10 |
| frame text (MENU, SELECTED WORK), brightest pixel | 242 | 242 |

The floor stays at 15 (not ≤ 12) on purpose: a faint lit floor under the
panel, now 2% white. Fold shine raised 0.14 → 0.22 after the first pass read
too flat (folds peaked at 29).

### Task 1: The caption goes; the credits say it

- **Goal:** No "AI-generated film" caption under the ring's panels, the project films or the poster list; each project with an AI film says "Film · AI-generated, Flow (Veo)" in its credits (not About: an extra credits row there makes it 937px, past one 900px screen, and About shows no films). The video's hidden description for screen readers still says so.
- **Why:** Harsha wants the caption gone (the Gemini ✦ in each film's corner shows it). The disclosure stays on the page because the Odovox film shows the app in use in a clinic, which PRODUCT.md only allows as a labelled illustration.
- **Files:** `components/ring/Ring.tsx`, `components/Film.tsx`, `app/page.tsx`, `app/globals.css` (`.ring-ai`, `.film-ai`), `app/work/[slug]/page.tsx` (credits), `components/About.tsx` (credits), `e2e/case.e2e.ts`, `PRODUCT.md`, `CLAUDE.md`, `docs/superpowers/specs/2026-11-14-v3-cinematic-design.md`.
- **Done when:** `pnpm e2e case` passes "AI films are credited, not captioned" (no `.film-ai`, the credits say AI-generated, the home ring has no caption).

### Task 2: The background is near-black; only the folds catch light

- **Goal:** Open background at ~8/255, fold highlights at most ~42, corners almost pure black; the shine still shows the folds.
- **Files:** `components/ring/shaders.ts` (SMOKE: 0.012 + 0.03 × diffuse + 0.14 × shine + 0.05 × rim; halo 0.6 → 0.25; vignette to 8% at the corners), `components/ring/smoke.ts` (grain 0.035 → 0.025), `app/globals.css` (floor glow 0.08 → 0.035).
- **Done when:** on the after-shot, background samples away from the panels and text have a mean ≤ 12 and a max ≤ 45; the corners ≤ 6.

### Task 3: The centre panel gets a gentle filmic S-curve

- **Goal:** In the panel shader, before grain: the S-curve (35% smoothstep, 65% straight) and +8% saturation, at full strength on the centre panel, fading out with the existing depth value for the side panels.
- **Files:** `components/ring/shaders.ts` (FRAGMENT).
- **Done when:** on the after-shot the centre panel's spread is above the before's 41 and its darkest 2% below 29, with the mean within ±5 of 126 (no brightening).

### Task 4: Report

Before/after shots side by side; the S-curve explained on dark, mid and
bright values; the Odovox film's garbled phone text raised (a blank-screen
version from Flow would let the real UI be laid over it in code).
