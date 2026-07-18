import { z } from "zod";

const sourceRefSchema = z.enum(["initial", "answer", "evidence"]);

export const experienceExtractionSchema = z.object({
  experience: z.object({
    title: z.string().trim().min(1).max(120),
    occurredOn: z.iso.date(),
    summary: z.string().trim().min(1).max(1200),
    ownership: z.string().trim().max(600).nullable(),
    factFragments: z
      .array(z.object({ text: z.string().trim().min(1), sourceRef: sourceRefSchema }))
      .min(1)
      .max(8),
  }),
  impacts: z
    .array(
      z.object({
        description: z.string().trim().min(1).max(600),
        metricValue: z.string().trim().max(40).nullable(),
        metricUnit: z.string().trim().max(60).nullable(),
        sourceRef: sourceRefSchema,
        confidence: z.enum(["reported", "supported", "needs_evidence"]),
      }),
    )
    .max(3),
  evidence: z
    .object({
      label: z.string().trim().max(120),
      noteOrExcerpt: z.string().trim().max(1000),
      url: z.string().trim().max(2048),
    })
    .nullable(),
  evidenceSuggestions: z
    .array(z.object({ label: z.string().trim().min(1), reason: z.string().trim().min(1) }))
    .max(3),
  themes: z
    .array(
      z.object({
        themeSlug: z.string().trim().min(1),
        strength: z.union([z.literal(1), z.literal(2)]),
        rationale: z.string().trim().min(1).max(400),
        sourceRef: sourceRefSchema,
      }),
    )
    .max(3),
  interpretation: z.object({
    text: z.string().trim().max(600),
    uncertainty: z.string().trim().max(400).nullable(),
  }),
  unansweredQuestions: z.array(z.string().trim().min(1)).max(3),
});

export type ExperienceExtraction = z.infer<typeof experienceExtractionSchema>;
