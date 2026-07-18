import { z } from "zod";

import { extractExperience } from "@/lib/ai/extract";
import { createExperienceDraft } from "@/lib/db/mutations";
import { getReflectionSession, getThemeVocabulary } from "@/lib/db/queries";

const requestSchema = z.object({ answer: z.string().trim().max(3000).optional(), skipFollowUp: z.boolean().optional() });

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: { code: "INVALID_ANSWER", message: "The answer could not be saved.", retryable: false } }, { status: 400 });
  const session = await getReflectionSession(id);
  if (!session) return Response.json({ error: { code: "SESSION_NOT_FOUND", message: "Reflection session not found.", retryable: false } }, { status: 404 });
  const answer = parsed.data.skipFollowUp ? null : parsed.data.answer || null;
  try {
    const extraction = await extractExperience({ initialText: session.initial_text, answer, themes: await getThemeVocabulary() });
    const draftId = await createExperienceDraft(id, answer, extraction.data, {
      mode: extraction.generationMode,
      model: extraction.model,
      promptVersion: extraction.promptVersion,
    });
    return Response.json({ data: { draftId, draft: extraction.data, generationMode: extraction.generationMode } });
  } catch {
    return Response.json(
      { error: { code: "MODEL_INVALID_OUTPUT", message: "We could not build a grounded draft. Try again or continue manually.", retryable: true } },
      { status: 502 },
    );
  }
}
