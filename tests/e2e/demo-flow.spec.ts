import { expect, test } from "@playwright/test";
test.skip(process.env.DEMO_SAFE_MODE !== "fixture", "Explicit fixture rehearsal only");
test("fixture-backed cutoff flow is deterministic and resets afterward", async ({ page, request }) => {
  const reset = () => request.post("/api/demo/reset", { headers: { authorization: `Bearer ${process.env.DEMO_RESET_TOKEN}` } });
  expect((await reset()).ok()).toBeTruthy();
  try {
    await page.goto("/reflect"); await page.getByLabel("What happened in your work recently?").fill("Coordinated a release-readiness review for the platform team."); await page.getByRole("button", { name: "Continue reflection" }).click();
    await expect(page.getByText(/Heuristic fallback/)).toBeVisible(); await page.getByLabel("Your answer").fill("Release owners adopted a repeatable go/no-go check."); await page.getByRole("button", { name: "Review interpretation" }).click();
    await expect(page.getByText("Demo fixture response")).toBeVisible(); await page.getByLabel("Ownership").fill("I facilitated the review and documented the shared decision."); await expect(page.getByRole("status").filter({ hasText: "All changes saved" })).toBeVisible({ timeout: 10_000 }); await page.getByRole("button", { name: "Add to Career Record" }).click(); await expect(page).toHaveURL("/", { timeout: 15_000 });
    await page.goto("/assets/promotion"); const choices = page.locator('.source-selector input[type="checkbox"]'); await choices.nth(0).check(); await choices.nth(1).check(); await page.getByRole("button", { name: "Generate promotion section" }).click();
    await expect(page.getByText("Demo fixture response")).toBeVisible(); await expect(page.locator(".citation-chip").first()).toBeVisible();
  } finally { expect((await reset()).ok()).toBeTruthy(); }
});
