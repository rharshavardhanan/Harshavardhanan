import { expect, type Locator, type Page, test } from "@playwright/test";

// The frame changes colour with what is under it, so their real colour depends on what
// is behind them. This test measures the pixels actually drawn: inside each
// element, the contrast between its darkest and lightest pixel must be at
// least 4.5:1 (the text against its background).
async function renderedContrast(page: Page, target: Locator) {
  const png = await target.screenshot({ animations: "disabled" });
  return page.evaluate(async (data) => {
    const img = new Image();
    img.src = `data:image/png;base64,${data}`;
    await img.decode();
    const canvas = new OffscreenCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const pixels = ctx.getImageData(0, 0, img.width, img.height).data;
    const lum = (r: number, g: number, b: number) =>
      [r, g, b]
        .map((c) => c / 255)
        .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
        .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
    let lo = 1;
    let hi = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      const l = lum(pixels[i], pixels[i + 1], pixels[i + 2]);
      lo = Math.min(lo, l);
      hi = Math.max(hi, l);
    }
    return (hi + 0.05) / (lo + 0.05);
  }, png.toString("base64"));
}

test.use({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });

test("the frame is readable on paper", async ({ page }) => {
  await page.goto("/about");
  await page.evaluate(() => document.fonts.ready);
  for (const target of [
    page.locator(".corners").getByRole("link", { name: "Harshavardhanan" }),
    page.locator(".corners").getByRole("link", { name: "Menu" }),
  ]) {
    expect(await renderedContrast(page, target)).toBeGreaterThanOrEqual(4.5);
  }
});

test("the frame stays readable on the home page's dark colours", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  for (const target of [
    page.locator(".corners").getByRole("link", { name: "Harshavardhanan" }),
    page.locator(".corners").getByRole("link", { name: "Menu" }),
  ]) {
    expect(await renderedContrast(page, target)).toBeGreaterThanOrEqual(4.5);
  }
});

test("the menu is readable", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator(".corners").getByRole("link", { name: "Menu" }).click();
  const menu = page.getByRole("dialog", { name: "Menu" });
  await expect(menu).toBeVisible();
  for (const name of ["Close"]) {
    expect(
      await renderedContrast(page, menu.getByRole("button", { name })),
    ).toBeGreaterThanOrEqual(4.5);
  }
  expect(
    await renderedContrast(page, menu.getByRole("link", { name: "About" })),
  ).toBeGreaterThanOrEqual(4.5);
});

test("no page throws while loading", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const path of ["/", "/work/odovox", "/no-such-page"]) {
    await page.goto(path);
    await page.waitForLoadState("load");
  }
  expect(errors).toEqual([]);
});

test("the frame is readable on every case study, light or dark", async ({
  page,
}) => {
  for (const slug of [
    "odovox",
    "scp",
    "aftermeet",
    "road",
    "kattral",
    "cache",
    "hallucination",
  ]) {
    await page.goto(`/work/${slug}`);
    await page.evaluate(() => document.fonts.ready);
    expect(
      await renderedContrast(
        page,
        page.locator(".corners").getByRole("link", { name: "Harshavardhanan" }),
      ),
      slug,
    ).toBeGreaterThanOrEqual(4.5);
  }
});
