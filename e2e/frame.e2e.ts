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

// The project in front, named at the bottom centre in Space Mono capitals
// (Harsha chose it: technical, legible); on a phone a long name wraps to two
// centred lines rather than being cut short.
for (const [width, height] of [
  [1280, 800],
  [360, 740],
]) {
  test(`the project's name is at the bottom centre, in Space Mono (${width}px)`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/work/scp");
    await page.evaluate(() => document.fonts.ready);
    const name = corners(page).locator(".corner-project");
    await expect(name).toContainText("Sequential Conformal Prediction");
    const got = await name.evaluate((el) => {
      const s = getComputedStyle(el);
      const text = el.querySelector<HTMLElement>(".decode-text")!;
      const range = document.createRange();
      range.selectNodeContents(text);
      const r = range.getBoundingClientRect();
      const box = el.querySelector<HTMLElement>(".decode")!;
      return {
        font: s.fontFamily,
        transform: s.textTransform,
        size: parseFloat(s.fontSize),
        lineHeight: parseFloat(s.lineHeight),
        middle: r.left + r.width / 2,
        height: r.height,
        cut: box.scrollWidth > box.clientWidth + 1,
      };
    });
    expect(got.font).toContain("Space Mono");
    expect(got.transform).toBe("uppercase");
    expect(got.size).toBeGreaterThanOrEqual(width < 640 ? 15 : 20);
    expect(Math.abs(got.middle - width / 2)).toBeLessThan(3);
    // All of it shows: never cut short, and at most two lines.
    expect(got.cut).toBe(false);
    // (Two lines measure a touch over 2 × the line height, as glyphs
    // overhang their lines; three would be 3 ×.)
    expect(got.height).toBeLessThan(got.lineHeight * 2.5);
  });
}

test("on a project page the bottom name steps aside while the big title is on screen", async ({
  page,
}) => {
  // A short laptop screen: Sequential Conformal Prediction's credits reach
  // the bottom row, and the big title already names the project.
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/work/scp");
  const name = corners(page).locator(".corner-project");
  await expect(name).toHaveCSS("opacity", "0");
  // Scrolled past the title block, it comes back as a reminder.
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.6));
  await expect(name).toHaveCSS("opacity", "1");
  // After opening the next page, it follows that page's title, not the old
  // (hidden) one's.
  await page.goto("/");
  await expect(page.locator(".ring")).toHaveAttribute("data-state", "on", {
    timeout: 15000,
  });
  await expect(name).toHaveCSS("opacity", "1");
});

// On a small phone, every project's title block (title, credits, the scroll
// cue) ends above the frame's bottom row on the first screen.
for (const slug of [
  "odovox",
  "aftermeet",
  "scp",
  "road",
  "kattral",
  "cache",
  "hallucination",
]) {
  test(`on a small phone, ${slug}'s title block clears the frame's bottom row`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(`/work/${slug}`);
    await page.evaluate(() => document.fonts.ready);
    const gap = await page.evaluate(() => {
      const cue = [...document.querySelectorAll(".poster-title p")].find((p) =>
        /scroll/i.test(p.textContent ?? ""),
      )!;
      const row = document.querySelector(".corner-bottom")!;
      return (
        row.getBoundingClientRect().top - cue.getBoundingClientRect().bottom
      );
    });
    expect(gap).toBeGreaterThan(0);
  });
}

test("About is one click away: in the corner on wide screens, large in the menu", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/work/cache");
  const about = page.locator(".corners").getByRole("link", { name: "About" });
  await expect(about).toBeVisible();
  await about.click();
  await expect(page).toHaveURL(/\/about$/);

  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/work/cache");
  await expect(
    page.locator(".corners").getByRole("link", { name: "About" }),
  ).toBeHidden();
  await page.locator(".corners").getByRole("link", { name: "Menu" }).click();
  const inMenu = page
    .getByRole("dialog", { name: "Site menu" })
    .getByRole("link", { name: "About" });
  await expect(inMenu).toBeVisible();
  expect((await inMenu.boundingBox())!.height).toBeGreaterThanOrEqual(32);
});

