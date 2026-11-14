# Portfolio v3: Cinematic Rebuild

_Based on a teardown of a24.raviklaassens.com, auge-xp.com and zenobasi.com/work_

> Saved verbatim from Harsha's message of 2026-11-14. What was decided where it
> was left open, or changed with his approval, is in
> `docs/superpowers/specs/2026-11-14-v3-cinematic-design.md`. Facts and copy still
> come from `docs/brief.md` (v2) and the résumé. Since then: never call Harsha a
> founder (2026-11-14).

---

## 1. Why those sites feel different from yours

|                         | A24 (Ravi Klaassens)                                    | AUGE                                        | Zen Obasi                                             | **Your site now**                     |
| ----------------------- | ------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------- | ------------------------------------- |
| Page length             | ~3.7 screens                                            | ~7 screens                                  | **0, one full-screen WebGL scene**                    | **~28 screens**                       |
| What fills the screen   | One film still + giant type                             | Tilted photo collage + giant word           | Curved 3D video panels                                | Text, numbers, UI widgets             |
| WebGL                   | Image with a **torn-paper edge** that reveals on scroll | Section edges **curve/bend**, images tilted | Panels **bend, blur and RGB-split** with scroll speed | Particle shapes beside text           |
| Words on screen at once | ~10                                                     | ~10                                         | **~6** (menu, name, inquire, project, counter)        | 80–200                                |
| Type                    | PP Eiko / PP Museum / PP Neue Montreal                  | Greed Bold + italic serif + Neue Montreal   | Google Sans Flex, tiny, in the 4 corners              | Instrument Serif + Inter Tight + Mono |
| Layout                  | Film-credits table, one quote word by word              | One giant word, small italic blurb          | Fixed **4-corner frame**, content in the middle       | Long columns of sections              |

**The core difference:** those sites are **image-first and almost wordless**. Every frame looks like a film still, and WebGL treats the images like physical material (bending, tearing, smearing). Yours is **information-first**: it explains everything on the home page. That's why it feels like a very good résumé, not an experience.

**The fix isn't more effects on the same page.** It's a different structure:

1. **Home = one full-screen cinematic scene** (like Zen Obasi): your 7 projects as curved WebGL panels. Almost no text.
2. **Each project page = a short film poster** (like A24): giant title, film-style credits, one line revealed word by word over a full-bleed video, then the real product and the demo.
3. **All the detail you've written moves deeper into each project page**, below the fold. Nothing is lost.

---

## 2. Art direction: make your work look like film

Your real product screens are great proof, but they're UI. They aren't cinematic. So each project gets **two layers of media**:

- **Mood film** (AI-generated, Flow/Veo): a cinematic 6–8 s shot of the _world_ the project lives in. This is what appears on the home panels and the project heroes.
- **Proof** (real): your screen recordings and screenshots, shown further down each project page.

Shared style words for **every** prompt (keep them identical so the set looks like one film):
`shot on 35mm film, natural grain, soft halation, shallow depth of field, muted cinematic grade, quiet and intimate, no text, no logos`

### Flow (Veo) prompts: one mood film per project

Generate 3–4 takes of each and keep the calmest. Export at 1920×1080, 6–8 s, then compress to MP4 + WebM under ~4 MB.

**01 Odovox:** `mood-odovox.mp4`

> Close-up inside a calm, sunlit Indian dental clinic: a dentist's gloved hands rest beside a dental chair while she speaks softly toward a small phone standing on the tray; light dust floating in a window beam, mint-green walls, a ceiling lamp softly out of focus. Slow push-in. Shot on 35mm film, natural grain, soft halation, shallow depth of field, muted cinematic grade, quiet and intimate, no text, no logos, face not visible.

**02 Aftermeet:** `mood-aftermeet.mp4`

> Late evening in a small glass meeting room, laptop lid half closed, scattered sticky notes and a cooling cup of chai on the table, city lights blurred outside, a whiteboard with illegible marker scribbles. Slow lateral dolly. Shot on 35mm film, natural grain, soft halation, shallow depth of field, muted warm cinematic grade, quiet and intimate, no readable text, no logos, no people.

**03 Sequential CP / Robot monitor:** `mood-robot.mp4`

