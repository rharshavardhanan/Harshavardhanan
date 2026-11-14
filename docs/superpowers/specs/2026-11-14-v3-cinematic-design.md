# Portfolio v3: cinematic rebuild (design)

Source brief: "Portfolio v3: Cinematic Rebuild", pasted 2026-11-14. It is built in its own six
phases, with no review stops (Harsha chose that on 2026-11-14), one local commit per phase. Every
page must work on a phone at 360px wide.

This file records only what the brief left open or what was changed with Harsha's approval.

## Decisions

1. **Pages.**
   - `/` is a full-screen ring of seven film panels, with no page scroll.
   - `/work/[slug]` is a film-poster page, followed by proof, the demo, the deep detail and the next project.
   - `/about` is one screen.
   - `/contact` holds the Inquire content as a real page, used without JavaScript and for direct links. With JavaScript, Inquire opens the same content as an overlay.
   - The menu is a `<dialog>`. Without JavaScript, MENU is a link to `/#projects`, the home page's list of links.
2. **Order and addresses.**
   - Order: odovox, aftermeet, scp, road, kattral, cache, hallucination.
   - The URLs and theme names (the slugs) stay as they are. The brief's robot-monitor, road-damage and edge-cache-rl were not adopted.
3. **Films.**
   - Harsha makes them in Flow. The sources live in `videos/`, which is git-ignored.
   - The site uses `public/media/mood/mood-<name>.mp4` (1280×720, H.264, with the film's own sound) and `poster-<name>.avif`, a still taken from the film.
   - The names are odovox, aftermeet, robot (for scp), road, kattral, cache and halluc.
   - A project without a film falls back to its particle recording (`case-<slug>.mp4` / `cover-<slug>.avif`). Today that is hallucination.
   - Every AI film carries a visible "AI-generated film" label.
   - The Odovox film shows a dentist speaking to a phone. With the label it is an illustration of the idea, not a claim of use. Odovox still never claims live clinics.
4. **The corner frame.**
   - It is drawn in ink or paper, chosen by sampling what is underneath (top and bottom separately). There is no difference blend, so contrast stays measurable.
   - Bottom centre reads "SELECTED WORK". The years were dropped because the résumé gives none for road, cache or hallucination.
   - The IST clock moves into Inquire.
   - On phones, the bottom-centre text is hidden, the project name is truncated, and the sound switch moves into the menu.
5. **Type.**
   - `label` becomes Inter Tight, 14px, uppercase, tracking 0.04em, tabular figures.
   - Monospace survives only inside demos, through a `--label-font` variable that the demo frame sets.
   - `text-h2` grows to clamp(3rem, 9vw, 10rem) for the quote lines. Titles use `text-display`. There are still five sizes.
6. **The ring.**
   - It is written in raw WebGL2, with no 3D library. three.js, @react-three/fiber and the particle object (Particles, ParticleStage, Hero, WorkIndex, `lib/shapes.ts`, `record:hero`) are removed.
   - The page underneath is a plain list of links with posters: a scroll-snap strip, sideways on desktop and vertical on phones. It is what visitors without JavaScript, without WebGL or with reduced motion get. When the ring runs, the list stays in the page, visually hidden: focusing a link moves the ring to it.
   - Pure maths (wrapping, nearest panel, easing) lives in `lib/ring.ts`, with tests.
   - Only the centre panel and one on each side play video. The others show their posters.
   - Pixel ratio is capped at 1.5. Everything pauses when the tab is hidden.
7. **The transition.**
   - Clicking the centre panel unbends it until it fills the window. The navigation then runs inside a React `<ViewTransition>`, with the shared name `film-<slug>` on both the canvas and the project page's film.
   - The film's playback time is handed over through sessionStorage.
   - Going back starts the ring expanded on that project, then it settles.
8. **The project page.**
   - The sections, in order:
     1. Giant title and a credits table (Role, Team, Built with, Year, Status where known).
     2. The film, sticky behind the title. The title block has a torn bottom edge and scrolls away to reveal the film.
     3. The quote, word by word, scrubbed by scroll.
     4. The synopsis (the pitch) and the stats set as laurels.
     5. Proof.
     6. The demo, unboxed.
     7. The deep detail: problem, what I built, result, architecture, what was hard, links.
     8. The next project, which grows on scroll and then navigates.
   - Changes between dark and light sections use torn or curved SVG edges, never a straight cut.
9. **Proof.** `components/proof/<Project>.tsx` replaces the chapters and `CASE_MEDIA`. It is the one place each project's real material is arranged.
10. **Sound.** The sound switch unmutes the film in view: the centre panel on the home page, the hero film on a project page. The click tick is removed.
11. **Anomaly hunt.** It is kept. One glitch sits in each project page's credits and one on /about. The count is shown in the menu.
12. **The old footer** ("Let's build") is removed. The © line moves into the menu.
13. **The dev error** ("unstable value `Date.now()`" from `lib/media.ts`) is fixed by reading PNG headers with `readFileSync`, which Cache Components allows.

## Testing

- **Unit:** `lib/ring.ts`, `lib/media.ts` (film fallback), `lib/torn.ts` (edge path), plus the existing tests.
- **Browser:**
  - frame and menu, Inquire and `/contact`
  - the ring: fallback list, keyboard, active project, centre link
  - the transition
  - the project page: credits, quote, laurels, proof, demo, next
  - `/about`
  - axe on every page
  - no sideways scroll at 360px
  - reduced motion
  - JavaScript off
- **Lighthouse:** 90 or more on mobile for `/` and one case study.
