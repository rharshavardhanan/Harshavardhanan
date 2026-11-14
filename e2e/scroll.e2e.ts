import { expect, test } from "@playwright/test";

test("smooth scrolling is on by default", async ({ page }) => {
  await page.goto("/work/odovox");
  await expect(page.locator("html")).toHaveClass(/lenis/);
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("scrolling is left to the browser", async ({ page }) => {
    await page.goto("/work/odovox");
    // Wait for the page's scripts to be running before checking an absence.
    await expect(page.locator(".corners time")).toHaveText(/^\d\d:\d\d IST$/);
    await expect(page.locator("html")).not.toHaveClass(/lenis/);
    await page.mouse.wheel(0, 600);
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(0);
  });
});
