// Makes the link-preview picture, public/media/og.png (1200 x 630): the word
// "Harsha" in the site's serif italic on paper, with the particle cloud
// (public/media/hero-poster.avif, a still of the old particle object).
//
// How to run it:
//   1. pnpm build && pnpm start --port 3100     (leave it running)
//   2. pnpm make:og                             (in a second terminal)
import { chromium } from "@playwright/test";

const URL = process.argv[2] ?? "http://localhost:3100/";
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.addInitScript(() => sessionStorage.setItem("loaded", "1"));
await page.goto(URL);
await page.evaluate(() => document.fonts.ready);

// Cover the page with a card built from the site's own font and colours.
await page.evaluate(() => {
  const card = document.createElement("div");
  card.style.cssText =
    "position:fixed;inset:0;z-index:999;display:flex;align-items:center;gap:40px;padding:0 90px;background:#f4f2ee;color:#0e0e0e";
  card.innerHTML = `
    <div style="flex:1">
      <div style="font:italic 400 230px/0.9 var(--font-instrument-serif),serif;letter-spacing:-0.02em">Harsha</div>
      <div style="margin-top:36px;font:400 22px var(--font-inter-tight),sans-serif;letter-spacing:0.04em;text-transform:uppercase;color:#66635c">
        Software engineer · AI &amp; ML · Chennai
      </div>
    </div>
    <img src="/media/hero-poster.avif" style="width:400px;height:400px;mix-blend-mode:multiply" />`;
  document.body.append(card);
  return card.querySelector("img").decode();
});
await page.screenshot({ path: "public/media/og.png" });
await browser.close();
console.log("Wrote public/media/og.png");
