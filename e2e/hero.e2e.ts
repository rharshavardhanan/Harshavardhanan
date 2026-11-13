import { expect, test } from "@playwright/test";

for (const width of [320, 360, 768, 1280, 1920]) {
  test(`the name fills its line without overflowing at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const fit = await page.locator("h1").evaluate((h1) => {
      const first = h1.firstElementChild!.getBoundingClientRect();
      const last = h1.lastElementChild!.getBoundingClientRect();
      return (last.right - first.left) / h1.parentElement!.clientWidth;
    });
    expect(fit).toBeGreaterThan(0.95);
    expect(fit).toBeLessThanOrEqual(1);
  });
}

test("the name is one heading, read as a word, shown in capitals", async ({
  page,
}) => {
  await page.goto("/");
  const h1 = page.locator("h1");
  await expect(h1).toHaveCount(1);
  await expect(h1).toHaveText("Harshavardhanan");
  await expect(h1).toHaveAttribute("aria-label", "Harshavardhanan");
  await expect(h1).toHaveCSS("text-transform", "uppercase");
  await expect(h1.locator("span[aria-hidden]")).toHaveCount(15);
});

test("the subtitle and status are present", async ({ page }) => {
  await page.goto("/");
  const hero = page.locator("[data-hero]");
  await expect(hero).toContainText(
    "Software engineer & founder. I build AI products end to end, from model to interface.",
  );
  await expect(hero).toContainText("currently building Odovox");
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the letters do not move", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1 span").first()).toHaveCSS(
      "animation-name",
      "none",
    );
  });
});
