import { AIValidationError } from "@/lib/ai/errors";
import type { PromotionPacketDraft } from "@/lib/ai/schemas";

export interface PromotionSource {
  id: string; title: string; occurredOn: string; summary: string; ownership: string | null;
  confidence: "reported" | "supported" | "needs_evidence";
  impacts: Array<{ description: string; confidence: "reported" | "supported" | "needs_evidence" }>;
  evidence: Array<{ label: string; noteOrExcerpt: string | null }>;
  themes: Array<{ name: string; rationale: string }>;
}

const numericPattern = /\b\d+(?:[.,]\d+)?%?\b/g;
export function sourceText(source: PromotionSource) {
  return [source.title, source.occurredOn, source.summary, source.ownership, ...source.impacts.map((item) => item.description), ...source.evidence.flatMap((item) => [item.label, item.noteOrExcerpt]), ...source.themes.flatMap((item) => [item.name, item.rationale])].filter(Boolean).join(" ");
}
export function evidenceStateFor(source: PromotionSource) {
  if (source.confidence === "needs_evidence" || source.impacts.some((item) => item.confidence === "needs_evidence")) return "needs_evidence" as const;
  if (source.confidence === "supported" || source.impacts.some((item) => item.confidence === "supported")) return "supported" as const;
  return "user_reported" as const;
}
export function validatePromotionPacket(draft: PromotionPacketDraft, sources: PromotionSource[]) {
  const allowed = new Map(sources.map((source) => [source.id, source]));
  const claimIds = new Set<string>();
  for (const claim of draft.claims) {
    if (claimIds.has(claim.id)) throw new AIValidationError("Duplicate claim ID"); claimIds.add(claim.id);
    if (new Set(claim.sourceIds).size !== claim.sourceIds.length) throw new AIValidationError("Duplicate citation");
    const cited = claim.sourceIds.map((id) => allowed.get(id));
    if (cited.some((source) => !source)) throw new AIValidationError("Unknown promotion source");
    const citedSources = cited as PromotionSource[];
    const citedText = citedSources.map(sourceText).join(" ").toLowerCase();
    for (const token of claim.text.match(numericPattern) ?? []) if (!citedText.includes(token.toLowerCase())) throw new AIValidationError("Unsupported numeric promotion claim");
    const states = citedSources.map(evidenceStateFor);
    const expected = states.includes("needs_evidence") ? "needs_evidence" : states.includes("user_reported") ? "user_reported" : "supported";
    if (claim.evidenceState !== expected) throw new AIValidationError("Claim evidence state is overstated");
  }
  for (const gap of draft.gaps) if (gap.relatedExperienceIds.some((id) => !allowed.has(id))) throw new AIValidationError("Unknown gap source");
  return draft;
}
