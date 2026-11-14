import { expect, test } from "@playwright/test";

const meta = (page: import("@playwright/test").Page, selector: string) =>
  page.locator(`head ${selector}`).first().getAttribute("content");

test("the home page describes itself to search engines and link previews", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveTitle(
    "Harshavardhanan — Software engineer & founder",
  );
  expect(await meta(page, 'meta[name="description"]')).toContain("Odovox");
  expect(await meta(page, 'meta[property="og:title"]')).toContain(
    "Harshavardhanan",
  );
  expect(await meta(page, 'meta[property="og:image"]')).toMatch(
    /^https?:\/\/.+\/media\/og\.png$/,
  );
  expect(await meta(page, 'meta[name="twitter:card"]')).toBe(
    "summary_large_image",
  );
  await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
    "href",
    /^https?:\/\//,
  );
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("a Person record is published and names Harsha", async ({ page }) => {
  await page.goto("/");
  const json = await page
    .locator('script[type="application/ld+json"]')
    .first()
    .textContent();
  const person = JSON.parse(json!);
  expect(person["@type"]).toBe("Person");
  expect(person.name).toBe("Harshavardhanan Rajasimhan");
  expect(person.sameAs).toContain("https://github.com/rharshavardhanan");
  expect(JSON.stringify(person)).not.toMatch(/telephone/);
});

test("each case study has its own title, description and address", async ({
  page,
}) => {
  await page.goto("/work/hallucination");
  await expect(page).toHaveTitle(
    "Hallucination Detection in LLMs — Harshavardhanan",
  );
  expect(await meta(page, 'meta[name="description"]')).toContain(
    "Catching AI answers",
  );
  await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/work\/hallucination$/,
  );
});

test("sitemap, robots, preview image and icons are served", async ({
  request,
}) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap.match(/<loc>/g)).toHaveLength(7);
  expect(sitemap).toContain("/work/odovox");
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toMatch(/Sitemap: https?:\/\/.+\/sitemap\.xml/);
  for (const [path, type] of [
    ["/media/og.png", "image/png"],
    ["/icon.svg", "image/svg"],
    ["/apple-icon.png", "image/png"],
    ["/favicon.ico", "image/"],
  ]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    expect(response.headers()["content-type"], path).toContain(type);
  }
});
