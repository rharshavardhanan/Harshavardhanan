import { expect, test } from "@playwright/test";

test("the header shows the time in Chennai", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("header time")).toHaveText(/^\d\d:\d\d IST$/);
});

test("every header link leads somewhere that exists", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Primary" });
  for (const name of ["Work", "About", "Contact"]) {
    const href = await nav.getByRole("link", { name }).getAttribute("href");
    await expect(page.locator(href!)).toHaveCount(1);
  }
  await expect(nav.getByRole("link", { name: "Résumé" })).toHaveAttribute(
    "href",
    "/resume.pdf",
  );
});

test("without JavaScript the header still reads sensibly", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("header")).toContainText("H.R. · Chennai");
  await expect(page.locator("h1")).toHaveText("Harshavardhanan");
  await context.close();
});