> A white robotic arm in a dim research lab slowly reaches toward a small cube on a wooden table, hesitates, then continues; a single practical lamp lights the scene, cables on the floor softly out of focus. Slow orbit. Shot on 35mm film, natural grain, soft halation, shallow depth of field, cool muted cinematic grade, quiet and tense, no text, no logos, no people.

**04 Road Damage Survey:** `mood-road.mp4`

> Dashcam point of view driving slowly through an Indian city street at blue hour after rain, wet asphalt with potholes reflecting orange streetlights, an auto-rickshaw's taillights far ahead. Steady forward motion. Shot on 35mm film, natural grain, soft halation, shallow depth of field, muted cinematic grade, quiet, no readable text, no logos.

**05 Kattral Academy:** `mood-kattral.mp4`

> A teenage student's desk at night in an Indian home, a laptop screen glowing warm orange onto an open notebook and a pen, a tiny potted plant, a ceiling fan turning softly out of focus. Slow push-in toward the glowing screen (screen content blurred and unreadable). Shot on 35mm film, natural grain, soft halation, shallow depth of field, warm muted cinematic grade, quiet and intimate, no text, no logos, face not visible.

**06 Edge Cache RL:** `mood-cache.mp4`

> Inside a dark server room, rows of rack lights blinking in rhythmic patterns of blue, a slow tracking shot down the aisle, light haze catching the LEDs, deep blacks. Shot on 35mm film, natural grain, soft halation, shallow depth of field, cool muted cinematic grade, hypnotic and calm, no text, no logos, no people.

**07 Hallucination Detection:** `mood-halluc.mp4`

> A hand-held mirror lying on a dark velvet surface reflects a room that is subtly different from the real room around it; a slow rack focus between the real lamp and its slightly wrong reflection. Shot on 35mm film, natural grain, soft halation, shallow depth of field, violet-tinted muted cinematic grade, surreal and quiet, no text, no logos, no people.

### Nano Banana: poster stills (used as video posters + share images)

For each mood film, also make a still with the same prompt plus:

> …as a single still frame, composed with empty space in the lower third for a title, 16:9.

Save them as `poster-<slug>.avif`.

**Portrait:** you already have a strong one. Keep it.

---

## 3. The new structure

```
/                → full-screen WebGL project carousel (Zen Obasi-style), almost no text
/work/[slug]     → short "film poster" page per project (A24-style), then proof + demo
/about           → one-screen editorial page (portrait, short bio, credits-style facts)
/contact         → the menu's "Inquire" opens an overlay with the big email + form
```

### Fixed frame (every page)

Four corners, small type (14px, uppercase, letter-spaced), always on top:

- top-left `MENU` · top-center `HARSHAVARDHANAN` · top-right `INQUIRE`
- bottom-left **current project name** · bottom-center `SELECTED WORK 2025 — 2026` · bottom-right `03 / 07`
- the sound toggle sits next to MENU (ambient sound, OFF by default)

### Home: the carousel

- 7 curved WebGL panels in a horizontal ring, each playing its mood film (muted, looped).
- **Scroll, drag, or arrow keys** move the ring. Movement has inertia (lerp 0.08).
- **Speed drives the shader:** panels bend more (vertex curve), blur and split into RGB (chromatic aberration) the faster you move, then settle sharp when you stop.
- The panel in the center is sharp and in color; the side panels are darker, blurred and slightly desaturated.
- Hover on the center panel: the cursor becomes a circle labelled `VIEW`, and the panel ripples gently under the cursor.
- Click: the center panel **flattens and expands to full screen** (a shared WebGL transition). The page becomes `/work/[slug]` with the video still playing, so there's no cut.
- First visit: a short loader (counter + your initials), then the panels fly in from depth and settle.
- On mobile: vertical swipe, one panel at a time, same shader but lighter.
- **Index view:** `MENU` opens a full-screen list of the 7 projects in giant serif, so nobody gets lost (usability score).

### Project page: the "film poster" (keep it to 4–6 screens before the deep detail)

1. **Title block** (like A24): giant serif title centered, then a film-credits table in small caps:
   `ROLE Founder · BUILT WITH Next.js, Fastify, Prisma, Sarvam, Gemini · YEAR 2026 · STATUS In development`
