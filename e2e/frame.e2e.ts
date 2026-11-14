import { expect, test } from "@playwright/test";

// The frame pinned to the four corners of every page, the menu it opens,
// and INQUIRE.

const corners = (page: import("@playwright/test").Page) =>
  page.locator(".corners");

for (const [width, height] of [
  [1280, 800],
  [360, 740],
]) {
  test.describe(`${width}px wide`, () => {
    test.use({ viewport: { width, height } });

    test("the top corners and the project counter are on screen", async ({
      page,
    }) => {
      await page.goto("/work/scp");
      const frame = corners(page);
      for (const name of ["Menu", "Harshavardhanan", "Inquire"]) {
        await expect(frame.getByRole("link", { name })).toBeInViewport();
      }
      await expect(frame.locator(".corner-bottom")).toContainText(
        "Sequential Conformal Prediction",
      );
      await expect(frame.locator(".corner-bottom")).toContainText("03 / 07");
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  });
}

test("labels are Inter Tight, except inside a demo", async ({ page }) => {
  await page.goto("/work/cache");
  await page.evaluate(() => document.fonts.ready);
  const family = (selector: string) =>
    page
      .locator(selector)
      .first()
      .evaluate((el) => getComputedStyle(el).fontFamily);
  expect(await family(".corners")).toContain("Inter Tight");
  expect(await family("figure figcaption.label")).toContain("JetBrains Mono");
});

test("MENU opens the index of all seven projects, with posters", async ({
  page,
}) => {
  await page.goto("/work/odovox");
  await corners(page).getByRole("link", { name: "Menu" }).click();
  const menu = page.getByRole("dialog", { name: "Menu" });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("navigation").getByRole("link")).toHaveCount(7);
  await menu.getByRole("link", { name: /Aftermeet/ }).hover();
  await expect(menu.locator(".menu-poster img")).toHaveAttribute(
    "src",
    /poster-aftermeet/,
  );
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
});

test("INQUIRE opens the contact sheet over the page", async ({ page }) => {
  await page.goto("/work/odovox");
  await corners(page).getByRole("link", { name: "Inquire" }).click();
  const sheet = page.getByRole("dialog", { name: "Inquire" });
  await expect(sheet).toBeVisible();
  await expect(sheet).toContainText("harshavardhananrajasimhan@gmail.com");
  await expect(sheet.locator("time")).toHaveText(/^\d\d:\d\d IST$/);
  await expect(page).toHaveURL(/\/work\/odovox$/);
});

test("without JavaScript, INQUIRE and MENU are plain links that work", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/work/odovox");
  await expect(
    corners(page).getByRole("link", { name: "Menu" }),
  ).toHaveAttribute("href", "/#projects");
  await corners(page).getByRole("link", { name: "Inquire" }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.locator("main")).toContainText(
    "harshavardhananrajasimhan@gmail.com",
  );
  await expect(page.locator("main form")).toBeVisible();
  await context.close();
});

test("the résumé and the portrait are served", async ({ request }) => {
  const resume = await request.get("/resume.pdf");
  expect(resume.status()).toBe(200);
  expect(resume.headers()["content-type"]).toContain("application/pdf");
  const portrait = await request.get("/media/portrait.avif");
  expect(portrait.status()).toBe(200);
});
