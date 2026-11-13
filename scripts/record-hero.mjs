// Records the live particle cloud into the fallback video and still image:
//   public/media/hero-loop.mp4, hero-loop.webm, hero-poster.avif
//
// How to run it:
//   1. pnpm build && pnpm start --port 3100     (leave it running)
//   2. pnpm record:hero                         (in a second terminal)
//
// It opens the site in Chrome, turns the page white, hides everything except
// the particle object, and steps the object's clock one frame at a time
// through one 8-second loop, saving a picture of each frame. ffmpeg joins the
// pictures into the two videos. Because the object's drift repeats exactly
// every 8 seconds, the video loops seamlessly.
// Needs Google Chrome, ffmpeg and ImageMagick (magick).
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const URL = process.argv[2] ?? "http://localhost:3100/";
const FPS = 24;
const SECONDS = 8;
const VIDEO = 480; // pixels square; thousands of moving dots make large files
const STILL = 720;
const OUT = "public/media";

const frames = mkdtempSync(join(tmpdir(), "hero-frames-"));
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 2,
});

// Skip the loader and take control of the object's clock.
await page.addInitScript(() => {
  sessionStorage.setItem("loaded", "1");
  window.__particleTime = -8;
});
await page.goto(URL);
await page.addStyleTag({
  content: `
    html { background: white !important }
    body::after { display: none }
    header, [data-hero], #work { visibility: hidden }
  `,
});
await page.locator('[data-shape="cloud"]').waitFor();

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

// One loop to let the points settle, then one loop recorded.
for (let i = 0; i < FPS * SECONDS; i++) await step(i / FPS - SECONDS);
const box = page.locator(".stage-box");
for (let i = 0; i < FPS * SECONDS; i++) {
  await step(i / FPS);
  await box.screenshot({
    path: join(frames, `${String(i).padStart(4, "0")}.png`),
  });
}
await browser.close();

// Each line is one ffmpeg command: the pictures in, one video out.
const ffmpeg = (...output) =>
  execFileSync(
    "ffmpeg",
    [
      ...["-y", "-framerate", FPS, "-i", join(frames, "%04d.png")],
      ...["-vf", `scale=${VIDEO}:${VIDEO}:flags=lanczos`, "-an"],
      ...["-pix_fmt", "yuv420p", ...output],
    ].map(String),
    { stdio: "ignore" },
  );
ffmpeg(
  "-c:v",
  "libx264",
  "-crf",
  32,
  "-preset",
  "slow",
  "-movflags",
  "+faststart",
  `${OUT}/hero-loop.mp4`,
);
ffmpeg("-c:v", "libvpx-vp9", "-b:v", 0, "-crf", 45, `${OUT}/hero-loop.webm`);

execFileSync("magick", [
  join(frames, "0000.png"),
  ...["-resize", `${STILL}x${STILL}`, "-strip", "-quality", "55"],
  `${OUT}/hero-poster.avif`,
]);
rmSync(frames, { recursive: true });
console.log(`Recorded ${FPS * SECONDS} frames into ${OUT}`);
