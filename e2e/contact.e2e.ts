import { expect, test } from "@playwright/test";

// The contact sheet, as the /contact page. (INQUIRE opens the same sheet in a
// dialog; e2e/frame.e2e.ts checks that.)

test("the form hands a written message to the mail app", async ({ page }) => {
  // Do not really open the mail app on the machine running the tests.
  await page.addInitScript(() => {
    window.open = () => null;
  });
  await page.goto("/contact");
  const form = page.locator("main form");
  await form.getByLabel("Name").fill("Asha Recruiter");
  await form.getByLabel("Email").fill("asha@example.com");
  await form.getByLabel("Message").fill("We have a hard problem.");
  await form.getByRole("button", { name: "Send" }).click();
  await expect(form.getByRole("status")).toContainText(
    "message handed to your mail app",
  );
  const mailto = decodeURIComponent((await form.getAttribute("data-mailto"))!);
  expect(mailto).toContain("mailto:harshavardhananrajasimhan@gmail.com");
  expect(mailto).toContain("Asha Recruiter");
  expect(mailto).toContain("We have a hard problem.");
  expect(mailto).toContain("asha@example.com");
});

test("empty fields are refused, and no phone number appears", async ({
  page,
}) => {
  await page.goto("/contact");
  const form = page.locator("main form");
  await form.getByRole("button", { name: "Send" }).click();
  await expect(form.getByRole("status")).toBeEmpty();
  expect(await page.locator("body").innerText()).not.toMatch(
    /\+?91[\s-]?\d{5}/,
  );
  await expect(
    page.locator("main").getByRole("link", { name: "Résumé" }),
  ).toHaveAttribute("href", "/resume.pdf");
});

test("without JavaScript the form is a plain mailto form", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/contact");
  await expect(page.locator("main form")).toHaveAttribute(
    "action",
    "mailto:harshavardhananrajasimhan@gmail.com",
  );
  await context.close();
});

test.describe("email copy", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("clicking the big email address copies it", async ({ page }) => {
    await page.goto("/contact");
    const sheet = page.locator("main");
    await sheet
      .getByRole("link", { name: "harshavardhananrajasimhan@gmail.com" })
      .click();
    await expect(sheet.getByRole("status").first()).toHaveText("copied ✓");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      "harshavardhananrajasimhan@gmail.com",
    );
  });
});
