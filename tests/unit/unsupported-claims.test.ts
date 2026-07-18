import { describe, expect, it } from "vitest";

import type { ExperienceExtraction } from "@/lib/ai/extraction-schema";
import { buildFixtureExtraction } from "@/lib/ai/fixtures";
import { validateGroundedExtraction } from "@/lib/validation/ai-output";

const initialText = "I coordinated release readiness with the platform team.";
const answer = "Release owners adopted a repeatable go/no-go check.";

function validExtraction(): ExperienceExtraction {
  return buildFixtureExtraction(initialText, answer);
}

function validate(extraction: ExperienceExtraction) {
  return validateGroundedExtraction({
    extraction,
    initialText,
    answer,
    allowedThemeSlugs: ["technical-leadership"],
  });
}

describe("validateGroundedExtraction", () => {
  it("accepts exact source fragments and allowlisted themes", () => {
    expect(validate(validExtraction())).toBeDefined();
  });

  it("rejects invented numeric impact claims", () => {
    const extraction = validExtraction();
    extraction.impacts[0].description = "Reduced release delays by 30%.";
    expect(() => validate(extraction)).toThrow(/Numeric impact/);
  });

  it("rejects unknown themes and unavailable theme sources", () => {
    const unknown = validExtraction();
    unknown.themes[0].themeSlug = "invented-theme";
    expect(() => validate(unknown)).toThrow(/Unknown theme/);

    const badSource = validExtraction();
    badSource.themes[0].sourceRef = "evidence";
    expect(() => validate(badSource)).toThrow(/Theme rationale source/);
  });

  it("rejects AI-attached evidence", () => {
    const extraction = validExtraction();
    extraction.evidence = { label: "Claimed artifact", noteOrExcerpt: "", url: "" };
    expect(() => validate(extraction)).toThrow(/cannot attach evidence/);
  });
});
