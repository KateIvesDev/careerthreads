import { z } from "zod";

import { generateMentorFollowUp } from "@/lib/ai/follow-up";
import { createReflection } from "@/lib/db/mutations";
import { getRecentExperienceContext } from "@/lib/db/queries";

const requestSchema = z.object({ text: z.string().trim().min(1).max(5000), inputMode: z.literal("text") });

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: { code: "INVALID_TEXT", message: "Enter a reflection before continuing.", retryable: false } }, { status: 400 });
  }
  try {
    const followUp = await generateMentorFollowUp(parsed.data.text, await getRecentExperienceContext());
    const sessionId = await createReflection(parsed.data.text, {
      question: followUp.question,
      generationMode: followUp.generationMode,
    });
    return Response.json({ data: { sessionId, followUp } });
  } catch {
    return Response.json(
      { error: { code: "MODEL_UNAVAILABLE", message: "The mentor is temporarily unavailable. Your text has not been lost.", retryable: true } },
      { status: 502 },
    );
  }
}
