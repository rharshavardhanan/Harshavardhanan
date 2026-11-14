import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 800 } });

test("the demo turns the sample transcript into owned, dated tasks", async ({
  page,
}) => {
  await page.goto("/work/aftermeet");
  const demo = page.locator("article figure");
  await demo.getByRole("button", { name: "Extract" }).focus();
  await page.keyboard.press("Enter");
  await expect(demo.getByRole("status")).toHaveText(
    "4 tasks · 1 decision · people: Priya, Arun, Meera, Karthik",
  );
  const first = demo.locator("ol > li").first();
  await expect(first).toContainText("Send the revised pricing deck by Friday");
  await expect(first).toContainText("Arun");
  await expect(first).toContainText("By Friday");
  await expect(first).toContainText("90% sure");
  await expect(first).toContainText(
    "“Arun will send the revised pricing deck by Friday.”",
  );
  await expect(demo).toContainText(
    "We agreed to move the beta launch to the 21st.",
  );
});

test("a pasted transcript of your own works too", async ({ page }) => {
  await page.goto("/work/aftermeet");
  const demo = page.locator("article figure");
  await demo
    .getByRole("textbox")
    .fill("Ravi will prepare the budget by Monday. Okay, thanks all.");
  await demo.getByRole("button", { name: "Extract" }).click();
  await expect(demo.getByRole("status")).toContainText("1 task");
  await expect(demo.locator("ol > li")).toContainText("Ravi");
});

test("the chapter is light, credited as solo, and links to the site and code", async ({
  page,
}) => {
  await page.goto("/work/aftermeet");
  const chapter = page.locator("article");
  await expect(chapter).toContainText("Solo project");
  await expect(
    chapter.getByRole("link", { name: /live site/i }),
  ).toHaveAttribute("href", "https://aftermeet-z1ey.vercel.app");
  await expect(
    chapter.getByRole("link", { name: /Code on GitHub/ }),
  ).toHaveAttribute("href", "https://github.com/rharshavardhanan/Aftermeet");
  await expect(page.locator("article")).toHaveAttribute("data-tone", "light");
});

test("its real screenshots are served", async ({ request }) => {
  for (const file of ["landing", "workspace", "mobile", "extension"]) {
    const path = `/media/real/aftermeet-${file}.png`;
    expect((await request.get(path)).status(), path).toBe(200);
  }
});
