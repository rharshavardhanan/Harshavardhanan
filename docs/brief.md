# Harsha — Portfolio Design Spec + Build Prompt (v2)
*A clean, neutral site. Every project gets its own world.*

---

## PART 1 — What the research says

**How Awwwards scores you**
- Main jury score: **Design 40% · Usability 30% · Creativity 20% · Content 10%**. Design + Usability = 70%, so a site that's easy to use beats a flashy one that isn't.
- Developer Award (separate score): **Semantics/SEO · Animations · Accessibility · Performance · Responsive · Markup/Meta**.
- Recent portfolio Sites of the Day score high on animation (8.4–8.6) and low on accessibility and markup (6.6–7.0). Bruno Simon's portfolio (SOTD Jan 2026) got 8.6 on creativity but 6.6 on accessibility. **Getting accessibility and metadata right is the easiest way to beat them.**

**What 2026 portfolio winners have in common** (Bruno Simon, Léo Parpeix, Pacôme Pertant, Jesper Landberg, Tomotsugu Oyamada)
1. A neutral **two-color base** (e.g. #0a0a0a / #fafafa) with strong typography, so the work stands out.
2. A designed **loader, page transitions, menu animation, custom cursor, and footer transition**. Awwwards judges each of these as its own "Element."
3. **Two ways to view work** (Pacôme Pertant: spiral view ↔ list view).
4. **Scroll-driven color changes** between sections, so each project feels like a new place.
5. Stack: **Three.js + GSAP** on Next.js/Nuxt, with Lenis smooth scroll.

---

## PART 2 — The concept

### The shell is neutral; the projects are themed
The main site (hero, about, menu, contact) is **calm, editorial and neutral**: ink and paper, big serif type, lots of space. It's about *you* as an engineer, not about any one project.

When you scroll into a project, **the page changes into that project's world**: background color, accent, cursor, and a small interactive demo. When you scroll out, it goes back to neutral. Each project also has its **own full case-study page** in the same theme.

### The bridge: one morphing object
The hero has a single **soft 3D particle object** that floats calmly next to your name. When you hover a project in the work list, or scroll into a project chapter, the particles **morph into that project's symbol**:
- Odovox → a voice waveform that settles into a tooth shape
- Road Damage → a road segment with a pothole
- Kattral Academy → a grid of video tiles
- Edge Cache RL → a stack of blocks
- Hallucination Detection → a speech bubble

The object stays neutral by default and turns into each project as you explore. It also connects every page visually.

### Quirk (in small doses)
- Live clock and status: `Chennai · 11:41 IST · currently: building Odovox`
- The cursor changes per project (a mic dot, a detection box, a cursor block).
- **Anomaly hunt:** one tiny clickable "glitch" hidden in each chapter. Clicking it fixes it. The footer counts them: `anomalies resolved 3 / 6`.
- Playful microcopy: 404 page says *"404 — this page is out of distribution."*

---

## PART 3 — Visual system

### Neutral shell
| Token | Value | Use |
|---|---|---|
| Ink | `#0E0E0E` | Dark background / text |
| Paper | `#F4F2EE` | Light background / text on dark |
| Grey | `#8A877F` | Labels, secondary text |
| Line | `#D9D5CC` | Hairline dividers |

**Type (free):** **Instrument Serif** (display, italic for emphasis) · **Inter Tight** (UI/body) · **JetBrains Mono** (labels, numbers, small tags).
**Texture:** very subtle film grain (2–3%).

### Project themes (each chapter + its case-study page)
| Project | Background | Accent | Cursor | Mood |
|---|---|---|---|---|
| **Odovox** | `#0F1F1C` deep clinic green | `#7FF2C9` mint | pulsing mic dot | calm, clinical, warm |
| **Road Damage Survey** | `#121212` asphalt | `#FFC93C` lane yellow | YOLO detection box | night drive, technical |
| **Kattral Academy** | `#1C1410` warm dark | `#FF8A3D` live orange | "raise hand" dot | live, friendly |
| **Edge Cache RL** | `#0B1020` deep navy | `#4D8BFF` electric blue | block cursor | precise, fast |
| **Hallucination Detection** | `#16111F` dusk violet | `#B69CFF` lavender | scan line | surreal, glassy |

---

## PART 4 — Site map & every element

### 0. Loader
Paper background, mono counter 0 → 100, your initials **H.R.** drawn in serif. The particle object starts as a dot and spreads out as loading finishes. First visit only.

### 1. Hero (neutral)
- Giant name **HARSHAVARDHANAN** in Instrument Serif, letters stagger in.
- Under it: *Software engineer & founder. I build AI products end to end, from model to interface.*
- Right side: the calm particle object (R3F). Mouse pushes the particles gently.
- Header: `H.R.` · `Chennai · [live IST clock]` · `Work` `About` `Contact` · `Résumé ↗`
- Small status pill: `● currently building Odovox`

### 2. Selected Work index (neutral)
- A big list of project names in serif, numbered `01–05`, with role, year, and tags in mono.
- Hovering a row: the particle object morphs into that project's symbol, and a small video preview follows the cursor.
- Toggle: **INDEX** (big type list) ↔ **GRID** (cover images). The choice is remembered.

### 3. Project chapters (themed, same page)
Each chapter takes about one screen. As you scroll in, the background and accent change to that project's theme (GSAP ScrollTrigger color tween). Every chapter follows the same layout so it's easy to use:
**Title + role + one-line pitch · 2–3 big count-up numbers · a mini interactive demo · "Open case study →"**

**01 · Odovox — Founder** *(the lead project, gets the most space)*
- Pitch: *A voice-first operating system for Indian dental clinics. Dentists speak, and Odovox turns it into clinical records, prescriptions, treatment plans, appointments, bills and WhatsApp follow-ups. The doctor verifies every record before it's saved.*
- Mini demo, **"Speak → Verify"**: a sample dictation types itself out (`"RCT on 36, review in 7 days, amoxicillin 500 three times a day for 5 days"`) and then turns into a clean verification card with fields (tooth 36 on an FDI chart, procedure, medicine, follow-up date) and a `Doctor verified ✓` button. Fully scripted, with no real API calls.
- Numbers/facts: `8 clinic modules` · `voice → record pipeline with safety layer` · `PHI encrypted (AES-256-GCM)`
- Facts to use: full clinic workflow built (auth, voice consult, live queue, scheduling, lab/inventory, billing with GST + UPI/Razorpay, WhatsApp); Sarvam speech-to-text → Gemini extraction → safety layer → doctor verification → single-transaction commit; Next.js 15 PWA, Fastify, Socket.IO, Prisma + PostgreSQL, Redis + BullMQ, S3; RS256 JWT, role-based access, clinic data isolation, audit logs.

**02 · Automated Road Damage Survey**
- Pitch: *Detecting potholes from dashcam video, and measuring exactly how the detector fails in a new region.*
- Mini demo: dashcam loop with detection boxes drawn in code. A slider switches between "trained abroad" and "fine-tuned on India" and shows the mAP change.
- Numbers: `0.578 → 0.101 → 0.389 mAP50` · `10 / 17 potholes found vs 4` · `0.5% vs 39% of worst roads repaired at 10% budget`

**03 · Kattral Academy — Software Developer, Zerofence**
- Pitch: *A live-classroom platform. Teachers create classes, students join with a code for real-time video, screen sharing and chat.*
- Mini demo: a grid of video tiles that light up one by one as "students join," with a fake chat bubble.
- Facts: Next.js 16 / React 19, REST API, MongoDB, LiveKit (WebRTC), NextAuth Google OAuth + JWT, Docker. Owned the full stack.

**04 · Edge Cache RL**
- Pitch: *Teaching a cache what to forget, using reinforcement learning.*
- Mini demo, **"Cache Wars"**: pick LRU / LFU / Q-Learning, press run, and watch hit-rate bars race.
- Numbers: `+10–15% hit rate vs LRU/LFU` · live demo link.

**05 · Hallucination Detection in LLMs**
- Pitch: *Catching AI answers that aren't supported by the facts.*
- Mini demo, **"Spot the Hallucination"**: 5 short AI answers. The visitor guesses which are made up, then sees their score next to the model's 94%.
- Numbers: `25,000+ samples` · `94% accuracy` · `82.5% ROC-AUC`

**More work** (small neutral list under the chapters): placeholders for other projects you want to add later.

### 4. Case-study pages (`/work/[slug]`)
Same template for every project, wearing that project's theme:
- Full-screen hero video loop + title, role, stack, year
- **Problem → What I built → Result** (short paragraphs, big numbers)
- **Architecture** diagram (e.g. Odovox voice pipeline as an animated flow)
- **"What was hard / where it broke"**: honest challenges and what you learned
- The chapter's interactive demo, larger
- **Next project →** transition that morphs the colors into the next theme

### 5. About (neutral)
- Portrait illustration + a short, human bio (who you are, what you like building, what you're looking for).
- **"Spec sheet"** block in mono: Based in Chennai · B.Tech CSE (AI & Robotics), VIT Chennai, 2023–27 · Founder, Odovox · Previously: Software Developer, Zerofence.
- Skills grouped as **Languages · ML & CV · GenAI · Web & Backend · Tools**.
- Wins strip (marquee): `Makeathon Winner 2025 — VIT Chennai` · `ML Certification — SmartBridge × Google`.

### 6. Contact + footer (neutral)
- Big serif line: *Have a hard problem? Let's build it.*
- Simple form (name, email, message) with a playful success state (`message received · reply in < 24h`), plus email / GitHub / LinkedIn / résumé links. **Don't put your phone number on the site.**
- Footer: huge "LET'S BUILD" revealed on scroll, anomaly counter, `© 2026 · designed & built by Harsha`.

### Global interaction details
- Lenis smooth scroll; masked line-by-line text reveals; magnetic buttons
- Full-screen menu with staggered serif links; hovering a link morphs the particle object
- Page transition: a paper-colored wipe that takes on the next project's color
- Sound toggle, OFF by default
- `prefers-reduced-motion`: no particles moving, no smooth scroll, native cursor, simple fades
- Mobile: native cursor, static images instead of the 3D object, chapters stack vertically, GRID view by default

---

## PART 5 — Images & videos to generate

Put them in `/public/media/` using these file names. Convert images to **AVIF/WebP** and compress videos to **MP4 (H.264) + WebM under ~3 MB, 6–8 s, seamless loop, muted**.

### Images: Nano Banana (Gemini)

**portrait.avif: You (upload your own photo with this prompt)**
> Transform the person in this photo into a clean editorial illustration: half-body portrait, slight three-quarter turn, relaxed confident expression. Flat risograph print style with visible grain, limited palette of warm off-white (#F4F2EE) and deep ink black (#0E0E0E) only. Plain off-white background with generous empty space on the right. No text, no logos. Keep the face clearly recognizable. Aspect ratio 4:5.

**og.png: Link preview image**
> Minimal editorial poster: the word "Harsha" in a large elegant italic serif typeface, ink black on warm off-white paper, a small cluster of soft grey particles floating to the right of the word, fine paper grain, lots of breathing room, centered composition. 1200×630.

**cover-odovox.avif**
> Minimal 3D render: a soft glowing sound waveform made of tiny mint-green particles flowing from the left and gradually settling into the clean shape of a single molar tooth on the right, the tooth made of the same particles. Deep green-black background (#0F1F1C), mint accent (#7FF2C9), calm clinical mood, soft studio light. No text, no logos, no people. 16:9.

**cover-road.avif**
> Cinematic dashcam view of an Indian city road at dusk, wet asphalt, warm streetlights, a few potholes visible ahead. Muted desaturated grade with deep blacks and warm yellow highlights. Minimal, lots of empty sky at the top. No people, no readable text, no logos. 16:9.

**cover-kattral.avif**
> Minimal 3D render of a floating grid of soft rounded video-call tiles in dark space, some tiles glowing warm orange as if people are live, faces shown only as abstract featureless silhouettes, one small orange "live" dot. Matte clay material, soft lighting, warm dark brown-black background. No text, no logos. 16:9.

**cover-cache.avif**
> Abstract 3D render of translucent glowing blocks being sorted in mid-air, some sliding out and fading, others locking into a neat bright stack, faint motion trails. Deep navy background (#0B1020), electric blue accent (#4D8BFF). Clean product-shot lighting. No text. 16:9.

**cover-hallucination.avif**
> Surreal minimal 3D render: a frosted glass speech bubble, half solid and sharp, the other half dissolving into floating particles with slightly wrong reflections, a thin lavender scan line crossing it. Dusk violet background (#16111F), lavender accent (#B69CFF). Calm, editorial. No text. 16:9.

**anomalies.png: Easter-egg sprite**
> A set of 6 tiny glitch icons in flat vector style on a white background, arranged in a 3×2 grid: a cracked tooth, a pothole, a broken video tile, a misplaced block, a speech bubble with a pixel glitch, a small error triangle. Ink black lines with one thin accent color each (mint, yellow, orange, blue, lavender, grey). Clean edges, no text.

### Videos: Google Flow (Veo)

**hero-loop.mp4: Neutral hero fallback (mobile / reduced motion)**
> A calm cloud of thousands of tiny soft grey particles floating slowly in front of a warm off-white paper background, gently drifting and breathing like a slow wave, very subtle depth of field. Minimal, elegant, quiet. No text, no objects. Seamless loop, 16:9.

**case-odovox.mp4**
> Slow camera push toward a floating soft mint-green sound waveform made of glowing particles in a dark green void; the waveform gently pulses as if someone is speaking, then its particles calmly drift and rearrange into the outline of a tooth, then back. Clinical, calm, premium. No text, no people. Seamless loop, 16:9.

**case-road.mp4**
> Dashcam footage driving slowly over a slightly damaged Indian urban road at dusk, potholes passing under the camera, wet reflections, warm streetlights, steady and realistic. No text, no overlays, no people in focus. Seamless loop, 16:9.
*(Detection boxes are drawn on top in code, so the AI doesn't have to fake text.)*

**case-kattral.mp4**
> Slow orbit around a floating grid of rounded glowing video-call tiles in a warm dark void, tiles lighting up one after another in soft orange as if students are joining a live class. Matte clay look. No faces, no text. Seamless loop, 16:9.

**case-cache.mp4**
> Abstract macro animation: translucent glowing blocks slide in and out of a neat vertical stack in deep navy space, unneeded blocks fade away, important ones snap into place with a soft flash of electric blue. Smooth, satisfying, minimal. Seamless loop, 16:9.

**case-hallucination.mp4**
> A frosted glass speech bubble floating in dusk-violet space slowly rotates, one side dissolving into drifting particles and reforming, a thin lavender scan line sweeping across it. Calm, elegant. No text. Seamless loop, 16:9.

**Tips:** Generate 3–4 versions of each and keep the most minimal one. Reject anything with garbled text, logos or warped faces. Keep the color words exactly as written so each project's set matches its theme.

---

## PART 6 — The build prompt (paste into Claude)

> Put your media in `/public/media/` with the names above and your résumé at `/public/resume.pdf`, then paste everything inside the code block.

```
You are a senior creative developer who has won Awwwards Site of the Day and the Developer Award. Build my personal portfolio website. It must be award-level in Design (40%), Usability (30%), Creativity (20%) and Content (10%), and score high on the Developer Award: semantics/SEO, animations, accessibility, performance, responsive, markup/meta.

## Who I am
Harshavardhanan Rajasimhan ("Harsha"), software engineer & founder (AI/ML + full-stack). Chennai, India. B.Tech CSE (AI & Robotics), VIT Chennai, 2023–2027, CGPA 8.15. Founder of Odovox. Previously Software Developer at Zerofence (May–Jul 2026).
Links: github.com/rharshavardhanan · linkedin.com/in/harshavardhanan-rajasimhan · harshavardhananrajasimhan@gmail.com · /resume.pdf
Wins: Makeathon Winner 2025 (VIT Chennai); ML Certification 2025 (SmartBridge & Google).
Skills: Python, TypeScript, JavaScript, SQL, Java · PyTorch, YOLOv8, scikit-learn, LightGBM, CatBoost, XGBoost, OpenCV, conformal prediction, RL · LLM APIs (OpenAI, Gemini, Ollama) · Next.js, React, FastAPI, Fastify, REST, MongoDB, PostgreSQL/Prisma, Redis/BullMQ, LiveKit, Socket.IO · Git, Docker, Vercel, Linux, NVIDIA Jetson.

## Concept
The main site is NEUTRAL and editorial (about me as an engineer). Each project has its OWN THEMED WORLD: when you scroll into a project's chapter on the home page, the background, accent color, cursor and a mini interactive demo change to that project's theme; scrolling out returns to neutral. Each project also has its own case-study page in its theme.
A single R3F particle object in the hero connects everything: calm and neutral by default, and it morphs into each project's symbol when you hover that project or scroll into its chapter (Odovox: waveform → tooth, Road: road segment with pothole, Kattral: grid of video tiles, Cache: stack of blocks, Hallucination: speech bubble). Build the shapes as point targets sampled from simple geometry or SVG paths, and interpolate between them with GSAP.

## Neutral design tokens
Ink #0E0E0E, Paper #F4F2EE, Grey #8A877F, Line #D9D5CC. Fonts via next/font/google: Instrument Serif (display, italic emphasis), Inter Tight (UI/body), JetBrains Mono (labels/numbers). Fluid type with clamp(), 12-column grid, generous whitespace, subtle film grain (~3%).

## Project themes (bg / accent / cursor)
- Odovox: #0F1F1C / #7FF2C9 / pulsing mic dot
- Road Damage Survey: #121212 / #FFC93C / YOLO-style detection box with mono label
- Kattral Academy: #1C1410 / #FF8A3D / small "raise hand" dot
- Edge Cache RL: #0B1020 / #4D8BFF / block cursor
- Hallucination Detection: #16111F / #B69CFF / horizontal scan line
Implement themes as CSS variables switched by a ScrollTrigger per chapter (smooth color tween) and applied on case-study pages.

## Stack
Next.js (App Router, TypeScript), Tailwind CSS, GSAP + ScrollTrigger, Lenis, React Three Fiber + drei (dynamically imported), next/image. Content in typed files under /content. Deploy to Vercel.

## Pages & sections
1. LOADER: paper bg, mono 0→100 counter, serif "H.R."; the particle object starts as a dot and spreads out. First visit per session only.
2. HERO: split-letter "HARSHAVARDHANAN" in Instrument Serif; subtitle "Software engineer & founder. I build AI products end to end, from model to interface." Particle object on the right; mouse gently pushes the particles. Header: H.R. · "Chennai · [live IST clock]" · Work / About / Contact · Résumé ↗. Status pill: "● currently building Odovox". Fallback /media/hero-loop.mp4 on mobile, no WebGL, or reduced motion.
3. WORK INDEX: numbered 01–05 serif list with role, year, tags. Hover: particle morph + cursor-following video preview. Toggle INDEX ↔ GRID (covers), remembered in localStorage (try/catch).
4. PROJECT CHAPTERS (same page, one per project, same layout each): title + role + one-line pitch · 2–3 count-up numbers · mini interactive demo · "Open case study →".
   01 ODOVOX (Founder, lead project, give it the most space): "A voice-first operating system for Indian dental clinics. Dentists speak, and Odovox turns it into clinical records, prescriptions, treatment plans, appointments, bills and WhatsApp follow-ups. The doctor verifies every record before it's saved." Demo "Speak → Verify": a scripted dictation types out ("RCT on 36, review in 7 days, amoxicillin 500 three times a day for 5 days"), then animates into a verification card (FDI tooth chart with 36 highlighted, procedure, medicine, follow-up date) with a "Doctor verified ✓" button. No real API calls. Facts: full clinic workflow built (auth & roles, voice consult, live queue, scheduling, lab & inventory, billing with GST + UPI/Razorpay, WhatsApp follow-ups); pipeline Sarvam STT → Gemini extraction → safety layer → doctor verification → single-transaction commit; Next.js 15 PWA, Fastify, Socket.IO, Prisma + PostgreSQL, Redis + BullMQ, S3; PHI encrypted with AES-256-GCM, RS256 JWT, RBAC, clinic data isolation, audit logs. Do not claim live clinics or users.
   02 AUTOMATED ROAD DAMAGE SURVEY: "Detecting potholes from dashcam video, and measuring exactly how the detector fails in a new region." Demo: /media/case-road.mp4 with detection boxes drawn in canvas/SVG; slider switches "trained abroad" vs "fine-tuned on India". Facts: YOLOv8s trained on non-India RDD2022; mAP50 0.578 → 0.101 on India split, recovered to 0.389 after fine-tuning; pothole model found 10/17 potholes vs 4; split conformal prediction: out-of-domain bound promised 20% misses and delivered 73%, certified 8.3% in-domain; budget repair optimiser repairs 0.5% vs 39% of worst roads at a 10% budget.
   03 KATTRAL ACADEMY (Software Developer, Zerofence, May–Jul 2026): "A live-classroom platform. Teachers create classes; students join with a code for real-time video, screen sharing and chat." Demo: video tiles lighting up as students join + a fake chat bubble. Facts: Next.js 16 / React 19, REST API, MongoDB, LiveKit (WebRTC), NextAuth Google OAuth + backend JWT, Docker; owned the full stack.
   04 EDGE CACHE RL: "Teaching a cache what to forget, using reinforcement learning." Demo "Cache Wars": choose LRU / LFU / Q-Learning, run a JS-simulated request trace, racing hit-rate bars. Facts: Q-Learning + adaptive RL agents from scratch, +10–15% hit rate over LRU/LFU, FastAPI + React dashboard. Live: https://rlcachemanagement-grq86hhh3.vercel.app
   05 HALLUCINATION DETECTION IN LLMs: "Catching AI answers that aren't supported by the facts." Demo "Spot the Hallucination": 5 short answers, visitor guesses, compares with the model's 94%. Facts: 25,000+ samples, engineered features, SMOTE, LightGBM/CatBoost ensemble, 94% accuracy, 82.5% ROC-AUC, feature-group ablations.
   Then a small neutral "More work" list with placeholder rows I can fill in.
5. CASE STUDY /work/[slug] (themed): hero video /media/case-<slug>.mp4 with cover poster /media/cover-<slug>.avif, role/stack/year, Problem → What I built → Result, an animated architecture diagram (Odovox: browser recording → S3 → STT queue → extraction queue → SSE progress → doctor verification → commit), "What was hard / where it broke", the larger demo, and a "Next project →" transition that tweens into the next theme.
6. ABOUT (neutral): /media/portrait.avif, short human bio (placeholder text for me to edit), mono "spec sheet", grouped skills, wins marquee.
7. CONTACT + FOOTER (neutral): "Have a hard problem? Let's build it." Form (name, email, message) via a simple serverless route (Resend) with honeypot, mailto fallback, playful success state "message received · reply in < 24h". Links: email, GitHub, LinkedIn, résumé. No phone number. Footer: huge "LET'S BUILD" scroll reveal, anomaly counter, "© 2026 · designed & built by Harsha".

## Signature interactions
- Custom cursor that changes per project theme; native cursor on touch and with reduced motion.
- Anomaly hunt: one tiny clickable glitch per chapter (sprite /media/anomalies.png); clicking fixes it with a small animation; count persisted in localStorage (try/catch), shown in the footer "anomalies resolved x / 6".
- Masked line-by-line text reveals, magnetic buttons, full-screen menu with staggered serif links (hover morphs the particle object), page-transition wipe that takes on the next page's color, sound toggle OFF by default.
- 404 page: "404 — this page is out of distribution."

## Non-negotiable quality bar
- Accessibility: semantic landmarks, one h1 per page, skip link, visible focus, full keyboard support for every demo, alt text, AA contrast in EVERY theme, prefers-reduced-motion fully respected.
- Performance: Lighthouse ≥ 90 on mobile, LCP < 2.5s; lazy-load R3F after first paint; AVIF/WebP via next/image; videos muted playsinline with posters, loaded only near the viewport.
- SEO/meta: metadata API, Open Graph/Twitter with /media/og.png, JSON-LD Person, sitemap, robots, favicon set.
- Responsive at 360 / 768 / 1280 / 1920. Mobile: static covers instead of 3D, chapters stacked, GRID view default.
- Real copy above, no lorem ipsum (except clearly marked bio placeholders).

## How to work with me
I'm still learning to code. Build in phases and stop after each one for me to review:
1 setup, tokens, fonts, layout, Lenis, theme system · 2 loader + hero (video fallback first, then particle object + morph targets) · 3 work index + the five chapters with demos · 4 case-study template + pages · 5 about, contact, footer, menu, transitions, anomaly hunt · 6 accessibility/performance/SEO pass with a Lighthouse report.
For each phase, explain what each file and important function does in plain language, so I understand the code and can change it myself.
```

---

## PART 7 — Before submitting to Awwwards
1. Test on a mid-range Android phone. Most sites lose points on usability and mobile.
2. Run Lighthouse and axe DevTools, and fix everything they flag, especially contrast in every project theme.
3. Use a custom domain (e.g. `harsha.dev`), not a `vercel.app` URL.
4. Record a 20–30 s screen capture of the best moments for the submission and LinkedIn.
5. Submit at awwwards.com → "Submit Website" (paid). Choose the Portfolio category and tag Three.js / GSAP / Next.js.
