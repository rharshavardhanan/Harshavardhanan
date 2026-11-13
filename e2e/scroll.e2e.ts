import { expect, test } from "@playwright/test";

test("smooth scrolling is on by default", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/lenis/);
});

test("a header link scrolls to its section", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/lenis/);
  await page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: "Contact" })
    .click();
  await expect(page.locator("#contact")).toBeInViewport();
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("scrolling is left to the browser", async ({ page }) => {
    await page.goto("/");
    // Wait for the page's scripts to be running before checking an absence.
    await expect(page.locator("header time")).toHaveText(/^\d\d:\d\d IST$/);
    await expect(page.locator("html")).not.toHaveClass(/lenis/);
    await page.mouse.wheel(0, 600);
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(0);
  });
});
