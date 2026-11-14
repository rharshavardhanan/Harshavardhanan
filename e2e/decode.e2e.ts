import { expect, type Page, test } from "@playwright/test";

// The text decode (lib/scramble.ts): random characters settling, left to
// right, into the real text.

type Sample = { on: boolean; noise: string; text: string; width: number };

/** Records a `.decode` box on every animation frame for `ms` milliseconds:
 *  whether it is decoding, what the noise shows, the real text, its width. */
function record(page: Page, selector: string, ms: number) {
  return page.evaluate(
    ([selector, ms]) =>
      new Promise<Sample[]>((resolve) => {
        const samples: Sample[] = [];
        const end = performance.now() + Number(ms);
        const step = () => {
          const box = document.querySelector<HTMLElement>(String(selector));
          if (box) {
            samples.push({
              on: box.hasAttribute("data-decoding"),
              noise: box.querySelector(".decode-noise")?.textContent ?? "",
              text: box.querySelector(".decode-text")?.textContent ?? "",
              width: box.getBoundingClientRect().width,
            });
          }
          if (performance.now() < end) requestAnimationFrame(step);
          else resolve(samples);
        };
        step();
      }),
    [selector, ms] as const,
  );
}

/** The decode played: noise was seen that was not the real text, and it
 *  ended on the real text with the noise emptied. */
function expectDecoded(samples: Sample[], final: string) {
  const during = samples.filter((s) => s.on && s.noise.trim() !== "");
  expect(during.length).toBeGreaterThan(3);
  expect(during.some((s) => s.noise !== final)).toBe(true);
  // The box never changes size while it decodes.
  const widths = new Set(during.map((s) => Math.round(s.width)));
  expect(widths.size).toBe(1);
  const last = samples.at(-1)!;
  expect(last).toMatchObject({ on: false, noise: "", text: final });
  expect(Math.round(last.width)).toBe([...widths][0]);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("loaded", "1"));
});

test("the frame decodes the project as the ring turns", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".ring")).toHaveAttribute("data-state", "on", {
    timeout: 15000,
  });
  const name = ".corner-bottom p:first-child .decode";
  await expect(page.locator(name)).not.toHaveAttribute("data-decoding");
  // The noise is hidden from screen readers; the real text is what they read.
  await expect(page.locator(`${name} .decode-noise`)).toHaveAttribute(
    "aria-hidden",
    "true",
  );
  const samples = record(page, name, 1600);
  await page.keyboard.press("ArrowRight");
  expectDecoded(await samples, "Aftermeet");
  await expect(page.locator(".corner-bottom")).toContainText("02 / 07");
});

test("the menu's names decode as it opens", async ({ page }) => {
  await page.goto("/about");
  const first = ".menu-row .menu-name .decode";
  const samples = record(page, first, 1600);
  await page.locator('a[href="/#projects"][aria-haspopup]').click();
  expectDecoded(await samples, "Odovox");
  await expect(
    page
      .getByRole("dialog", { name: "Site menu" })
      .getByRole("link", { name: /Edge Cache RL/ }),
  ).toBeVisible();
});

test("a project page's credits and section labels decode once, in view", async ({
  page,
}) => {
  // Record the first credit from the moment the page starts.
  await page.addInitScript(() => {
    const w = window as unknown as { credit: Sample[]; creditDone: boolean };
    w.credit = [];
    const end = performance.now() + 3000;
    const step = () => {
      const box = document.querySelector<HTMLElement>(".credits dd .decode");
      if (box) {
        w.credit.push({
          on: box.hasAttribute("data-decoding"),
          noise: box.querySelector(".decode-noise")?.textContent ?? "",
          text: box.querySelector(".decode-text")?.textContent ?? "",
          width: box.getBoundingClientRect().width,
        });
      }
      if (performance.now() < end) requestAnimationFrame(step);
      else w.creditDone = true;
    };
    requestAnimationFrame(step);
  });
  await page.goto("/work/odovox");
  await page.waitForFunction(
    () => (window as unknown as { creditDone: boolean }).creditDone,
  );
  const credit = await page.evaluate(
    () => (window as unknown as { credit: Sample[] }).credit,
  );
  expectDecoded(credit, credit.at(-1)!.text);

  // A section label further down waits until it is scrolled to.
  const label = page.locator("section[aria-labelledby] > h3").first();
  const box = "section[aria-labelledby] > h3 .decode";
  await expect(page.locator(box).first()).not.toHaveAttribute("data-decoding");
  const final = await label.textContent();
  const samples = record(page, box, 1600);
  await label.scrollIntoViewIfNeeded();
  expectDecoded(await samples, final!);
  // Once only: back up and down again, and it stays put.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  const again = record(page, box, 1200);
  await label.scrollIntoViewIfNeeded();
  expect((await again).every((s) => !s.on)).toBe(true);
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("no decode: the text is simply there", async ({ page }) => {
    await page.goto("/work/odovox");
    const samples = await record(
      page,
      ".corner-bottom p:first-child .decode",
      1200,
    );
    expect(samples.length).toBeGreaterThan(0);
    expect(samples.every((s) => !s.on && s.noise === "")).toBe(true);
    await expect(page.locator(".corner-bottom")).toContainText("Odovox");
    await expect(page.locator("[data-decoding]")).toHaveCount(0);
  });
});
