import { approveDraft } from "@/lib/db/mutations";
import { z } from "zod";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const parsed = z.object({ revision: z.number().int().positive() }).safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: { code: "INVALID_REVISION", message: "Reload the current draft before approval.", retryable: true } }, { status: 400 });
  try {
    return Response.json({ data: { experienceId: await approveDraft(id, parsed.data.revision) } });
  } catch {
    return Response.json({ error: { code: "APPROVAL_FAILED", message: "The draft was not added. Try again.", retryable: true } }, { status: 409 });
  }
}
