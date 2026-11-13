// Records each project's particle symbol, in that project's colours, into:
//   public/media/cover-<slug>.avif          (a still, 16:9)
//   public/media/case-<slug>.mp4 and .webm  (an 8-second seamless loop)
//
// These are stand-ins made from the site's own particle object. To use your
// own artwork instead, save files under the same names; no code changes.
//
// How to run it:
//   1. pnpm build && pnpm start --port 3100     (leave it running)
//   2. pnpm record:covers                       (in a second terminal)
// Needs Google Chrome, ffmpeg and ImageMagick (magick).
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const URL = process.argv[2] ?? "http://localhost:3100/";
const SLUGS = ["odovox", "road", "kattral", "cache", "hallucination"];
const FPS = 24;
const SECONDS = 8;
const OUT = "public/media";

const browser = await chromium.launch({ channel: "chrome" });

for (const slug of SLUGS) {
  const frames = mkdtempSync(join(tmpdir(), `cover-${slug}-`));
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
  });

  // Skip the loader and take control of the object's clock.
  await page.addInitScript(() => {
    sessionStorage.setItem("loaded", "1");
    window.__particleTime = -20;
  });
  await page.goto(URL);
  // Hide everything except the particle object, and centre it.
  await page.addStyleTag({
    content: `
      body::after { display: none }
      header, main * { visibility: hidden }
      .stage, .stage * { visibility: visible !important }
      .stage { position: fixed !important; inset: 0; height: auto !important; margin: 0 !important }
      .stage-box { top: 50% !important; right: 50% !important; translate: 50% -50% !important; width: 108vh !important }
    `,
  });
  await page.locator("[data-shape]").waitFor();
  // Switch the page to this project's theme by hand, then give the colours
  // time to fade and Odovox time to go from waveform to tooth.
  await page.evaluate((name) => {
    document.documentElement.dataset.theme = name;
  }, slug);
  await page.waitForTimeout(2600);

  // Sets the clock, then waits two screen refreshes so the frame is drawn.
  const step = (time) =>
    page.evaluate(
      (t) =>
        new Promise((done) => {
          window.__particleTime = t;
          requestAnimationFrame(() => requestAnimationFrame(done));
        }),
      time,
    );

  // Two loops for the points to settle into the symbol, then one recorded.
  for (let i = 0; i < FPS * SECONDS * 2; i++) await step(i / FPS - SECONDS * 2);
  for (let i = 0; i < FPS * SECONDS; i++) {
    await step(i / FPS);
    await page.screenshot({
      path: join(frames, `${String(i).padStart(4, "0")}.png`),
    });
  }
  await page.close();

  const ffmpeg = (...output) =>
    execFileSync(
      "ffmpeg",
      [
        ...["-y", "-framerate", FPS, "-i", join(frames, "%04d.png")],
        ...["-vf", "scale=640:360:flags=lanczos", "-an"],
        ...["-pix_fmt", "yuv420p", ...output],
      ].map(String),
      { stdio: "ignore" },
    );
  ffmpeg(
    "-c:v",
    "libx264",
    "-crf",
    30,
    "-preset",
    "slow",
    "-movflags",
    "+faststart",
    `${OUT}/case-${slug}.mp4`,
  );
  ffmpeg(
    "-c:v",
    "libvpx-vp9",
    "-b:v",
    0,
    "-crf",
    42,
    `${OUT}/case-${slug}.webm`,
  );
  execFileSync("magick", [
    join(frames, "0000.png"),
    ...["-strip", "-quality", "60"],
    `${OUT}/cover-${slug}.avif`,
  ]);
  rmSync(frames, { recursive: true });
  console.log(`Recorded ${slug}`);
}

await browser.close();
