import { runStructuredOperation } from "@/lib/ai/client";
import { fixtureFollowUp } from "@/lib/ai/fixtures";
import { mentorFollowUpSchema } from "@/lib/ai/schemas";
import { getServerEnv } from "@/lib/env";
import { mayUseFallback, shouldCallLiveModel } from "@/lib/ai/demo-mode";

const promptVersion = "follow-up-1";

export async function generateMentorFollowUp(
  initialText: string,
  recentExperiences: Array<{ title: string; occurredOn: string }>,
) {
  const mode = getServerEnv().DEMO_SAFE_MODE;
  if (!shouldCallLiveModel(mode)) return { ...fixtureFollowUp, generationMode: "heuristic" as const, model: null };

  try {
    const result = await runStructuredOperation({
      operation: "mentor_follow_up",
      promptVersion,
      timeoutMs: 8_000,
      schema: mentorFollowUpSchema,
      instructions: [
        "You are Career Thread's grounded reflection mentor.",
        "Ask at most one calm, useful question that fills the highest-value factual gap.",
        "Focus on impact, ownership, scope, evidence, or complexity.",
        "Do not flatter, coach, invent a premise, or ask a compound question.",
        "The question must be 25 words or fewer.",
      ].join(" "),
      input: JSON.stringify({ initialReflection: initialText, recentExperiences }),
    });
    const wordCount = result.data.question.trim().split(/\s+/).length;
    if (wordCount > 25 || (result.data.question.match(/\?/g)?.length ?? 0) > 1) {
      throw new Error("Follow-up did not meet conversational constraints");
    }
    return { ...result.data, generationMode: "live" as const, model: result.model };
  } catch (error) {
    if (!mayUseFallback(mode)) throw error;
    return { ...fixtureFollowUp, missingInformation: "A concrete impact is not yet documented.", shouldAsk: true, generationMode: "heuristic" as const, model: null };
  }
}
