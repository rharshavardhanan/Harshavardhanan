import { expect, test } from "@playwright/test";
import { projects } from "../content/projects";

const backgrounds: Record<string, string> = {
  odovox: "rgb(15, 31, 28)",
  scp: "rgb(16, 23, 27)",
  aftermeet: "rgb(244, 233, 219)",
  road: "rgb(18, 18, 18)",
  kattral: "rgb(28, 20, 16)",
  cache: "rgb(11, 16, 32)",
  hallucination: "rgb(22, 17, 31)",
};

for (const [index, item] of projects.entries()) {
  test(`${item.slug}: the case study has every part, in its own colours`, async ({
    page,
  }) => {
    const response = await page.goto(`/work/${item.slug}`);
    expect(response!.status()).toBe(200);
    await expect(page).toHaveTitle(`${item.title} — Harshavardhanan`);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(item.title);

    await expect(page.locator("html")).toHaveAttribute("data-theme", item.slug);
    await expect
      .poll(() =>
        page.evaluate(
          () => getComputedStyle(document.documentElement).backgroundColor,
        ),
      )
      .toBe(backgrounds[item.slug]);

    for (const id of [
      "problem",
      "built",
      "result",
      "architecture",
      "hard",
      "demo",
    ]) {
      await expect(
        page.locator(`section[aria-labelledby="${id}"]`),
      ).toHaveCount(1);
    }
    await expect(page.locator(".flow li")).toHaveCount(item.flow.length);
    await expect(
      page.locator("section[aria-labelledby=demo] figure"),
    ).toHaveCount(1);
    await expect(page.getByText("Draft · Harsha to confirm")).toHaveCount(
      item.draft ? 1 : 0,
    );

    const next = projects[(index + 1) % projects.length];
    await expect(
      page.getByRole("link", {
        name: new RegExp(`Next project.*${next.title}`),
      }),
    ).toHaveAttribute("href", `/work/${next.slug}`);
  });
}

test("the home page's link to a project opens its page", async ({ page }) => {
  await page.goto("/");
  // The list of links under the ring is the keyboard's way in.
  await page.locator('#projects a[href="/work/road"]').focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/work\/road$/);
  // (The page you came from can stay in the document, hidden, so ask for
  // the heading a visitor can actually see.)
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Automated Road Damage Survey",
  );
});

test("an unknown project is a 404", async ({ request }) => {
  expect((await request.get("/work/nothing-here")).status()).toBe(404);
});

test("without JavaScript the page is still themed and readable", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/work/cache");
  await expect(page.locator("article")).toHaveCSS(
    "background-color",
    backgrounds.cache,
  );
  await expect(page.locator("h1")).toHaveText("Edge Cache RL");
  await expect(page.locator("[data-film] img")).toBeVisible();
  await context.close();
});

test("each page opens like a film poster: title, credits, quote, laurels", async ({
  page,
}) => {
  await page.goto("/work/scp");
  const credits = page.locator("article header dl.credits dt");
  await expect(credits).toContainText(["Role", "Team", "Built with", "Year"]);
  await expect(page.locator("[data-words]")).toHaveText(
    "Know when to hand over.",
  );
  await expect(page.locator(".laurel")).toHaveCount(3);
  await expect(page.locator(".laurel").first()).toContainText("7.1");
});

// (A project without a film would show its particle recording;
// lib/media.test.ts covers that. Today all seven have films.)
// No caption on the films (Harsha, 2026-11-14: the Gemini mark in each
// film's corner shows it); the credits say it instead.
test("AI films are credited, not captioned", async ({ page }) => {
  for (const [slug, file] of [
    ["odovox", "mood-odovox"],
    ["hallucination", "mood-halluc"],
  ]) {
    await page.goto(`/work/${slug}`);
    await expect(page.locator("[data-film]")).toHaveCount(1);
    await expect(page.locator("[data-film] video")).toHaveAttribute(
      "src",
      new RegExp(file),
    );
    await expect(page.locator("[data-film]")).not.toContainText("AI-generated");
    await expect(page.locator(".credits")).toContainText(
      "AI-generated, Flow (Veo)",
    );
    // Screen readers still hear what the film is.
    await expect(page.locator("[data-film] video")).toHaveAttribute(
      "aria-label",
      /AI-generated/,
    );
  }
  await page.goto("/");
  await expect(page.locator(".ring, #projects").first()).not.toContainText(
    "AI-generated",
  );
});

test("scrolling to the end grows the next project and opens it", async ({
  page,
}) => {
  await page.goto("/work/odovox");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "odovox");
  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  );
  await expect(page).toHaveURL(/\/work\/aftermeet$/, { timeout: 8000 });
  // (The page left behind stays in the document, hidden, for the Back
  // button, so ask for the heading a visitor can see.)
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Aftermeet");
  // And it starts at the top, not at the old page's height (smooth scrolling
  // keeps its own record of the position; it is reset on every page change).
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => window.scrollY)).toBeLessThan(50);
});

test("the menu and Back both land at the top of the page", async ({ page }) => {
  await page.goto("/work/odovox");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "ready");
  await page.evaluate(() => window.scrollTo(0, 3000));
  await page.waitForTimeout(600);
  await page.locator(".corners").getByRole("link", { name: "Menu" }).click();
  await page
    .getByRole("dialog", { name: "Site menu" })
    .getByRole("link", { name: /Edge Cache RL/ })
    .click();
  await expect(page).toHaveURL(/\/work\/cache$/);
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => window.scrollY)).toBeLessThan(50);

  await page.evaluate(() => window.scrollTo(0, 2500));
  await page.waitForTimeout(600);
  await page.goBack();
  await expect(page).toHaveURL(/\/work\/odovox$/);
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => window.scrollY)).toBeLessThan(50);
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the end of a page never opens the next one by itself", async ({
    page,
  }) => {
    await page.goto("/work/odovox");
    await expect(page.locator(".corners time")).toHaveText(/IST$/);
    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight),
    );
    await page.waitForTimeout(1200);
    await expect(page).toHaveURL(/\/work\/odovox$/);
  });
});
