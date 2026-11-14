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

test("the home page's case-study link opens the page", async ({ page }) => {
  await page.goto("/");
  await page
    .locator("section#road")
    .getByRole("link", { name: "Open case study" })
    .click();
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
  await expect(page.locator(".case-media img")).toBeVisible();
  await context.close();
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the hero shows the still, not the video", async ({ page }) => {
    await page.goto("/work/odovox");
    await expect(page.locator(".corners time")).toHaveText(/^\d\d:\d\d IST$/);
    await expect(page.locator(".case-media video")).toHaveCount(0);
    await expect(page.locator(".case-media img")).toBeVisible();
  });
});
