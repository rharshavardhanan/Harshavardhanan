import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

// An automated accessibility audit (axe) of every kind of page and every
// colour theme. It catches things such as faint text, unlabelled controls and
// broken heading order. It reports each problem's rule and the element.
const audit = async (page: Page) => {
  // Buttons fade between colours for a moment when the page first starts;
  // measuring mid-fade would report contrast that no visitor ever sees.
  await page.waitForTimeout(500);
  const { violations } = await new AxeBuilder({ page })
    .withTags([
      "wcag2a",
      "wcag2aa",
      "wcag21a",
      "wcag21aa",
      "wcag22aa",
      "best-practice",
    ])
    .analyze();
  return violations.map(
    (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`,
  );
};

test.use({ reducedMotion: "reduce" }); // audit the settled page, not mid-animation

test("home page, neutral", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "neutral");
  expect(await audit(page)).toEqual([]);
});

for (const theme of ["odovox", "road", "kattral", "cache", "hallucination"]) {
  test(`home page in the ${theme} theme`, async ({ page }) => {
    await page.goto("/");
    await page
      .locator(`[data-chapter="${theme}"]`)
      .evaluate((el) => el.scrollIntoView({ block: "center" }));
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    expect(await audit(page)).toEqual([]);
  });

  test(`case study: ${theme}`, async ({ page }) => {
    await page.goto(`/work/${theme}`);
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    expect(await audit(page)).toEqual([]);
  });
}

test("menu open", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(await audit(page)).toEqual([]);
});

test("404 page", async ({ page }) => {
  await page.goto("/no-such-page");
  expect(await audit(page)).toEqual([]);
});

test.describe("phone", () => {
  test.use({
    viewport: { width: 360, height: 740 },
    hasTouch: true,
    isMobile: true,
  });

  test("home page", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "neutral");
    expect(await audit(page)).toEqual([]);
  });
});
