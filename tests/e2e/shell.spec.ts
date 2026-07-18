import { expect, test } from "@playwright/test";

test("renders the seeded Career Record", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Maya Chen's professional memory",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Build a promotion case around cross-team technical leadership"),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Reflect on recent work" })).toBeVisible();
});
