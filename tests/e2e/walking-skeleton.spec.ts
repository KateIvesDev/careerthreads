import { expect, test } from "@playwright/test";

test("turns a reflection into a reviewed Career Record entry", async ({ page }) => {
  const reflection = `Coordinated release readiness ${Date.now()}`;

  await page.goto("/");
  await page.getByRole("link", { name: "Reflect on recent work" }).click();
  await page.getByLabel("What happened in your work recently?").fill(reflection);
  await page.getByRole("button", { name: "Continue reflection" }).click();
  await expect(page.getByText(/One useful follow-up · (Live AI|Heuristic fallback)/)).toBeVisible();
  await page.getByLabel("Your answer").fill("Release owners had a repeatable go/no-go check.");
  await page.getByRole("button", { name: "Review interpretation" }).click();
  await expect(page.getByText("Live AI draft")).toBeVisible({ timeout: 20_000 });
  const recordTitle = await page.getByLabel("Title").inputValue();
  await page.getByLabel("Ownership").fill("I initiated the checklist and facilitated team review.");
  await expect(page.getByRole("status").filter({ hasText: "All changes saved" })).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: "Add to Career Record" }).click();
  await expect(page).toHaveURL("/", { timeout: 20_000 });
  await expect(page.getByRole("heading", { name: recordTitle })).toBeVisible({ timeout: 10_000 });
  await page.reload();
  await expect(page.getByRole("heading", { name: recordTitle })).toBeVisible();
});
