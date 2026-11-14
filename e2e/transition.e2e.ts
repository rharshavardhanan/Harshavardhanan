import { expect, test } from "@playwright/test";

// Opening a project from the ring: the middle panel grows into the project
// page's film (a view transition), the film carries on, and Back reverses it.

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("loaded", "1"));
});

test("the middle panel opens its project, and Back returns to it", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".ring")).toHaveAttribute("data-state", "on", {
    timeout: 15000,
  });
  // Let the film play a moment, so there is a time to hand over.
  await page.waitForTimeout(1500);
  await page.locator("[data-ring-hit]").click();
  await expect(page).toHaveURL(/\/work\/odovox$/);
  const film = page.locator("article [data-film] video");
  await expect(film).toHaveCount(1);
  // It carried on from where the ring's film was, rather than restarting.
  await expect
    .poll(() => film.evaluate((v: HTMLVideoElement) => v.currentTime))
    .toBeGreaterThan(1);

  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator(".ring")).toHaveAttribute("data-state", "on", {
    timeout: 15000,
  });
  await expect(page.locator("html")).toHaveAttribute("data-active", "odovox");
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("a project page shows the poster and a Play button, not autoplay", async ({
    page,
  }) => {
    await page.goto("/work/road");
    const film = page.locator("article [data-film]");
    await expect(film.locator("img")).toBeVisible();
    await expect(film.locator("video")).toHaveCount(0);
    // Scroll the title away to uncover the film, as a visitor would.
    await page.evaluate(() => window.scrollTo(0, window.innerHeight));
    await film.getByRole("button", { name: "Play the film" }).click();
    await expect(film.locator("video")).toHaveCount(1);
  });
});
