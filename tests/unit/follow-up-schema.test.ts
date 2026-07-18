import { describe, expect, it } from "vitest";

import { mentorFollowUpSchema } from "@/lib/ai/schemas";

describe("mentorFollowUpSchema", () => {
  it("accepts one grounded follow-up decision", () => {
    expect(mentorFollowUpSchema.parse({
      question: "What changed for the team after you introduced the checklist?",
      purpose: "impact",
      missingInformation: "The reflection does not state an outcome.",
      shouldAsk: true,
    }).shouldAsk).toBe(true);
  });

  it("rejects unsupported purposes and oversized questions", () => {
    expect(() => mentorFollowUpSchema.parse({
      question: "x".repeat(181),
      purpose: "praise",
      missingInformation: "Unknown",
      shouldAsk: true,
    })).toThrow();
  });
});
