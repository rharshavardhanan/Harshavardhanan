import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 800 } });

test("the same-start recordings play together in the browser", async ({
  page,
}) => {
  await page.goto("/work/scp");
  const chapter = page.locator("article");
  const clips = chapter.locator("ul video");
  await expect(clips).toHaveCount(3);
  await clips.first().scrollIntoViewIfNeeded();
  // They start on their own once in view...
  await expect
    .poll(() =>
      clips.evaluateAll((videos) =>
        (videos as HTMLVideoElement[]).every(
          (v) => !v.paused && v.currentTime > 0,
        ),
      ),
    )
    .toBe(true);
  // ...and one button pauses all of them.
  await chapter.getByRole("button", { name: "Pause" }).click();
  expect(
    await clips.evaluateAll((videos) =>
      (videos as HTMLVideoElement[]).every((v) => v.paused),
    ),
  ).toBe(true);
  await expect(chapter.getByRole("button", { name: "Play" })).toBeVisible();
});

test("the monitor recordings have the browser's own controls and load", async ({
  request,
  page,
}) => {
  await page.goto("/work/scp");
  const watch = page.locator("article video[controls]");
  await expect(watch).toHaveCount(2);
  for (const path of [
    "/media/real/scp-cheap.mp4",
    "/media/real/scp-arbitrated.mp4",
    "/media/real/scp-expert.mp4",
    "/media/real/scp-monitor-fail.mp4",
    "/media/real/scp-monitor-safe.mp4",
    "/media/real/scp-arena.mp4",
    "/media/case-scp.mp4",
    "/media/cover-scp.avif",
  ]) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
});

test("the demo flips its verdict between same α and same false-alarm rate", async ({
  page,
}) => {
  await page.goto("/work/scp");
  const demo = page.locator("article figure");
  await expect(demo.getByRole("status")).toContainText("8.4 points worse");
  await demo.getByRole("radio", { name: "Same α" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(demo.getByRole("status")).toContainText("7.1 points better");
  await expect(demo.getByRole("img")).toHaveAttribute(
    "aria-label",
    /0\.15: \+7\.1 points/,
  );
});

test("the team and the code are credited", async ({ page }) => {
  await page.goto("/work/scp");
  const chapter = page.locator("article");
  await expect(chapter).toContainText("Akileshguhan A");
  await expect(
    chapter.getByRole("link", { name: "Code on GitHub" }),
  ).toHaveAttribute(
    "href",
    "https://github.com/rharshavardhanan/sequential-conformal-prediction-for-long-robotic-tasks",
  );
  await page.goto("/work/scp");
  await expect(page.locator("header dl")).toContainText("Dr. Sankari M");
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("nothing plays until asked", async ({ page }) => {
    await page.goto("/work/scp");
    const clips = page.locator("article ul video");
    await clips.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    expect(
      await clips.evaluateAll((videos) =>
        (videos as HTMLVideoElement[]).every((v) => v.paused),
      ),
    ).toBe(true);
    await page
      .locator("article")
      .getByRole("button", { name: "Play", exact: true })
      .click();
    await expect
      .poll(() => clips.first().evaluate((v: HTMLVideoElement) => !v.paused))
      .toBe(true);
  });
});
