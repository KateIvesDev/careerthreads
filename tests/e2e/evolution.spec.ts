import { expect, test } from "@playwright/test";

test("shows approved evidence trends and drills into a supporting experience", async ({ page }) => {
  await page.goto("/evolution");
  await expect(page.getByRole("heading", { name: "See the threads your record supports over time." })).toBeVisible();
  await expect(page.getByText("This measures approved Career Record evidence—not performance.")).toBeVisible();
  const firstRecord = page.locator(".supporting-list article a").first();
  const title = await firstRecord.textContent();
  await firstRecord.click();
  await expect(page).toHaveURL(/\/experiences\//);
  await expect(page.getByRole("heading", { name: title ?? "" })).toBeVisible();
  await expect(page.getByText("User report", { exact: true }).last()).toBeVisible();
  await expect(page.getByRole("link", { name: "← Career Evolution" })).toBeVisible();
});
