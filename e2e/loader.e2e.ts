import { expect, type Page, test } from "@playwright/test";

const loading = (page: Page) =>
  page.evaluate(() => document.documentElement.dataset.loading ?? null);

test("first visit shows the loader, then gets out of the way", async ({
  page,
}) => {
  await page.goto("/");
  expect(await loading(page)).not.toBeNull();
  await expect(page.locator(".loader")).toBeVisible();
  await expect(page.locator(".loader")).toContainText("H.R.");
  await expect.poll(() => loading(page), { timeout: 4000 }).toBeNull();
  await expect(page.locator(".loader")).toBeHidden();
  await expect(page.locator("h1")).toBeVisible();
});

test("a second visit in the same session skips it", async ({ page }) => {
  await page.goto("/");
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
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("[data-hero]")).toContainText(
    "currently building Odovox",
  );
  await context.close();
});
