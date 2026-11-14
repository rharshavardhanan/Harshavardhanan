import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

// An automated accessibility audit (axe) of every kind of page and every
// colour theme. It catches things such as faint text, unlabelled controls and
// broken heading order. It reports each problem's rule and the element.
const audit = async (page: Page) => {
  // Buttons fade between colours for a moment when the page first starts;
  // measuring mid-fade would report contrast that no visitor ever sees.
  await page.waitForTimeout(500);
  const tags = [
    "wcag2a",
    "wcag2aa",
    "wcag21a",
    "wcag21aa",
    "wcag22aa",
    "best-practice",
  ];
  // The hero name uses "difference" blending, which axe cannot measure (it
  // reads it as white on white). Its rendered colour is checked from the real
  // pixels in e2e/blend.e2e.ts instead; every other rule still applies to it.
  const name = ".hero-name-layer";
  const main = await new AxeBuilder({ page })
    .withTags(tags)
    .exclude(name)
    .analyze();
  const hasName = (await page.locator(name).count()) > 0;
  const rest = hasName
    ? await new AxeBuilder({ page })
        .withTags(tags)
        .include(name)
        .disableRules(["color-contrast"])
        .analyze()
    : { violations: [] };
  const violations = [...main.violations, ...rest.violations];
  return violations.map(
    (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`,
  );
};

test.use({ reducedMotion: "reduce" }); // audit the settled page, not mid-animation

test("home page (the list of films, as reduced motion shows it)", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".corners time")).toHaveText(/IST$/);
  expect(await audit(page)).toEqual([]);
});

test.describe("with motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("a project page as it first appears, animations ready", async ({
    page,
  }) => {
    await page.goto("/work/scp");
    await expect(page.locator("html")).toHaveAttribute("data-motion", "ready");
    expect(await audit(page)).toEqual([]);
  });

  test("home page with the ring running", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".ring")).toHaveAttribute("data-state", "on", {
      timeout: 15000,
    });
    expect(await audit(page)).toEqual([]);
  });
});

test("about page", async ({ page }) => {
  await page.goto("/about");
  expect(await audit(page)).toEqual([]);
});

for (const theme of [
  "odovox",
  "scp",
  "aftermeet",
  "road",
  "kattral",
  "cache",
  "hallucination",
]) {
  test(`case study: ${theme}`, async ({ page }) => {
    await page.goto(`/work/${theme}`);
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    expect(await audit(page)).toEqual([]);
  });
}

for (const [name, dialog] of [
  ["Menu", "Site menu"],
  ["Inquire", "Inquire"],
]) {
  test(`${name} open`, async ({ page }) => {
    await page.goto("/work/odovox");
    await page.locator(".corners").getByRole("link", { name }).click();
    await expect(page.getByRole("dialog", { name: dialog })).toBeVisible();
    expect(await audit(page)).toEqual([]);
  });
}

test("contact page", async ({ page }) => {
  await page.goto("/contact");
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
    await expect(page.locator(".corners time")).toHaveText(/IST$/);
    expect(await audit(page)).toEqual([]);
  });

  for (const path of ["/about", "/contact", "/work/odovox", "/work/aftermeet"]) {
    test(`${path}: clean, and nothing scrolls sideways at 360px`, async ({
      page,
    }) => {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      expect(await audit(page)).toEqual([]);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});
