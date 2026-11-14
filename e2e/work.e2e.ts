import { expect, test } from "@playwright/test";

const slugs = [
  "odovox",
  "scp",
  "aftermeet",
  "road",
  "kattral",
  "cache",
  "hallucination",
];

test.describe("desktop", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("the index lists every project, each linking to its chapter", async ({
    page,
  }) => {
    await page.goto("/");
    const rows = page.locator("#work ol a");
    await expect(rows).toHaveCount(slugs.length);
    for (const [i, slug] of slugs.entries()) {
      await expect(rows.nth(i)).toHaveAttribute("href", `#${slug}`);
      await expect(page.locator(`section#${slug}`)).toHaveCount(1);
    }
  });

  test("the view toggle switches to covers and is remembered", async ({
    page,
  }) => {
    await page.goto("/");
    const grid = page.getByRole("button", { name: "grid" });
    await expect(grid).toHaveAttribute("aria-pressed", "false");
    await grid.click();
    await expect(grid).toHaveAttribute("aria-pressed", "true");
    // One cover per project: a picture or a recording each.
    await expect(page.locator("#work ul > li")).toHaveCount(slugs.length);
    for (const item of await page.locator("#work ul > li").all()) {
      await expect(item.locator("img, video").first()).toBeAttached();
    }
    await page.reload();
    await expect(page.getByRole("button", { name: "grid" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("pointing at a project turns the particle object into its symbol", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("[data-shape]")).toHaveCount(1);
    await page.locator("#work ol a").nth(slugs.indexOf("cache")).hover();
    await expect(page.locator("[data-shape]")).toHaveAttribute(
      "data-shape",
      "blocks",
    );
    await page.locator("#work-title").hover();
    await expect(page.locator("[data-shape]")).toHaveAttribute(
      "data-shape",
      "cloud",
    );
  });

  test("every chapter has figures, a demo and a case-study link", async ({
    page,
  }) => {
    await page.goto("/");
    for (const slug of slugs) {
      const chapter = page.locator(`section#${slug}`);
      await expect(chapter.locator("[data-stats] dd")).toHaveCount(3);
      await expect(chapter.locator("figure")).toHaveCount(1);
      await expect(
        chapter.getByRole("link", { name: "Open case study" }),
      ).toHaveAttribute("href", `/work/${slug}`);
    }
  });
});

test.describe("phone", () => {
  test.use({
    viewport: { width: 360, height: 740 },
    hasTouch: true,
    isMobile: true,
  });

  test("the work index starts as a grid of covers", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "grid" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    // One cover per project: a picture or a recording each.
    await expect(page.locator("#work ul > li")).toHaveCount(slugs.length);
    for (const item of await page.locator("#work ul > li").all()) {
      await expect(item.locator("img, video").first()).toBeAttached();
    }
  });
});

test("the covers and case videos are served", async ({ request }) => {
  for (const slug of slugs) {
    for (const path of [
      `/media/cover-${slug}.avif`,
      `/media/case-${slug}.mp4`,
      `/media/case-${slug}.webm`,
    ]) {
      expect((await request.get(path)).status(), path).toBe(200);
    }
  }
});
