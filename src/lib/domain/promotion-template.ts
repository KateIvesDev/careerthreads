import { randomUUID } from "node:crypto";
import type { PromotionPacketDraft } from "@/lib/ai/schemas";
import { evidenceStateFor, type PromotionSource } from "@/lib/domain/provenance";

export function buildPromotionTemplate(sources: PromotionSource[], targetRole?: string): PromotionPacketDraft {
  const claims = sources.map((source) => ({ id: randomUUID(), text: source.impacts[0]?.description ? `${source.title}: ${source.summary} ${source.impacts[0].description}` : `${source.title}: ${source.summary}`, sourceIds: [source.id], evidenceState: evidenceStateFor(source) }));
  return { heading: targetRole ? `Evidence for ${targetRole}` : "Selected promotion evidence", summary: "This section brings together selected, approved Career Record experiences.", claims, gaps: sources.filter((source) => evidenceStateFor(source) === "needs_evidence").map((source) => ({ text: `Additional evidence would strengthen: ${source.title}`, relatedExperienceIds: [source.id] })) };
}
