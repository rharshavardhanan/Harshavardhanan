import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 800 } });

test("About: portrait, draft bio, spec sheet, five skill groups, wins", async ({
  page,
}) => {
  await page.goto("/");
  const about = page.locator("#about");
  const portrait = about.getByRole("img", { name: /portrait of Harsha/ });
  await portrait.scrollIntoViewIfNeeded();
  await expect(portrait).toBeVisible();
  // The picture loads only when it is near the screen, so wait for it.
  await expect
    .poll(() => portrait.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0);
  await expect(about.getByText("Draft · Harsha to rewrite")).toBeVisible();
  await expect(about).toContainText("Founder, Odovox");
  await expect(about.locator("dl").nth(1).locator("dt")).toHaveText([
    "Languages",
    "ML & CV",
    "GenAI",
    "Web & Backend",
    "Tools",
  ]);
  await expect(about.locator(".marquee ul").first()).toContainText(
    "Makeathon Winner 2025 — VIT Chennai",
  );
  await expect(about.locator(".marquee ul").first()).toContainText(
    "ML Certification 2025 — SmartBridge × Google",
  );
});

test("Anomaly hunt: fixing one is counted and remembered", async ({ page }) => {
  await page.goto("/");
  const anomalies = page.getByRole("button", { name: "Anomaly: fix it" });
  await expect(anomalies).toHaveCount(8);
  await page
    .locator("section#road")
    .getByRole("button", { name: "Anomaly: fix it" })
    .click();
  // The count is in the menu (closed, so found by its label, not its role).
  const count = page.locator('dialog[aria-label="Menu"]');
  await expect(count).toContainText("anomalies resolved 1 / 8");
  await page.reload();
  await expect(count).toContainText("anomalies resolved 1 / 8");
  await expect(page.getByRole("button", { name: "Anomaly fixed" })).toHaveCount(
    1,
  );
});

test("Menu: opens, holds focus, closes with Escape, and navigates", async ({
  page,
}) => {
  await page.goto("/");
  const open = page.locator(".corners").getByRole("link", { name: "Menu" });
  await open.focus();
  await page.keyboard.press("Enter");
  const menu = page.getByRole("dialog", { name: "Menu" });
  await expect(menu).toBeVisible();
  expect(
    await page.evaluate(() => !!document.activeElement?.closest("dialog")),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(open).toBeFocused();

  await open.click();
  await menu.getByRole("link", { name: /Edge Cache RL/ }).click();
  await expect(page).toHaveURL(/\/work\/cache$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Edge Cache RL",
  );
});

test("Page wipe: a sheet in the next page's colour covers the change", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .locator("section#odovox")
    .getByRole("link", { name: "Open case study" })
    .click();
  const wipe = page.locator(".wipe");
  await expect(wipe).toHaveAttribute("data-state", "in");
  await expect(wipe).toHaveAttribute("data-theme", "odovox");
  await expect(wipe).toHaveCSS("background-color", "rgb(15, 31, 28)");
  await expect(page).toHaveURL(/\/work\/odovox$/);
  await expect(wipe).not.toHaveAttribute("data-state", /.+/, { timeout: 4000 });
});

test("The menu carries the credit and the anomaly count", async ({
  page,
}) => {
  await page.goto("/work/kattral");
  await page.locator(".corners").getByRole("link", { name: "Menu" }).click();
  const menu = page.getByRole("dialog", { name: "Menu" });
  await expect(menu).toContainText("© 2026 · designed & built by Harsha");
  await expect(menu).toContainText("anomalies resolved 0 / 8");
});

test("Sound is off until switched on", async ({ page }) => {
  await page.goto("/");
  const sound = page.getByRole("button", { name: /^sound/ });
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  await sound.click();
  await expect(sound).toHaveAttribute("aria-pressed", "true");
  await expect(sound).toHaveText("sound on");
});

test("404: the page says so in the site's voice and offers a way home", async ({
  page,
}) => {
  const response = await page.goto("/no-such-page");
  expect(response!.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("404");
  await expect(page.locator("main")).toContainText(
    "This page is out of distribution.",
  );
  await expect(
    page.getByRole("link", { name: "Back to the start" }),
  ).toHaveAttribute("href", "/");
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("pages change without a wipe", async ({ page }) => {
    await page.goto("/");
    await page
      .locator("section#road")
      .getByRole("link", { name: "Open case study" })
      .click();
    await expect(page).toHaveURL(/\/work\/road$/);
    await expect(page.locator(".wipe")).not.toHaveAttribute("data-state", /.+/);
  });
});
