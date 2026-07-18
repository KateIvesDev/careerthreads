import { runStructuredOperation } from "@/lib/ai/client";
import { promotionPacketSchema } from "@/lib/ai/schemas";
import { evidenceStateFor, sourceText, validatePromotionPacket, type PromotionSource } from "@/lib/domain/provenance";
import { buildPromotionTemplate } from "@/lib/domain/promotion-template";
import { getServerEnv } from "@/lib/env";
import { mayUseFallback, shouldCallLiveModel } from "@/lib/ai/demo-mode";

const promptVersion = "promotion-packet-1";
export async function generatePromotionPacket(sources: PromotionSource[], targetRole?: string) {
  const mode = getServerEnv().DEMO_SAFE_MODE;
  if (!shouldCallLiveModel(mode)) return { draft: buildPromotionTemplate(sources, targetRole), generationMode: "fixture" as const, model: null, promptVersion: "fixture-1" };
  try {
    const result = await runStructuredOperation({ operation: "promotion_packet", promptVersion, timeoutMs: 20_000, schema: promotionPacketSchema,
      instructions: "Create one concise promotion-packet section using only the supplied approved sources. Every claim must cite one or more supplied experience IDs. Preserve the supplied evidenceState exactly; never upgrade reported or needs-evidence material. Copy numeric tokens only from cited source text. Identify gaps instead of inventing support. Claim IDs must be unique UUIDs.",
      input: JSON.stringify({ targetRole: targetRole || null, sources: sources.map((source) => ({ id: source.id, evidenceState: evidenceStateFor(source), text: sourceText(source) })) }),
    });
    return { draft: validatePromotionPacket(result.data, sources), generationMode: "live" as const, model: result.model, promptVersion };
  } catch (error) {
    if (!mayUseFallback(mode)) throw error;
    return { draft: buildPromotionTemplate(sources, targetRole), generationMode: "template" as const, model: null, promptVersion: "template-1" };
  }
}