test("GitHub and LinkedIn are easy to find: in the frame on wide screens, and in the menu", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/work/cache");
  const frame = corners(page);
  await expect(frame.getByRole("link", { name: /GitHub/ })).toHaveAttribute(
    "href",
    "https://github.com/rharshavardhanan",
  );
  await expect(frame.getByRole("link", { name: /LinkedIn/ })).toBeVisible();
  await page.setViewportSize({ width: 360, height: 740 });
  await frame.getByRole("link", { name: "Menu" }).click();
  const pages = page
    .getByRole("dialog", { name: "Site menu" })
    .getByRole("navigation", { name: "Pages" });
  await expect(pages.getByRole("link", { name: /GitHub/ })).toBeVisible();
  await expect(pages.getByRole("link", { name: /LinkedIn/ })).toBeVisible();
});

test("the pointer stays visible between the menu's links", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/work/cache");
  await page.mouse.move(640, 400); // wakes the custom cursor
  await corners(page).getByRole("link", { name: "Menu" }).click();
  const pages = page
    .getByRole("dialog", { name: "Site menu" })
    .getByRole("navigation", { name: "Pages" });
  await expect(pages).toBeVisible();
  // Halfway between Home and About: what is under the pointer there?
  const under = await pages.evaluate((nav) => {
    const [a, b] = [...nav.querySelectorAll("a")].map((link) =>
      link.getBoundingClientRect(),
    );
    const el = document.elementFromPoint(
      (a.right + b.left) / 2,
      (a.top + a.bottom) / 2,
    )!;
    return {
      inMenu: !!el.closest("dialog[open]"),
      cursor: getComputedStyle(el).cursor,
    };
  });
  expect(under.inMenu).toBe(true);
  expect(under.cursor).not.toBe("none");
});

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
  const menu = page.getByRole("dialog", { name: "Site menu" });
  await expect(menu).toBeVisible();
  const projects = menu
    .getByRole("navigation", { name: "Projects" })
    .getByRole("link");
  await expect(projects).toHaveCount(7);
  // You are on Odovox: it is marked, and the preview starts on it.
  await expect(projects.first()).toHaveAttribute("aria-current", "page");
  await expect(projects.first()).toContainText("you’re here");
  // (The frame's own row hides while the menu covers it, so find MENU by its
  // address rather than its role.)
  await expect(
    corners(page).locator('a[href="/#projects"][aria-haspopup]'),
  ).toHaveAttribute("aria-expanded", "true");
  // Focus starts on the first project; the arrow keys move down the list.
  await expect(projects.first()).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(projects.nth(1)).toBeFocused();
  // Pointing at a project shows its poster in the preview.
  await projects.nth(3).hover();
  await expect(menu.locator('.menu-poster[data-on="true"]')).toHaveAttribute(
    "src",
    /poster-road/,
  );
  // One project per line: each row starts below the one before it.
  const rows = await projects.evaluateAll((links) =>
    links.map((link) => {
      const box = link.getBoundingClientRect();
      return [box.top, box.bottom];
    }),
  );
  for (let i = 1; i < rows.length; i++) {
    expect(rows[i][0]).toBeGreaterThanOrEqual(rows[i - 1][1] - 1);
  }
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(corners(page).getByRole("link", { name: "Menu" })).toBeFocused();
});

test("choosing a project in the menu opens it at the top", async ({ page }) => {
  await page.goto("/work/odovox");
  await corners(page).getByRole("link", { name: "Menu" }).click();
  await page
    .getByRole("dialog", { name: "Site menu" })
    .getByRole("link", { name: /Edge Cache RL/ })
    .click();
  await expect(page).toHaveURL(/\/work\/cache$/);
  await expect(page.getByRole("dialog", { name: "Site menu" })).toBeHidden();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Edge Cache RL",
  );
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
