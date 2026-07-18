import { z } from "zod";
import { promotionPacketSchema } from "@/lib/ai/schemas";
import { savePromotionAsset } from "@/lib/db/mutations";
import { getAssetSourceIds, getPromotionSources } from "@/lib/db/queries";
import { validatePromotionPacket } from "@/lib/domain/provenance";

const requestSchema = z.object({ draft: promotionPacketSchema, status: z.enum(["draft", "final"]) });
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; const parsed = requestSchema.safeParse(await request.json()); if (!parsed.success) return Response.json({ error: { code: "INVALID_ASSET", message: "Review the packet fields and citations.", retryable: false } }, { status: 400 });
  try { const sourceIds = await getAssetSourceIds(id); if (!sourceIds) return Response.json({ error: { code: "ASSET_NOT_FOUND", message: "Packet not found.", retryable: false } }, { status: 404 }); validatePromotionPacket(parsed.data.draft, await getPromotionSources(sourceIds)); await savePromotionAsset(id, parsed.data.draft, parsed.data.status); return Response.json({ data: { id, status: parsed.data.status } }); }
  catch { return Response.json({ error: { code: "INVALID_CITATIONS", message: "Every claim must remain grounded in its approved sources.", retryable: false } }, { status: 400 }); }
}
