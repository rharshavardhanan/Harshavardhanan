import { expect, type Page, test } from "@playwright/test";

const intoChapter = async (page: Page, name: string) => {
  await page
    .locator(`[data-chapter="${name}"]`)
    .evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect(page.locator("html")).toHaveAttribute("data-theme", name);
};

test.describe("desktop with a mouse", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("the normal arrow is used outside a project", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/has-cursor/);
    await page.mouse.move(400, 300);
    await expect(page.locator(".cursor")).toBeHidden();
    expect(
      await page.evaluate(() => getComputedStyle(document.body).cursor),
    ).toBe("auto");
  });

  test("inside a project the pointer becomes that project's cursor", async ({
    page,
  }) => {
    await page.goto("/");
    await intoChapter(page, "road");
    await page.mouse.move(300, 300);
    await page.mouse.move(310, 310);
    const cursor = page.locator(".cursor");
    await expect(cursor.locator("i")).toBeVisible();
    expect(
      await page.evaluate(() => getComputedStyle(document.body).cursor),
    ).toBe("none");
    // It sits exactly at the pointer.
    const box = (await cursor.locator("i").boundingBox())!;
    expect(Math.round(box.x + box.width / 2)).toBe(310);
    expect(Math.round(box.y + box.height / 2)).toBe(310);
  });
});

test.describe("reduced motion", () => {
  test.use({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });

  test("there is no custom cursor", async ({ page }) => {
    await page.goto("/");
    await intoChapter(page, "road");
    await expect(page.locator(".cursor")).toHaveCount(0);
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
    await expect(page.locator("header time")).toHaveText(/^\d\d:\d\d IST$/);
    await expect(page.locator(".cursor")).toHaveCount(0);
  });
});
