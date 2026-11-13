import { expect, test } from "@playwright/test";

test.describe("desktop", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("renders the three typefaces", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const family = (selector: string) =>
      page
        .locator(selector)
        .first()
        .evaluate((el) => getComputedStyle(el).fontFamily);
    expect(await family("h1")).toContain("Instrument Serif");
    expect(await family("h1 + p")).toContain("Inter Tight");
    expect(await family("main dl")).toContain("JetBrains Mono");
    for (const name of ["Instrument Serif", "Inter Tight", "JetBrains Mono"]) {
      expect(
        await page.evaluate((n) => document.fonts.check(`16px "${n}"`), name),
      ).toBe(true);
    }
  });

  test("has exactly one h1, and it is the name", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText("Harshavardhanan");
  });

  test("shows the five projects in order", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-chapter] h2")).toHaveText([
      "Odovox",
      "Automated Road Damage Survey",
      "Kattral Academy",
      "Edge Cache RL",
      "Hallucination Detection in LLMs",
    ]);
  });

  test("keyboard: the skip link comes first and lands in main", async ({
    page,
  }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveText("Skip to content");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() => !!document.activeElement?.closest("main")),
    ).toBe(true);
  });
});

test.describe("phone", () => {
  test.use({
    viewport: { width: 360, height: 740 },
    hasTouch: true,
    isMobile: true,
  });

  test("nothing overflows sideways at 360px", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
