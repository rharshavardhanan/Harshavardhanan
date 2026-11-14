import { expect, type Page, test } from "@playwright/test";

// Each project section paints its own colour. When it arrives, its colour
// grows over the previous one as a circle (the "wipe").
const backgrounds = {
  odovox: "rgb(15, 31, 28)",
  road: "rgb(18, 18, 18)",
  kattral: "rgb(28, 20, 16)",
  cache: "rgb(11, 16, 32)",
  hallucination: "rgb(22, 17, 31)",
};

const ownLayer = (page: Page, name: string) =>
  page.locator(`section[data-zone="${name}"] .paint-own`);

const scrollTo = (page: Page, name: string) =>
  page
    .locator(`section[data-zone="${name}"]`)
    .evaluate((el) => el.scrollIntoView({ block: "center" }));

test("before a project is reached its colour is hidden", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-active", "hero");
  await expect(ownLayer(page, "cache")).toHaveCSS("clip-path", /circle\(0%/);
});

for (const [name, colour] of Object.entries(backgrounds)) {
  test(`${name}: its colour wipes in when it arrives`, async ({ page }) => {
    await page.goto("/");
    await scrollTo(page, name);
    await expect(page.locator("html")).toHaveAttribute("data-active", name);
    const layer = ownLayer(page, name);
    await expect(layer).toHaveCSS("background-color", colour);
    // Fully open: the clip is removed once the circle has grown.
    await expect(layer).toHaveCSS("clip-path", "none");
  });
}

test("scrolling back closes the wipe again", async ({ page }) => {
  await page.goto("/");
  await scrollTo(page, "road");
  await expect(ownLayer(page, "road")).toHaveCSS("clip-path", "none");
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(ownLayer(page, "road")).toHaveCSS("clip-path", /circle\(0%/);
  await expect(page.locator("html")).toHaveAttribute("data-active", "hero");
});

test("without JavaScript every section shows its own colour", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  for (const [name, colour] of Object.entries(backgrounds)) {
    await expect(ownLayer(page, name)).toHaveCSS("background-color", colour);
    await expect(ownLayer(page, name)).toHaveCSS("clip-path", "none");
  }
  await context.close();
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("colours are simply there, with no wipe", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header time")).toHaveText(/^\d\d:\d\d IST$/);
    await expect(ownLayer(page, "cache")).toHaveCSS("clip-path", "none");
  });
});
