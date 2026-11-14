import { expect, test } from "@playwright/test";

// These check other things: skip the first-visit loader (and its Enter gate,
// e2e/loader.e2e.ts tests those).
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("loaded", "1"));
});

test.describe("desktop with a mouse", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("a dot follows the pointer and grows over links", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("html")).toHaveClass(/has-cursor/);
    await page.mouse.move(400, 400);
    await page.mouse.move(420, 410);
    const dot = page.locator(".cursor-dot");
    await expect(dot).toHaveAttribute("data-seen", "");
    // It glides to the pointer.
    await expect
      .poll(async () => {
        const box = (await dot.boundingBox())!;
        return [Math.round(box.x), Math.round(box.y)];
      })
      .toEqual([420, 410]);
    await expect(dot).toHaveAttribute("data-over", "");

    await page
      .locator(".corners")
      .getByRole("link", { name: "Harshavardhanan" })
      .hover();
    await expect(dot).toHaveAttribute("data-over", "link");
  });

  test("the system cursor is hidden except in text fields", async ({
    page,
  }) => {
    await page.goto("/contact");
    await expect(page.locator("html")).toHaveClass(/has-cursor/);
    expect(
      await page.evaluate(() => getComputedStyle(document.body).cursor),
    ).toBe("none");
    expect(
      await page
        .locator("main textarea")
        .evaluate((el) => getComputedStyle(el).cursor),
    ).toBe("text");
  });
});

test.describe("reduced motion", () => {
  test.use({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });

  test("there is no custom cursor", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".corners time")).toHaveText(/^\d\d:\d\d IST$/);
    await expect(page.locator(".cursor-dot")).toHaveCount(0);
    await expect(page.locator("html")).not.toHaveClass(/has-cursor/);
  });
});

test.describe("phone", () => {
  test.use({
    viewport: { width: 360, height: 740 },
    hasTouch: true,
    isMobile: true,
  });

  test("there is no custom cursor", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".corners time")).toHaveText(/^\d\d:\d\d IST$/);
    await expect(page.locator(".cursor-dot")).toHaveCount(0);
  });
});
