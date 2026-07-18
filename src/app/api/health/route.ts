import { modelHealthSchema } from "@/lib/ai/schemas";
import { createOpenAIClient } from "@/lib/ai/client";
import { createServerDatabaseClient } from "@/lib/db/client";
import { EnvironmentConfigurationError } from "@/lib/env";

type CheckStatus = "ok" | "error" | "skipped";

interface HealthResponse {
  status: "ok" | "error";
  checks: {
    configuration: CheckStatus;
    database: CheckStatus;
    model: CheckStatus;
  };
  model?: string;
  error?: string;
}

export async function GET(request: Request) {
  const checks: HealthResponse["checks"] = {
    configuration: "ok",
    database: "skipped",
    model: "skipped",
  };
  const includeModel = new URL(request.url).searchParams.get("model") === "1";
  if (includeModel && request.headers.get("x-demo-reset-token") !== process.env.DEMO_RESET_TOKEN) return Response.json({ error: { code: "UNAUTHORIZED", message: "Model health authorization failed.", retryable: false } }, { status: 401 });

  try {
    const database = createServerDatabaseClient();
    const { error } = await database
      .from("careerthread_health")
      .select("id")
      .limit(1);

    if (error) {
      console.warn("Database readiness check failed", {
        code: error.code,
      });
      throw new Error("Database readiness check failed");
    }
    checks.database = "ok";

    if (!includeModel) {
      return Response.json({ status: "ok", checks } satisfies HealthResponse);
    }

    const { client, model } = createOpenAIClient();
    const response = await client.responses.create({
      model,
      input: "Return the health-check status.",
      max_output_tokens: 32,
      text: {
        format: {
          type: "json_schema",
          name: "careerthread_health",
          strict: true,
          schema: {
            type: "object",
            properties: { status: { type: "string", enum: ["ok"] } },
            required: ["status"],
            additionalProperties: false,
          },
        },
      },
    });

    modelHealthSchema.parse(JSON.parse(response.output_text));
    checks.model = "ok";
    console.info("Model readiness check succeeded", {
      operation: "health",
      model: response.model,
      responseId: response.id,
    });

    return Response.json({
      status: "ok",
      checks,
      model: response.model,
    } satisfies HealthResponse);
  } catch (error) {
    if (error instanceof EnvironmentConfigurationError) {
      checks.configuration = "error";
      return Response.json(
        {
          status: "error",
          checks,
          error: error.message,
        } satisfies HealthResponse,
        { status: 503 },
      );
    }

    const failedCheck = checks.database === "ok" ? "model" : "database";
    if (failedCheck === "model") {
      console.warn("Model readiness check failed", {
        name: error instanceof Error ? error.name : "UnknownError",
      });
    }
    checks[failedCheck] = "error";
    return Response.json(
      {
        status: "error",
        checks,
        error: `${failedCheck === "model" ? "Model" : "Database"} readiness check failed`,
      } satisfies HealthResponse,
      { status: 503 },
    );
  }
}
