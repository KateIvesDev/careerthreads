import type { ExperienceExtraction } from "@/lib/ai/extraction-schema";
import { AIValidationError } from "@/lib/ai/errors";

const numberPattern = /\b\d+(?:[.,]\d+)?%?\b/g;

export function validateGroundedExtraction(options: {
  extraction: ExperienceExtraction;
  initialText: string;
  answer: string | null;
  allowedThemeSlugs: string[];
}) {
  const sourceText = `${options.initialText}\n${options.answer ?? ""}`.toLowerCase();
  const availableRefs = new Set<string>(["initial", ...(options.answer ? ["answer"] : [])]);

  for (const fragment of options.extraction.experience.factFragments) {
    if (!availableRefs.has(fragment.sourceRef) || !sourceText.includes(fragment.text.toLowerCase())) {
      throw new AIValidationError("Fact fragment is not grounded in the reflection");
    }
  }

  for (const impact of options.extraction.impacts) {
    if (!availableRefs.has(impact.sourceRef)) {
      throw new AIValidationError("Impact source is unavailable");
    }
    const numericTokens: string[] = impact.description.match(numberPattern) ?? [];
    if (impact.metricValue) numericTokens.push(impact.metricValue);
    for (const token of numericTokens) {
      if (!sourceText.includes(token.toLowerCase())) {
        throw new AIValidationError("Numeric impact is not grounded in source text");
      }
    }
  }

  const allowedThemes = new Set(options.allowedThemeSlugs);
  for (const theme of options.extraction.themes) {
    if (!allowedThemes.has(theme.themeSlug)) {
      throw new AIValidationError("Unknown theme suggestion");
    }
    if (!availableRefs.has(theme.sourceRef)) {
      throw new AIValidationError("Theme rationale source is unavailable");
    }
  }
  if (options.extraction.evidence !== null) {
    throw new AIValidationError("AI cannot attach evidence on the user's behalf");
  }

  return options.extraction;
}
