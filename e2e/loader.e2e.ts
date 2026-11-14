import { expect, type Page, test } from "@playwright/test";

// The loader: a counter and the name, filling grey to white, on the first
// visit of a browser session.
// On the home page it then waits for Enter, the click that lets the browser
// play the ring's sound; on other pages it lifts by itself.

const loading = (page: Page) =>
  page.evaluate(() => document.documentElement.dataset.loading ?? null);

test("the home page's first visit waits for Enter, then sound works", async ({
  page,
}) => {
  // Count the sounds the page makes by wrapping the browser's sound maker.
  await page.addInitScript(() => {
    const w = window as unknown as { sounds: number };
    w.sounds = 0;
    const make = AudioContext.prototype.createBufferSource;
    AudioContext.prototype.createBufferSource = function () {
      w.sounds++;
      return make.call(this);
    };
  });
  await page.goto("/");
  expect(await loading(page)).not.toBeNull();
  await expect(page.locator(".loader")).toContainText("Harshavardhanan");
  const enter = page.getByRole("button", { name: "Enter" });
  await expect(enter).toBeVisible();
  await expect(enter).toBeFocused();
  // It waits: still up well after the count has finished.
  await page.waitForTimeout(1500);
  expect(await loading(page)).toBe("gate");

  await enter.click();
  await expect.poll(() => loading(page), { timeout: 3000 }).toBeNull();
  await expect(page.locator(".loader")).toBeHidden();
  // The ring runs, and ticks from the first turn.
  await expect(page.locator(".ring")).toHaveAttribute("data-state", "on", {
    timeout: 15000,
  });
  await page.waitForTimeout(300); // the tick is made once, in the background
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as { sounds: number }).sounds),
    )
    .toBeGreaterThan(0);
});

test("the name fills from grey to white as the count runs", async ({
  page,
}) => {
  await page.goto("/work/odovox", { waitUntil: "commit" });
  await page.locator(".loader-fill").waitFor({ state: "attached" });
  // Freeze the loader halfway through and measure how much of the white
  // copy shows: its clip is inset(0 R% 0 0), R being the part still grey.
  const grey = await page.evaluate(() => {
    for (const a of document.getAnimations()) {
      if (!(a as CSSAnimation).animationName?.startsWith("loader")) continue;
      a.pause();
      a.currentTime = Number(a.effect!.getTiming().duration) / 2;
    }
    const clip = getComputedStyle(
      document.querySelector(".loader-fill")!,
    ).clipPath;
    return parseFloat(clip.split(" ")[1]);
  });
  expect(grey).toBeGreaterThan(25);
  expect(grey).toBeLessThan(75);
});

for (const [width, height] of [
  [1440, 900],
  [360, 740],
]) {
  test(`the name sits in the middle of the window (${width}px)`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/work/odovox", { waitUntil: "commit" });
    const name = page.locator(".loader-name > span").first();
    await name.waitFor();
    // The letters themselves, not the box around them (a range over the text).
    const middle = await name.evaluate((span) => {
      const range = document.createRange();
      range.selectNodeContents(span);
      const box = range.getBoundingClientRect();
      return box.left + box.width / 2;
    });
    expect(Math.abs(middle - width / 2)).toBeLessThan(4);
  });
}

test("on any other page it lifts by itself", async ({ page }) => {
  await page.goto("/work/odovox");
  expect(await loading(page)).not.toBeNull();
  await expect.poll(() => loading(page), { timeout: 4000 }).toBeNull();
  await expect(page.getByRole("button", { name: "Enter" })).toBeHidden();
});

test("a second visit in the same session skips it", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Enter" }).click();
  await expect.poll(() => loading(page), { timeout: 4000 }).toBeNull();
  await page.reload();
  expect(await loading(page)).toBeNull();
  await expect(page.locator(".loader")).toBeHidden();
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("there is no loader", async ({ page }) => {
    await page.goto("/");
    expect(await loading(page)).toBeNull();
    await expect(page.locator(".loader")).toBeHidden();
  });
});

test("without JavaScript there is no loader and the page is readable", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator(".loader")).toBeHidden();
  await expect(page.locator("#projects a")).toHaveCount(7);
  await context.close();
});
