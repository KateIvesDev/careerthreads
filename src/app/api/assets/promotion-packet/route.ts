import { z } from "zod";
import { generatePromotionPacket } from "@/lib/ai/promotion-packet";
import { createPromotionAsset } from "@/lib/db/mutations";
import { getPromotionSources } from "@/lib/db/queries";

const requestSchema = z.object({ experienceIds: z.array(z.uuid()).min(2).max(4).refine((ids) => new Set(ids).size === ids.length), targetRole: z.string().trim().max(120).optional() });
export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json()); if (!parsed.success) return Response.json({ error: { code: "INSUFFICIENT_APPROVED_SOURCES", message: "Select two to four approved experiences.", retryable: false } }, { status: 400 });
  try { const sources = await getPromotionSources(parsed.data.experienceIds); const result = await generatePromotionPacket(sources, parsed.data.targetRole); const assetId = await createPromotionAsset(result.draft, { mode: result.generationMode, model: result.model, promptVersion: result.promptVersion }); return Response.json({ data: { assetId, draft: result.draft, generationMode: result.generationMode } }); }
  catch { return Response.json({ error: { code: "MODEL_INVALID_OUTPUT", message: "We could not build a grounded packet. Your selection is still here.", retryable: true } }, { status: 502 }); }
}
