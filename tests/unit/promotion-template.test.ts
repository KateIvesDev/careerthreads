import { describe, expect, it } from "vitest";
import { buildPromotionTemplate } from "@/lib/domain/promotion-template";
import type { PromotionSource } from "@/lib/domain/provenance";

export const promotionSources: PromotionSource[] = [
  { id: "20000000-0000-4000-8000-000000000001", title: "Improved setup", occurredOn: "2026-01-10", summary: "Simplified onboarding.", ownership: "Led the work.", confidence: "supported", impacts: [{ description: "Reduced setup to 1 hour.", confidence: "supported" }], evidence: [], themes: [] },
  { id: "20000000-0000-4000-8000-000000000002", title: "Shaped proposal", occurredOn: "2026-04-10", summary: "Scoped a customer problem.", ownership: null, confidence: "needs_evidence", impacts: [], evidence: [], themes: [] },
];

describe("promotion template", () => {
  it("uses each approved source directly and exposes gaps", () => {
    const draft = buildPromotionTemplate(promotionSources, "Staff Engineer");
    expect(draft.claims.map((claim) => claim.sourceIds)).toEqual(promotionSources.map((source) => [source.id]));
    expect(draft.claims[0].text).toContain("Reduced setup to 1 hour.");
    expect(draft.gaps[0].relatedExperienceIds).toEqual([promotionSources[1].id]);
  });
});
