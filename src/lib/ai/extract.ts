import { runStructuredOperation } from "@/lib/ai/client";
import { AIValidationError } from "@/lib/ai/errors";
import { mayUseFallback, shouldCallLiveModel } from "@/lib/ai/demo-mode";
import { experienceExtractionSchema } from "@/lib/ai/extraction-schema";
import { buildFixtureExtraction } from "@/lib/ai/fixtures";
import { getServerEnv } from "@/lib/env";
import { validateGroundedExtraction } from "@/lib/validation/ai-output";

const promptVersion = "extraction-1";

export async function extractExperience(options: {
  initialText: string;
  answer: string | null;
  themes: Array<{ slug: string; name: string; description: string }>;
}) {
  const mode = getServerEnv().DEMO_SAFE_MODE;
  if (!shouldCallLiveModel(mode)) {
    return { data: buildFixtureExtraction(options.initialText, options.answer), generationMode: "fixture" as const, model: null, promptVersion: "fixture-1" };
  }

  try {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const result = await runStructuredOperation({
      operation: "experience_extraction",
      promptVersion,
      timeoutMs: 15_000,
      schema: experienceExtractionSchema,
      instructions: [
        "Convert a professional reflection into a reviewable Career Thread draft.",
        "Use only facts present in the initial reflection or follow-up answer.",
        "Never invent metrics, dates, ownership, evidence, outcomes, or certainty.",
        "Every fact fragment must be an exact contiguous excerpt of its named source.",
        "Evidence must be null because only the user can attach evidence.",
        "Keep factual summary separate from AI interpretation and state uncertainty explicitly.",
        "Suggest no more than three themes from the supplied vocabulary.",
        "Every theme rationale must identify initial or answer as its sourceRef and explain its connection without adding facts.",
        "If the date is unstated, use today's date as a capture-date approximation and mention that uncertainty.",
      ].join(" "),
      input: JSON.stringify({
        currentDate: new Date().toISOString().slice(0, 10),
        initialReflection: options.initialText,
        followUpAnswer: options.answer,
        themeVocabulary: options.themes,
      }),
    });
        return {
          data: validateGroundedExtraction({ extraction: result.data, initialText: options.initialText, answer: options.answer, allowedThemeSlugs: options.themes.map(({ slug }) => slug) }),
          generationMode: "live" as const,
          model: result.model,
          promptVersion,
        };
      } catch (error) {
        if (!(error instanceof AIValidationError) || attempt === 1) throw error;
      }
    }
    throw new AIValidationError();
  } catch (error) {
    if (!mayUseFallback(mode)) throw error;
    return { data: buildFixtureExtraction(options.initialText, options.answer), generationMode: "fixture" as const, model: null, promptVersion: "fixture-1" };
  }
}
