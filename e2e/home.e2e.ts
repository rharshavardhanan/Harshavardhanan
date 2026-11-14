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

test("Contact: the form hands a written message to the mail app", async ({
  page,
}) => {
  // Do not really open the mail app on the machine running the tests.
  await page.addInitScript(() => {
    window.open = () => null;
  });
  await page.goto("/");
  const form = page.locator("#contact form");
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

test("Contact: empty fields are refused, and no phone number appears", async ({
  page,
}) => {
  await page.goto("/");
  const form = page.locator("#contact form");
  await form.getByRole("button", { name: "Send" }).click();
  await expect(form.getByRole("status")).toBeEmpty();
  expect(await page.locator("body").innerText()).not.toMatch(
    /\+?91[\s-]?\d{5}/,
  );
  await expect(
    page.locator("#contact").getByRole("link", { name: "Résumé" }),
  ).toHaveAttribute("href", "/resume.pdf");
});

test("Footer: closing line, credit and anomaly count on every page", async ({
  page,
}) => {
  for (const path of ["/", "/work/kattral"]) {
    await page.goto(path);
    const footer = page.getByRole("contentinfo");
    await expect(footer.locator(".lets-build")).toHaveText("Let’s build");
    await expect(footer).toContainText("© 2026 · designed & built by Harsha");
    await expect(footer).toContainText("anomalies resolved 0 / 8");
  }
});

test("Anomaly hunt: fixing one is counted and remembered", async ({ page }) => {
  await page.goto("/");
  const anomalies = page.getByRole("button", { name: "Anomaly: fix it" });
  await expect(anomalies).toHaveCount(8);
  await page
    .locator("section#road")
    .getByRole("button", { name: "Anomaly: fix it" })
    .click();
  await expect(page.getByRole("contentinfo")).toContainText(
    "anomalies resolved 1 / 8",
  );
  await page.reload();
  await expect(page.getByRole("contentinfo")).toContainText(
    "anomalies resolved 1 / 8",
  );
  await expect(page.getByRole("button", { name: "Anomaly fixed" })).toHaveCount(
    1,
  );
});

test("Menu: opens, holds focus, closes with Escape, and navigates", async ({
  page,
}) => {
  await page.goto("/");
  const open = page.getByRole("button", { name: "Menu" });
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
  await menu.getByRole("link", { name: "Edge Cache RL" }).click();
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

test.describe("phone", () => {
  test.use({
    viewport: { width: 360, height: 740 },
    hasTouch: true,
    isMobile: true,
  });

  test("the header is one line with a Menu button, and nothing overflows", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Menu" })).toBeVisible();
    await expect(
      page
        .getByRole("navigation", { name: "Primary" })
        .getByRole("link", { name: "About" }),
    ).toBeHidden();
    expect(
      (await page.locator("header").first().boundingBox())!.height,
    ).toBeLessThan(64);
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("without JavaScript the contact form is a plain mailto form", async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("#contact form")).toHaveAttribute(
      "action",
      "mailto:harshavardhananrajasimhan@gmail.com",
    );
    await expect(page.locator("#about img")).toHaveCount(1);
    await context.close();
  });
});

test.describe("email copy", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("clicking the big email address copies it", async ({ page }) => {
    await page.goto("/");
    const contact = page.locator("#contact");
    await contact
      .getByRole("link", { name: "harshavardhananrajasimhan@gmail.com" })
      .click();
    await expect(contact.getByRole("status").first()).toHaveText("copied ✓");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      "harshavardhananrajasimhan@gmail.com",
    );
  });
});
