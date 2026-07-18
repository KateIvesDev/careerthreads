import "server-only";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { z } from "zod";

import { AIUnavailableError, AIValidationError } from "@/lib/ai/errors";
import { getServerEnv } from "@/lib/env";

export function createOpenAIClient() {
  const env = getServerEnv();

  return {
    client: new OpenAI({ apiKey: env.OPENAI_API_KEY }),
    model: env.OPENAI_MODEL,
  };
}

export async function runStructuredOperation<T extends z.ZodType>(options: {
  operation: string;
  promptVersion: string;
  instructions: string;
  input: string;
  schema: T;
  timeoutMs: number;
}) {
  const { client, model } = createOpenAIClient();
  const startedAt = Date.now();

  try {
    const response = await client.responses.parse(
      {
        model,
        instructions: options.instructions,
        input: options.input,
        text: { format: zodTextFormat(options.schema, options.operation) },
      },
      { maxRetries: 0, signal: AbortSignal.timeout(options.timeoutMs) },
    );

    if (!response.output_parsed) {
      throw new AIValidationError();
    }

    console.info("AI operation completed", {
      operation: options.operation,
      promptVersion: options.promptVersion,
      model: response.model,
      responseId: response.id,
      latencyMs: Date.now() - startedAt,
    });

    return { data: response.output_parsed, model: response.model };
  } catch (error) {
    if (error instanceof AIValidationError) throw error;
    console.warn("AI operation failed", {
      operation: options.operation,
      promptVersion: options.promptVersion,
      name: error instanceof Error ? error.name : "UnknownError",
      latencyMs: Date.now() - startedAt,
    });
    throw new AIUnavailableError();
  }
}
