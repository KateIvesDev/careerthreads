import { experienceExtractionSchema } from "@/lib/ai/extraction-schema";
import { rejectDraft, saveDraft } from "@/lib/db/mutations";
import { z } from "zod";

const saveSchema = z.object({ draft: experienceExtractionSchema, revision: z.number().int().positive() });

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const rawBody = await request.text();
  if (!rawBody) {
    return Response.json(
      { error: { code: "EMPTY_DRAFT", message: "The draft request was empty.", retryable: true } },
      { status: 400 },
    );
  }
  const body: unknown = JSON.parse(rawBody);
  if (typeof body === "object" && body !== null && "action" in body && body.action === "reject") {
    await rejectDraft(id);
    return Response.json({ data: { status: "rejected" } });
  }
  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: { code: "INVALID_DRAFT", message: "Review the highlighted fields.", retryable: false } }, { status: 400 });
  try { const revision = await saveDraft(id, parsed.data.draft, parsed.data.revision); return Response.json({ data: { draftId: id, revision } }); }
  catch { return Response.json({ error: { code: "EDIT_CONFLICT", message: "A newer version of this draft is already saved. Your local edits are still here.", retryable: true } }, { status: 409 }); }
}