2. **Full-bleed mood film** that reveals with a **torn/organic mask edge** (noise-displaced shader edge) as you scroll.
3. **One line, word by word** over the film, huge, each word fading in as you scroll. One per project:
   - Odovox: _"Speak once. The records write themselves."_
   - Aftermeet: _"Every meeting ends with someone owning something."_
   - Robot monitor: _"Know when to hand over."_
   - Road Damage: _"Measure how it fails, not just when it works."_
   - Kattral: _"Class, from anywhere."_
   - Edge Cache RL: _"Teach the cache what to forget."_
   - Hallucination: _"Catch the answer that isn't true."_
4. **Short description** (2–3 lines, A24 synopsis size) on the left; **"awards-style" key numbers** on the right, set like festival laurels:
   `94% ACCURACY · 82.5% ROC-AUC · 25,000 SAMPLES`
5. **Proof:** the real product, with the screen recordings and screenshots in clean device frames, a few at a time, on a calm background.
6. **The interactive demo** (Speak → Verify, Cache Wars, etc.). Keep the ones you have; just give them room and no boxes.
7. **Deep detail** for those who want it: problem, what you built, architecture, what broke. This is where your current long text goes.
8. **Next project:** the next mood film is shown small at the bottom; scrolling into it expands it and moves you to the next page.

### Section edges

Between dark and light areas, use a **curved edge** (AUGE) or a **torn edge** (A24) drawn with a shader or SVG mask that bends with scroll speed. No straight horizontal cuts.

### Type

- Display: **PP Eiko** or **PP Museum** (Pangram Pangram; free trial for personal use, but check the license before going public) or keep **Instrument Serif** (free).
- UI: **PP Neue Montreal** (same licensing note) or **Google Sans Flex** / **Inter Tight** (free).
- Remove JetBrains Mono from the main experience; use it only inside demos.
- Sizes: corner labels 14px, synopsis 22–28px, quote lines 8–12vw, titles 12–18vw.

---

## 4. The build prompt (paste into Claude Code)

> Put the media in `/public/media/mood/` (mood films + posters) and keep your real screens in `/public/media/real/`. Then paste this.

