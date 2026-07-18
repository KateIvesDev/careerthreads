import { expect, test } from "@playwright/test";

test("generates, edits, saves, refreshes, and opens a cited source", async ({ page, context }) => {
  await page.goto("/assets/promotion");
  const choices = page.locator('.source-selector input[type="checkbox"]');
  await choices.nth(0).check(); await choices.nth(1).check();
  await page.getByRole("button", { name: "Generate promotion section" }).click();
  await expect(page.getByText("Live AI draft")).toBeVisible({ timeout: 30_000 });
  const heading = `Promotion evidence ${Date.now()}`; await page.getByLabel("Heading").fill(heading); await page.getByRole("button", { name: "Save draft" }).click(); await expect(page.getByRole("status")).toContainText("Draft saved");
  const popupPromise = context.waitForEvent("page"); await page.locator(".citation-chip").first().click(); const sourcePage = await popupPromise; await expect(sourcePage).toHaveURL(/\/experiences\//); await sourcePage.close();
  await page.reload(); await expect(page.getByLabel("Heading")).toHaveValue(heading);
});
