# Portfolio — Redesign Pass (paste into Claude Code)

## Before you paste: capture these first
The single biggest gap: **the site never shows the real things you built.** Winners show real work. Capture these at 2× (Retina) and save them to `/public/media/real/`:

**Odovox** (use the seeded demo clinic, which has only fake patients)
1. `odovox-record.mp4`: screen recording, 10–15 s. Doctor opens a patient, records, progress strip goes Transcribing → Understanding → verification card, then clicks Confirm.
2. `odovox-queue.png`: live queue board with waiting / in-chair / checkout.
3. `odovox-verify.png`: the verification card, close up.
4. `odovox-bill.png`: a bill or the prescription PDF.
5. `odovox-mobile.png`: one screen on a phone-sized window (it's a PWA).

**Kattral Academy:** `kattral-class.png` (a live class with a few tiles), `kattral-dashboard.png` (teacher's classroom list). Only use these if Zerofence allows it. If not, skip them and say so in the prompt.

**Edge Cache RL:** `cache-dashboard.mp4`, a 10 s recording of the live dashboard running policies.

**Road Damage:** `road-detections.mp4`, 10 s of your real YOLO output video with boxes. `road-map.png`, the PCI segment map or chart if you have one.

**Hallucination:** `halluc-roc.png`, your real ROC/PR curve or ablation chart, exported clean.

Keep recordings short. Hide your mouse cursor if you can, and use a clean browser window with no bookmarks bar.

---

## The prompt

```
The portfolio works, but it looks like a clean template or a SaaS dashboard, not an Awwwards Site of the Day. Do a full ART-DIRECTION pass. Keep all content, data, themes (colors per project), the particle object, the demos, and the accessibility work. Change composition, scale, motion and media. Work in the phases at the end and stop after each one so I can review.

## What's wrong now (fix all of it)
1. HERO has no "moment". The name sits at the bottom, the particle sphere floats in a corner and doesn't touch it, and ~40% of the screen is empty space with no purpose.
2. ONE COMPOSITION EVERYWHERE. Every section is "text column on the left (~55%) + particle object fixed on the right". After two sections it's predictable. The right third of the work grid is empty.
3. CHAPTERS LOOK LIKE ADMIN WIDGETS: thin bordered boxes, tiny mono labels, form-style toggles, and all five chapters use the identical layout.
4. TYPOGRAPHY HAS NO DRAMA: too many small sizes, lots of 11–12px grey mono with low contrast (especially on the dark themes). Body text and headings are too close in size.
5. NO REAL WORK IS SHOWN: no screenshots or recordings of the actual products. Only particle illustrations.
6. CASE STUDY PAGES READ LIKE A DOCUMENT: heading on the left, paragraph on the right, repeated. No media, no big numbers, no rhythm.
7. MOTION IS FLAT: sections fade in; theme changes go through a muddy grey blend; nothing is pinned or choreographed.

## Art direction rules (apply everywhere)
- Type scale: use only 5 sizes. Display (clamp 96–280px), H2 (clamp 56–120px), H3 (32–40px), body (18–20px), label (13–14px mono, uppercase, letter-spacing 0.06em). No text under 13px anywhere. Labels must pass AA contrast in every theme.
- Remove almost all borders and boxes. Separate things with space, scale and color, not outlines. At most one hairline per section.
- Every section uses a DIFFERENT composition: full-bleed media, giant type that overlaps media, asymmetric 7/5 splits, pinned horizontal scroll, sticky media with scrolling text. Never the same layout twice in a row.
- Use the full width: 1440–1920px screens must feel designed edge to edge.
- Theme changes: no cross-fade through grey. Use a clip-path wipe (circle or vertical reveal from the bottom) of the next theme's background color, triggered by ScrollTrigger, ~0.8s, ease "expo.inOut".
- Easing for everything: expo.out / power4.out, durations 0.8–1.4s, staggers 0.04–0.08s. Text always reveals by lines/words sliding up from a mask.

## Section by section

### Hero (rebuild)
- The particle object becomes LARGE (~70vh), centred, sitting BEHIND the name. The name "HARSHAVARDHANAN" is set across the full width, vertically centered, overlapping the particles. Use mix-blend-mode: difference on the name so it inverts where it crosses the particles.
- On load (after the loader): particles explode outward from a point and settle into the sphere while the name's letters rise from a mask with a stagger.
- Cursor: particles near the cursor are repelled strongly (radius ~120px) and spring back. This must feel physical and fun; it's the first thing a juror touches.
- Subtitle and status pill go bottom-left, small; a "Scroll" label with an animated line bottom-right.
- On scroll: the hero is pinned for ~100vh. The name scales down and moves up into the header, and the sphere flies down and morphs into the Odovox tooth as the Odovox chapter wipes in. That's the transition from you to your work.

### Work index (rebuild)
- Default view is INDEX: huge serif project names (H2 size) stacked full width, each row with number, role and year in label size on the right. Hovering a row: the other rows dim to 30% opacity, a media preview (the real screenshot/video) appears and follows the cursor with lerp, and the background tints toward that project's theme.
- GRID view: 12-column asymmetric layout (sizes 7/5, then 5/7, then a full row), real media instead of particle covers, image scale 1.1 → 1 on reveal.

### Project chapters: each gets its OWN composition
Keep the data and demos, but drop the boxed widgets. Demos sit directly on the themed background.
- 01 ODOVOX (biggest, ~3 screens, pinned): Screen 1, a giant "Odovox" title and pitch with the real queue screenshot in a large tilted browser frame that straightens on scroll (3D rotateX 12°→0). Screen 2, sticky split: on the left the Speak → Verify demo at large size (dictation in H3 serif, fields animate in one by one, the tooth chart is big); on the right the REAL recording odovox-record.mp4 plays in a phone/laptop frame. Screen 3, the 3 numbers as giant counters across the full width.
- 02 ROAD DAMAGE: a full-bleed real detection video (road-detections.mp4) as the background with a dark gradient; the title overlaps it at the bottom-left. Below, the mAP bars become a giant horizontal chart spanning the full width, with bars drawing in on scroll. The "general vs pothole model" toggle becomes two big tappable words.
- 03 KATTRAL: a pinned horizontal-scroll strip. Video tiles slide in from the right one by one as you scroll; the real screenshot is the last panel. Replace the generic person icons with soft abstract gradient avatars (warm orange tones), each with a pulsing "speaking" ring.
- 04 EDGE CACHE RL: centered composition. Cache Wars becomes the hero of the section: three huge percentage numbers (display size) that race when you press a big circular "Run" button. The dashboard recording sits below in a laptop frame.
- 05 HALLUCINATION: the "Spot the Hallucination" question is set in giant serif in the middle of the screen; Supported / Made up are two big words left and right; the answer reveals with a scan-line wipe. The real ROC chart sits at the end.

### Case study pages
Rhythm: full-bleed hero media → big intro paragraph (H3 size, max 20ch per line) → full-width real screenshot → Problem / What I built / Result as large statements with the key number in display size beside each → an animated architecture diagram (SVG, nodes and arrows draw on scroll) → a gallery of real screens in a 2-column offset grid with parallax → "Where it broke" on an inverted panel → a huge "Next project" footer whose title you scroll into, which wipes into the next theme and navigates.

### About
Keep the portrait; make it large (5 columns) with a subtle hover where the grain shifts. The bio set at H3 size. Skills become a single line-by-line list in big type per group (e.g. "ML & CV — PyTorch, YOLOv8, …") instead of five tiny columns.

### Contact & footer
Keep "LET'S BUILD" (it's good). Make the email address itself huge and clickable, with copy-to-clipboard and a "copied ✓" toast. Form fields: no boxes, just underlines, with large type.

### Global
- Page transitions between routes: the next theme color wipes up from the bottom, the title of the next page rises, then the content reveals.
- Loader: make sure it plays on first load and hands off into the hero explosion.
- Custom cursor: a 12px dot that grows into a 80px circle with a label ("View", "Play", "Drag", "Run") over interactive media.
- Lenis: lerp 0.1. Make sure ScrollTrigger uses Lenis (lenis.on('scroll', ScrollTrigger.update)) so nothing lags or jumps.
- Media: next/image for screenshots in device frames (CSS-only browser/laptop/phone frames); videos muted, playsinline, loop, lazy, with posters.
- Keep: prefers-reduced-motion (no pinning, no horizontal scroll, simple fades), keyboard access for every demo, AA contrast, Lighthouse ≥ 90 mobile.

## Phases (stop after each)
1. Type scale + spacing + theme wipe + Lenis/ScrollTrigger sync + cursor
2. Hero rebuild + hero → Odovox scroll transition
3. Work index (INDEX + GRID with real media)
4. Chapters 01–05, one at a time, each with its own composition
5. Case-study template rebuild
6. About, contact, page transitions, reduced-motion + mobile + Lighthouse pass
For each phase, explain in plain language what changed, which files, and what each important function does, so I can learn and edit it myself.
```
