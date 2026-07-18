import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";

test("approved experience edits use optimistic concurrency and preserve local recovery", async ({ page, request }) => {
  const evolutionResponse = await page.goto("/evolution"); expect(evolutionResponse?.headers()["content-security-policy"]).toContain("frame-ancestors 'none'"); expect(evolutionResponse?.headers()["x-content-type-options"]).toBe("nosniff");
  const href = await page.locator(".supporting-list article a").first().getAttribute("href");
  expect(href).toMatch(/^\/experiences\//); const id = href!.split("/").pop()!;
  const detailResponse = await request.get(`/api/experiences/${id}`); const detail = (await detailResponse.json()).data;
  const themes = detail.themes.flatMap((link: { theme_id: string; rationale: string; strength: 1 | 2 }) => [{ themeId: link.theme_id, rationale: link.rationale, strength: link.strength }]);
  const edit = { revision: detail.revision, title: `${detail.title} concurrency check`, occurredOn: detail.occurred_on, summary: detail.summary, ownership: detail.ownership,
    impacts: detail.impacts.map((item: { id: string; description: string }) => ({ id: item.id, description: item.description })),
    evidence: detail.evidence.map((item: { id: string; label: string; note_or_excerpt: string | null; url: string | null }) => ({ id: item.id, label: item.label, noteOrExcerpt: item.note_or_excerpt, url: item.url })), themes };
  const forged = await request.patch(`/api/experiences/${id}`, { data: { ...edit, impacts: [{ id: randomUUID(), description: "Foreign reference" }] } }); expect(forged.status()).toBe(409);
  const first = await request.patch(`/api/experiences/${id}`, { data: edit }); const firstPayload = await first.json(); expect(first.ok(), JSON.stringify(firstPayload)).toBeTruthy(); const revision = firstPayload.data.revision;
  const stale = await request.patch(`/api/experiences/${id}`, { data: { ...edit, title: `${detail.title} stale` } }); expect(stale.status()).toBe(409);
  const restore = await request.patch(`/api/experiences/${id}`, { data: { ...edit, revision, title: detail.title } }); expect(restore.ok()).toBeTruthy();
  await page.goto(`/experiences/${id}`); await expect(page.getByRole("heading", { name: detail.title })).toBeVisible(); await expect(page.getByRole("button", { name: "Save approved record" })).toBeVisible();
});
