import { expect, type Page, test } from "@playwright/test";

// The home page: a ring of seven films drawn with WebGL, over a plain list of
// links that is the fallback and the keyboard's way in.

// Skip the first-visit loader (e2e/loader.e2e.ts tests it): while it covers
// the window, the ring rightly ignores the mouse.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("loaded", "1"));
});

const ring = (page: Page) => page.locator(".ring");
const running = (page: Page) =>
  expect(ring(page)).toHaveAttribute("data-state", "on", { timeout: 15000 });

test("without JavaScript the home page is a list of the seven projects", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 360, height: 740 },
  });
  const page = await context.newPage();
  await page.goto("/");
  const links = page.locator("#projects a");
  await expect(links).toHaveCount(7);
  await expect(links.first()).toHaveAttribute("href", "/work/odovox");
  await expect(links.nth(1)).toContainText("Aftermeet");
  await expect(links.first().locator("img")).toHaveAttribute(
    "src",
    /poster-odovox|cover-odovox/,
  );
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
  await context.close();
});

test("the ring starts, names the middle project and turns with the arrow keys", async ({
  page,
}) => {
  await page.goto("/");
  await running(page);
  await expect(page.locator(".ring-canvas")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-active", "odovox");
  await expect(page.locator(".corner-bottom")).toContainText("01 / 07");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("html")).toHaveAttribute(
    "data-active",
    "aftermeet",
  );
  await expect(page.locator(".corner-bottom")).toContainText("02 / 07");
  // The page takes the middle project's colours.
  await expect(ring(page)).toHaveAttribute("data-theme", "aftermeet");
  // And the frame stays white over the dark smoke, even for Aftermeet, the
  // one light project.
  await expect(page.locator("html")).toHaveAttribute("data-tone", "dark");
  await expect(page.locator(".corner-name").first()).toHaveCSS(
    "color",
    "rgb(244, 242, 238)",
  );
  // And Enter opens it: focus followed the ring.
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/work\/aftermeet$/);
});

test("tabbing to a project's link turns the ring to it", async ({ page }) => {
  await page.goto("/");
  await running(page);
  await page.locator('[data-ring-link="4"]').focus();
  await expect(page.locator("html")).toHaveAttribute("data-active", "kattral");
});

test("the mouse wheel turns the ring, and the middle panel opens its project", async ({
  page,
}) => {
  await page.goto("/");
  await running(page);
  await page.mouse.move(700, 450);
  await page.mouse.wheel(0, 400);
  await expect(page.locator("html")).toHaveAttribute(
    "data-active",
    "aftermeet",
  );
  await page.locator("[data-ring-hit]").click();
  await expect(page).toHaveURL(/\/work\/aftermeet$/);
});

test("the background has its light motes", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await expect(page.locator(".ring")).toHaveAttribute("data-state", "on", {
    timeout: 15000,
  });
  // Set once the motes' shaders are built (they fail quietly otherwise).
  await expect(page.locator(".bg-canvas")).toHaveAttribute("data-motes", "400");
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("no ring: the list of posters is the page", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".corners time")).toHaveText(/^\d\d:\d\d IST$/);
    await expect(ring(page)).toHaveAttribute("data-state", "off");
    await expect(page.locator("#projects a").first()).toBeVisible();
  });
});

test("a tick plays as each new panel reaches the centre", async ({ page }) => {
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
  await running(page);
  const sounds = () =>
    page.evaluate(() => (window as unknown as { sounds: number }).sounds);
  // No switch: the first key press lets the browser make sound.
  await page.keyboard.press("Shift");
  await page.waitForTimeout(300); // the tick is made once, in the background
  expect(await sounds()).toBe(0);
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("html")).toHaveAttribute(
    "data-active",
    "aftermeet",
  );
  await expect.poll(sounds).toBeGreaterThan(0);
});

test.describe("on a touch phone", () => {
  test.use({
    viewport: { width: 393, height: 852 },
    hasTouch: true,
    isMobile: true,
  });

  // The centre panel's empty margins left and right, along the middle row of
  // a screenshot (pixels darker than 25 count as background).
  const margins = async (page: Page) => {
    const shot = (await page.screenshot()).toString("base64");
    return page.evaluate(async (src) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const g = canvas.getContext("2d")!;
      g.drawImage(img, 0, 0);
      const row = g.getImageData(0, img.height >> 1, img.width, 1).data;
      const lum = (i: number) =>
        0.3 * row[i * 4] + 0.59 * row[i * 4 + 1] + 0.11 * row[i * 4 + 2];
      let left = 0;
      let right = img.width - 1;
      while (left < img.width && lum(left) < 25) left++;
      while (right > 0 && lum(right) < 25) right--;
      return { left, right: img.width - 1 - right };
    }, `data:image/png;base64,${shot}`);
  };

  test("a phone draws fewer motes", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".bg-canvas")).toHaveAttribute(
      "data-motes",
      "150",
      { timeout: 15000 },
    );
  });

  test("a swipe on a phone leaves the ring centred", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".ring")).toHaveAttribute("data-state", "on", {
      timeout: 15000,
    });
    await page.waitForTimeout(2500);
    const before = await margins(page);
    expect(Math.abs(before.left - before.right)).toBeLessThanOrEqual(2);

    // Swipe up with the thumb on the right, as a right hand does.
    const cdp = await page.context().newCDPSession(page);
    const touch = (type: "touchStart" | "touchMove" | "touchEnd", y?: number) =>
      cdp.send("Input.dispatchTouchEvent", {
        type,
        touchPoints: y === undefined ? [] : [{ x: 330, y }],
      });
    await touch("touchStart", 600);
    for (let i = 1; i <= 12; i++) {
      await touch("touchMove", 600 - i * 25);
      await page.waitForTimeout(16);
    }
    await touch("touchEnd");
    await page.waitForTimeout(3000);

    const after = await margins(page);
    expect(Math.abs(after.left - after.right)).toBeLessThanOrEqual(2);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(393);
  });
});
