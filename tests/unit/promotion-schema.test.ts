import { describe, expect, it } from "vitest";
import { promotionPacketSchema } from "@/lib/ai/schemas";

describe("promotion packet schema", () => {
  it("requires cited claims", () => {
    expect(() => promotionPacketSchema.parse({ heading: "Case", summary: "Summary", claims: [{ id: "10000000-0000-4000-8000-000000000001", text: "Claim", sourceIds: [], evidenceState: "supported" }], gaps: [] })).toThrow();
  });
});
