import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 800 } });

test("About: portrait, draft bio, spec sheet, five skill groups, wins", async ({
  page,
}) => {
  await page.goto("/about");
  const about = page.locator("#about");
  const portrait = about.getByRole("img", { name: /portrait of Harsha/ });
  await portrait.scrollIntoViewIfNeeded();
  await expect(portrait).toBeVisible();
  // The picture loads only when it is near the screen, so wait for it.
  await expect
    .poll(() => portrait.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0);
  await expect(about.getByText("Draft · Harsha to rewrite")).toBeVisible();
  await expect(about).toContainText("Building Odovox");
  await expect(page.locator("body")).not.toContainText(/founder/i);
  await expect(about.locator("dl").nth(1).locator("dt")).toHaveText([
    "Languages",
    "ML & CV",
    "GenAI",
    "Web & Backend",
    "Tools",
  ]);
  await expect(about.locator("dl").first()).toContainText(
    "Makeathon Winner 2025 — VIT Chennai",
  );
  await expect(about.locator("dl").first()).toContainText(
    "ML Certification 2025 — SmartBridge × Google",
  );
});

test("Anomaly hunt: a fixed glitch stays fixed", async ({ page }) => {
  await page.goto("/about");
  await page.getByRole("button", { name: "Anomaly: fix it" }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "Anomaly fixed" })).toHaveCount(
    1,
  );
});

test("Menu: opens, holds focus, closes with Escape, and navigates", async ({
  page,
}) => {
  await page.goto("/work/odovox");
  const open = page.locator(".corners").getByRole("link", { name: "Menu" });
  await open.focus();
  await page.keyboard.press("Enter");
  const menu = page.getByRole("dialog", { name: "Site menu" });
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
  // (Links to projects morph their poster into the film instead; other
  // links between pages get the wipe.)
  await page.goto("/work/kattral");
  await page.locator(".corners").getByRole("link", { name: "About" }).click();
  const wipe = page.locator(".wipe");
  await expect(wipe).toHaveAttribute("data-state", "in");
  await expect(wipe).toHaveAttribute("data-theme", "neutral");
  await expect(wipe).toHaveCSS("background-color", "rgb(244, 242, 238)");
  await expect(page).toHaveURL(/\/about$/);
  await expect(wipe).not.toHaveAttribute("data-state", /.+/, { timeout: 4000 });
});

test("The menu carries the credit and the other pages, large", async ({
  page,
}) => {
  await page.goto("/work/kattral");
  await page.locator(".corners").getByRole("link", { name: "Menu" }).click();
  const menu = page.getByRole("dialog", { name: "Site menu" });
  await expect(menu).toContainText("© 2026 Harsha");
  await expect(menu).not.toContainText("anomalies resolved");
  const pages = menu.getByRole("navigation", { name: "Pages" });
  for (const name of ["Home", "About", "Inquire", "Résumé ↗"]) {
    const link = pages.getByRole("link", { name });
    await expect(link).toBeVisible();
    expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
  // Inside the menu the ordinary cursor shows (the custom dot is under it).
  expect(
    await menu.evaluate((el) => getComputedStyle(el).cursor),
  ).not.toBe("none");
});

test("Sound is off until switched on", async ({ page }) => {
  await page.goto("/");
  const sound = page.getByRole("button", { name: /^sound/ });
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  await sound.click();
  await expect(sound).toHaveAttribute("aria-pressed", "true");
  await expect(sound).toHaveText("sound on");
});

test("Sound on: pages scroll silently, no film is heard, and it is remembered", async ({
  page,
}) => {
  // Count every sound the page makes by wrapping the browser's sound maker.
  await page.addInitScript(() => {
    const w = window as unknown as { ticks: number };
    w.ticks = 0;
    const make = AudioContext.prototype.createBufferSource;
    AudioContext.prototype.createBufferSource = function () {
      w.ticks++;
      return make.call(this);
    };
  });
  await page.goto("/work/road");
  await expect(page.locator(".corners time")).toHaveText(/IST$/);
  const ticks = () =>
    page.evaluate(() => (window as unknown as { ticks: number }).ticks);
  const sound = page.locator(".corners").getByRole("button", { name: /^sound/ });
  await expect(sound).toHaveText("sound off");
  await sound.click();
  await expect(sound).toHaveText("sound on");
  // One tick to say it is on; then scrolling the page makes none (the
  // tick belongs to the home ring, e2e/ring.e2e.ts).
  await expect.poll(ticks).toBe(1);
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(120);
  }
  expect(await ticks()).toBe(1);
  expect(
    await page.evaluate(
      () => [...document.querySelectorAll("video")].filter((v) => !v.muted).length,
    ),
  ).toBe(0);
  // The choice is remembered.
  await page.reload();
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
    await page.goto("/work/kattral");
    await page.locator(".corners").getByRole("link", { name: "Menu" }).click();
    await page
      .getByRole("dialog", { name: "Site menu" })
      .getByRole("link", { name: /Automated Road/ })
      .click();
    await expect(page).toHaveURL(/\/work\/road$/);
    await expect(page.locator(".wipe")).not.toHaveAttribute("data-state", /.+/);
  });
});

test.describe("about on a laptop screen", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("fits one screen: portrait, bio, credits and skills", async ({
    page,
  }) => {
    await page.goto("/about");
    await page.evaluate(() => document.fonts.ready);
    for (const term of ["Based in", "Studying", "Now", "Previously", "Awards"]) {
      await expect(
        page.locator("#about dt", { hasText: new RegExp(`^${term}$`) }),
      ).toBeInViewport();
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollHeight),
    ).toBeLessThanOrEqual(900);
  });
});
