import { expect, type Page, test } from "@playwright/test";

const scrollToChapter = (page: Page, name: string) =>
  page
    .locator(`[data-chapter="${name}"]`)
    .evaluate((el) => el.scrollIntoView({ block: "center" }));

test.describe("desktop", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("the particle object appears and starts as the cloud", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await expect(page.locator(".stage")).toHaveAttribute(
      "data-mode",
      "particles",
    );
    await expect(page.locator(".stage canvas")).toHaveCount(1);
    await expect(page.locator("[data-shape]")).toHaveAttribute(
      "data-shape",
      "cloud",
    );
    expect(errors).toEqual([]);
  });

  for (const [chapter, symbol] of [
    ["scp", "arm"],
    ["aftermeet", "doc"],
    ["road", "road"],
    ["kattral", "tiles"],
    ["cache", "blocks"],
    ["hallucination", "bubble"],
  ]) {
    test(`reaching ${chapter} turns it into the ${symbol}`, async ({
      page,
    }) => {
      await page.goto("/");
      await expect(page.locator("[data-shape]")).toHaveCount(1);
      await scrollToChapter(page, chapter);
      await expect(page.locator("[data-shape]")).toHaveAttribute(
        "data-shape",
        symbol,
      );
    });
  }

  test("reaching odovox plays the waveform, then the tooth", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("[data-shape]")).toHaveCount(1);
    await scrollToChapter(page, "odovox");
    await expect(page.locator("[data-shape]")).toHaveAttribute(
      "data-shape",
      "waveform",
    );
    await expect(page.locator("[data-shape]")).toHaveAttribute(
      "data-shape",
      "tooth",
    );
  });

  test("leaving the chapters returns it to the cloud", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-shape]")).toHaveCount(1);
    await scrollToChapter(page, "cache");
    await expect(page.locator("[data-shape]")).toHaveAttribute(
      "data-shape",
      "blocks",
    );
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.locator("[data-shape]")).toHaveAttribute(
      "data-shape",
      "cloud",
    );
  });
});

test.describe("phone", () => {
  test.use({
    viewport: { width: 360, height: 740 },
    hasTouch: true,
    isMobile: true,
  });

  test("there is no canvas", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".stage")).toHaveAttribute("data-mode", "video");
    await expect(page.locator("canvas")).toHaveCount(0);
  });
});

test.describe("desktop with reduced motion", () => {
  test.use({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });

  test("there is no canvas and the video does not play", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header time")).toHaveText(/^\d\d:\d\d IST$/);
    await expect(page.locator(".stage")).toHaveAttribute("data-mode", "poster");
    await expect(page.locator("canvas")).toHaveCount(0);
    // The video element is only there for its still picture; it never plays.
    await page.waitForLoadState("load");
    await page.waitForTimeout(500);
    expect(
      await page
        .locator(".stage video")
        .evaluate((v: HTMLVideoElement) => v.paused && v.currentTime === 0),
    ).toBe(true);
  });
});

test("the fallback media is served", async ({ request }) => {
  for (const [path, type] of [
    ["/media/hero-poster.avif", "image/avif"],
    ["/media/hero-loop.webm", "video/webm"],
    ["/media/hero-loop.mp4", "video/mp4"],
  ]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    expect(response.headers()["content-type"]).toContain(type);
  }
});

test.describe("phone fallback", () => {
  test.use({
    viewport: { width: 360, height: 740 },
    hasTouch: true,
    isMobile: true,
  });

  test("the video plays", async ({ page }) => {
    await page.goto("/");
    const video = page.locator(".stage video");
    await expect(video).toHaveCount(1);
    await expect
      .poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime))
      .toBeGreaterThan(0);
  });
});

test("without JavaScript the still image is shown", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator(".stage video")).toBeVisible();
  await expect(page.locator(".stage video")).toHaveAttribute(
    "poster",
    "/media/hero-poster.avif",
  );
  await context.close();
});

test.describe("desktop, past the chapters", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("the particle object does not follow into the About section", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("[data-shape]")).toHaveCount(1);
    await page
      .locator("#about")
      .evaluate((el) => el.scrollIntoView({ block: "start" }));
    await expect(page.locator(".stage-box")).not.toBeInViewport();
  });
});
