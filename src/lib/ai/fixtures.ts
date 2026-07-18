import type { ExperienceExtraction } from "@/lib/ai/extraction-schema";

export const fixtureFollowUp = {
  question: "What changed for the team or customer because of this work?",
  purpose: "impact",
  mode: "heuristic",
} as const;

function conciseTitle(text: string) {
  const firstSentence = text.split(/[.!?]/)[0]?.trim() || "Professional experience";
  return firstSentence.length > 72 ? `${firstSentence.slice(0, 69)}…` : firstSentence;
}

export function buildFixtureExtraction(
  initialText: string,
  answer: string | null,
): ExperienceExtraction {
  const impact = answer?.trim();

  return {
    experience: {
      title: conciseTitle(initialText),
      occurredOn: new Date().toISOString().slice(0, 10),
      summary: initialText.trim(),
      ownership: null,
      factFragments: [
        { text: initialText.trim(), sourceRef: "initial" },
        ...(impact ? [{ text: impact, sourceRef: "answer" as const }] : []),
      ],
    },
    impacts: impact
      ? [
          {
            description: impact,
            metricValue: null,
            metricUnit: null,
            sourceRef: "answer",
            confidence: "reported",
          },
        ]
      : [],
    evidence: null,
    evidenceSuggestions: [
      {
        label: "Add a supporting note",
        reason: "A concrete artifact or excerpt would strengthen this reported outcome.",
      },
    ],
    themes: [
      {
        themeSlug: "technical-leadership",
        strength: 1,
        rationale: "This is a demo fixture suggestion. Review whether the work influenced technical direction or other people.",
        sourceRef: "initial",
      },
    ],
    interpretation: {
      text: "This may demonstrate technical leadership if the user confirms meaningful ownership or influence.",
      uncertainty: "Fixture-generated interpretation; the user must review and approve it.",
    },
    unansweredQuestions: [],
  };
}
