import { expect, test } from "@playwright/test";

// Every demo is driven here with the keyboard only, to its final state.
test.use({ viewport: { width: 1280, height: 800 } });

test("Odovox: the dictation becomes a record the doctor verifies", async ({
  page,
}) => {
  await page.goto("/");
  const demo = page.locator("section#odovox figure");
  await demo.scrollIntoViewIfNeeded();
  const verify = demo.getByRole("button", { name: "Verify record" });
  await expect(verify).toBeVisible({ timeout: 10_000 });
  await expect(demo).toContainText("Root canal treatment (RCT)");
  await expect(demo.locator('[aria-current="true"]')).toHaveText("36");
  await verify.focus();
  await page.keyboard.press("Enter");
  await expect(demo.getByRole("status")).toContainText("Doctor verified");
});

test("Road Damage: switching model changes what is found", async ({ page }) => {
  await page.goto("/");
  const demo = page.locator("section#road figure");
  await expect(demo.getByRole("status")).toHaveText("4 of 17 found");
  await demo.getByRole("radio", { name: "General model" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(demo.getByRole("status")).toHaveText("10 of 17 found");
  await expect(demo.locator("svg rect.demo-in")).toHaveCount(10);
});

test("Kattral: the class fills up and the chat appears", async ({ page }) => {
  await page.goto("/");
  const demo = page.locator("section#kattral figure");
  await demo.scrollIntoViewIfNeeded();
  await expect(demo.getByRole("status")).toHaveText("6 in class", {
    timeout: 10_000,
  });
  await expect(demo).toContainText("Can everyone see my screen?");
  await expect(demo.locator('.tile[data-on="true"]')).toHaveCount(6);
});

test("Cache Wars: a run finishes with three hit rates and a verdict", async ({
  page,
}) => {
  await page.goto("/");
  const demo = page.locator("section#cache figure");
  // Q-Learning is chosen at first; one press of the left arrow moves to LFU.
  await demo.getByRole("radio", { name: "Q-Learning" }).focus();
  await page.keyboard.press("ArrowLeft");
  await expect(demo.getByRole("radio", { name: "LFU" })).toBeChecked();
  await demo.getByRole("button", { name: "Run" }).focus();
  await page.keyboard.press("Enter");
  await expect(demo.getByRole("status")).toContainText("kept the most hits", {
    timeout: 15_000,
  });
  await expect(demo.getByRole("status")).toContainText("LFU");
  await expect(demo.getByRole("button", { name: "Run again" })).toBeEnabled();
});

test("Spot the Hallucination: five answers, then the score", async ({
  page,
}) => {
  await page.goto("/");
  const demo = page.locator("section#hallucination figure");
  // Correct answers, in order: made up, supported, made up, supported, supported.
  for (const answer of [
    "Made up",
    "Supported",
    "Made up",
    "Supported",
    "Supported",
  ]) {
    await demo.getByRole("button", { name: answer, exact: true }).focus();
    await page.keyboard.press("Enter");
    await expect(demo.getByRole("status")).toContainText("Correct.");
    await page.keyboard.press("Enter"); // focus has moved to Next
  }
  await expect(demo).toContainText("5 / 5");
  await expect(demo).toContainText("94%");
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("scripted demos show their end state at once", async ({ page }) => {
    await page.goto("/");
    const odovox = page.locator("section#odovox figure");
    await odovox.scrollIntoViewIfNeeded();
    await expect(
      odovox.getByRole("button", { name: "Verify record" }),
    ).toBeVisible();
    const cache = page.locator("section#cache figure");
    await cache.getByRole("button", { name: "Run" }).click();
    await expect(cache.getByRole("status")).toContainText("kept the most hits");
  });
});
