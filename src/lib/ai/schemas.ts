import { z } from "zod";

export const modelHealthSchema = z.object({
  status: z.literal("ok"),
});

export type ModelHealth = z.infer<typeof modelHealthSchema>;

export const mentorFollowUpSchema = z.object({
  question: z.string().trim().min(1).max(180),
  purpose: z.enum(["impact", "ownership", "scope", "evidence", "complexity"]),
  missingInformation: z.string().trim().min(1).max(240),
  shouldAsk: z.boolean(),
});

export type MentorFollowUp = z.infer<typeof mentorFollowUpSchema>;

export const promotionPacketSchema = z.object({
  heading: z.string().trim().min(1).max(160),
  summary: z.string().trim().min(1).max(1000),
  claims: z.array(z.object({
    id: z.uuid(), text: z.string().trim().min(1).max(800),
    sourceIds: z.array(z.uuid()).min(1).max(4),
    evidenceState: z.enum(["supported", "user_reported", "needs_evidence"]),
  })).min(1).max(6),
  gaps: z.array(z.object({ text: z.string().trim().min(1).max(400), relatedExperienceIds: z.array(z.uuid()).max(4) })).max(4),
});
export type PromotionPacketDraft = z.infer<typeof promotionPacketSchema>;
