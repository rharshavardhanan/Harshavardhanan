import { expect, type Page, test } from "@playwright/test";

const paper = "rgb(244, 242, 238)";
const backgrounds = {
  odovox: "rgb(15, 31, 28)",
  road: "rgb(18, 18, 18)",
  kattral: "rgb(28, 20, 16)",
  cache: "rgb(11, 16, 32)",
  hallucination: "rgb(22, 17, 31)",
};

const pageBackground = (page: Page) =>
  page.evaluate(
    () => getComputedStyle(document.documentElement).backgroundColor,
  );

const scrollToChapter = (page: Page, name: string) =>
  page
    .locator(`[data-chapter="${name}"]`)
    .evaluate((el) => el.scrollIntoView({ block: "center" }));

test("the page is paper until a project is reached", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "neutral");
  expect(await pageBackground(page)).toBe(paper);
});

for (const [name, colour] of Object.entries(backgrounds)) {
  test(`scrolling into ${name} turns the whole page its colour`, async ({
    page,
  }) => {
    await page.goto("/");
    await scrollToChapter(page, name);
    await expect(page.locator("html")).toHaveAttribute("data-theme", name);
    await expect.poll(() => pageBackground(page)).toBe(colour);
  });
}

test("scrolling back out returns the page to paper", async ({ page }) => {
  await page.goto("/");
  await scrollToChapter(page, "cache");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "cache");
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.locator("html")).toHaveAttribute("data-theme", "neutral");
  await expect.poll(() => pageBackground(page)).toBe(paper);
});

test("without JavaScript each chapter paints its own theme", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  for (const [name, colour] of Object.entries(backgrounds)) {
    await expect(page.locator(`[data-chapter="${name}"]`)).toHaveCSS(
      "background-color",
      colour,
    );
  }
  expect(await pageBackground(page)).toBe(paper);
  await context.close();
});
