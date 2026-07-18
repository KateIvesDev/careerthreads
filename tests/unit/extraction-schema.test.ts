import { describe, expect, it } from "vitest";

import { experienceExtractionSchema } from "@/lib/ai/extraction-schema";
import { buildFixtureExtraction } from "@/lib/ai/fixtures";

describe("experience extraction schema", () => {
  it("accepts the disclosed fixture", () => {
    const fixture = buildFixtureExtraction(
      "I coordinated a safer release checklist.",
      "Release owners had a repeatable recovery path.",
    );
    expect(experienceExtractionSchema.parse(fixture).themes[0]?.strength).toBe(1);
  });

  it("rejects an unsupported theme strength", () => {
    const fixture = buildFixtureExtraction("I improved a process.", null);
    const invalid = {
      ...fixture,
      themes: [{ ...fixture.themes[0], strength: 9 }],
    };
    expect(experienceExtractionSchema.safeParse(invalid).success).toBe(false);
  });
});