```
Rebuild the portfolio's structure and art direction. The current site is information-first (about 28 screens on the home page, mostly text and UI widgets). The target is image-first and almost wordless, like these Awwwards sites:
- zenobasi.com/work: a full-screen WebGL ring of curved video panels that bend, blur and RGB-split with scroll speed; fixed four-corner UI frame; "05 / 07" counter.
- a24.raviklaassens.com/production/lady-bird: a film-poster page with a giant title, a film-credits table, a full-bleed still revealed with a torn-paper shader edge, one line revealed word by word, a short synopsis, awards-style laurels. About 4 screens.
- auge-xp.com: giant single words, tilted media collage, section edges that curve as you scroll.

Keep ALL existing content, data, demos and accessibility work. Most of the current home-page text moves into the "deep detail" part of each project page.

## Structure
/ (home): full-screen WebGL project ring, no page scroll
/work/[slug]: film-poster project page, then proof, demo, deep detail, next project
/about: one-screen editorial page
"Inquire": an overlay with a huge clickable email (copy to clipboard), the form, and links

## Projects (7, in this order)
odovox, aftermeet, robot-monitor (sequential conformal prediction, LIBERO), road-damage, kattral, edge-cache-rl, hallucination. Each has /media/mood/mood-<slug>.mp4 (+ .webm) and /media/mood/poster-<slug>.avif.
One-line quotes:
odovox "Speak once. The records write themselves." · aftermeet "Every meeting ends with someone owning something." · robot-monitor "Know when to hand over." · road-damage "Measure how it fails, not just when it works." · kattral "Class, from anywhere." · edge-cache-rl "Teach the cache what to forget." · hallucination "Catch the answer that isn't true."

## Global frame (all pages, fixed)
Top-left MENU (+ sound toggle, off by default) · top-center HARSHAVARDHANAN · top-right INQUIRE · bottom-left current project name · bottom-center "SELECTED WORK 2025 — 2026" · bottom-right "03 / 07". 14px uppercase, letter-spacing 0.04em, mix-blend-mode: difference so it reads on any media.
MENU opens a full-screen index: the 7 project names in giant serif; hover shows that project's poster behind the list; plus About and Inquire.

## Home: WebGL ring
- Use React Three Fiber (or OGL if lighter) with one shared plane geometry (many segments) per project and a VideoTexture of the mood film (posters until the video is ready).
- Panels sit on a horizontal arc. Wheel, drag, touch and ArrowLeft/ArrowRight move a target offset; the current offset lerps toward it (0.08). Snap to the nearest panel when idle.
- Vertex shader: bend each plane along a cylinder; the bend amount = base + abs(velocity) * k.
- Fragment shader: chromatic aberration (sample r/g/b with an offset ∝ velocity), slight blur ∝ velocity, grain, vignette. Side panels: darker and desaturated by distance from center.
- Hover on the center panel: a soft ripple from the cursor position; the cursor becomes a 72px circle labelled VIEW.
- Click / Enter on the center panel: GSAP-animate that plane to fill the viewport (unbend, scale, move to z=0), then route to /work/[slug] and keep the same video element/texture so playback continues without a cut. Back navigation reverses it.
- Loader on first visit: a 0→100 counter + "H.R.", then the panels fly in from depth with a stagger.
- Mobile (<768px): vertical swipe, one panel per screen, same shader with lower segments and no blur pass.
- Reduced motion: no bend/blur/RGB split, crossfade between panels, no auto-playing video (posters only, a play button).
- Accessibility: the canvas has role="region" and aria-label; a visually hidden list of links to all 7 projects mirrors the ring; focus moves the ring.

## Project page: film poster
1. Giant centered serif title + a credits table in small caps (ROLE, BUILT WITH, YEAR, STATUS), like film credits.
2. Full-bleed mood film revealed by a torn/organic mask edge (a shader or SVG mask whose edge is displaced by noise and moves up as you scroll).
3. The project's one-line quote, at 8–12vw, revealed word by word on scroll, over the film.
4. Synopsis (2–3 lines, 22–28px) on the left; 2–3 key numbers set like festival laurels on the right.
5. PROOF: the real screens/recordings from /media/real in clean CSS device frames, 2–3 per row, plenty of space.
6. The existing interactive demo for that project, unboxed, given full width.
7. DEEP DETAIL: the existing Problem / What I built / Result / architecture / where it broke content.
8. NEXT PROJECT: the next poster appears small at the bottom; scrolling into it expands it to full screen and routes to the next project.
Each page keeps that project's existing theme colors. Section changes between dark and light use a curved or torn edge, never a straight cut. Keep each page to roughly 4–6 screens before DEEP DETAIL.

## About
One screen: the existing portrait large on the left (subtle grain shift on hover), a 3–4 line bio in large type, and a credits-style list (Based in, Studying, Now, Previously, Awards). Skills as one compact line per group.

## Type
Display: Instrument Serif (or PP Eiko if I add the font files to /public/fonts). UI: Inter Tight (or PP Neue Montreal if I add it). Remove the monospace font from everything except inside the demos.

## Quality bar
Lighthouse ≥ 90 on mobile; lazy-load videos (only the center ±1 panels decode); cap DPR at 1.5 for the canvas; pause video textures when off-screen or the tab is hidden; AA contrast on all text; full keyboard support; prefers-reduced-motion respected; no placeholder text anywhere; fix the current Next.js dev error.

## Phases (stop after each one for my review)
1 Global frame + menu index + Inquire overlay + type cleanup
2 Home WebGL ring (static posters first, then video textures, then the velocity shader)
3 Home → project shared transition
4 Project page template (title/credits, torn reveal, word-by-word quote, synopsis + laurels)
5 Proof, demos, deep detail, next-project transition, for all 7 projects
6 About page, loader, sound, mobile, reduced motion, accessibility and Lighthouse pass
For each phase, explain in plain language what each new file and important function does (especially the shaders: what each uniform and line does), so I can learn and change it myself.
```

---

## 5. Honest expectation

- This direction matches what the jury is rewarding right now: image-first, WebGL material effects, very little text, and a strong single idea.
- The shader work (bending panels, RGB split, torn reveal, shared transition) is the hard part. Expect it to take a few rounds with Claude to feel smooth. Judge it on a real phone, not only on your laptop.
- Your edge over those studio sites: **real, working products with interactive demos**. They show pictures; you can show things that work. Keep the demos and make them beautiful.

Harsha's own note with it: "responsive even in mobile phone".
