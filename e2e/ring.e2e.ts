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
  await expect(page.locator("html")).toHaveAttribute("data-active", "aftermeet");
  await expect(page.locator(".corner-bottom")).toContainText("02 / 07");
  // The page takes the middle project's colours.
  await expect(ring(page)).toHaveAttribute("data-theme", "aftermeet");
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
  await expect(page.locator("html")).toHaveAttribute("data-active", "aftermeet");
  await page.locator("[data-ring-hit]").click();
  await expect(page).toHaveURL(/\/work\/aftermeet$/);
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
