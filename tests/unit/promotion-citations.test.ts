import { describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { validatePromotionPacket } from "@/lib/domain/provenance";
import { buildPromotionTemplate } from "@/lib/domain/promotion-template";
import { promotionSources } from "./promotion-template.test";

describe("promotion citation validation", () => {
  it("accepts grounded template claims", () => expect(validatePromotionPacket(buildPromotionTemplate(promotionSources), promotionSources)).toBeDefined());
  it("rejects unknown, duplicate, and uncited source IDs", () => {
    const unknown = buildPromotionTemplate(promotionSources); unknown.claims[0].sourceIds = [randomUUID()]; expect(() => validatePromotionPacket(unknown, promotionSources)).toThrow(/Unknown/);
    const duplicate = buildPromotionTemplate(promotionSources); duplicate.claims[0].sourceIds = [promotionSources[0].id, promotionSources[0].id]; expect(() => validatePromotionPacket(duplicate, promotionSources)).toThrow(/Duplicate citation/);
  });
  it("rejects invented numbers and overstated evidence", () => {
    const numeric = buildPromotionTemplate(promotionSources); numeric.claims[0].text = "Improved setup by 99%."; expect(() => validatePromotionPacket(numeric, promotionSources)).toThrow(/numeric/);
    const overstated = buildPromotionTemplate(promotionSources); overstated.claims[1].evidenceState = "supported"; expect(() => validatePromotionPacket(overstated, promotionSources)).toThrow(/overstated/);
  });
});
