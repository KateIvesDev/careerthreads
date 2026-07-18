import { z } from "zod";

const serverEnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_DB_URL: z.string().min(1),
  DEMO_PROFILE_ID: z.uuid(),
  DEMO_SAFE_MODE: z.enum(["off", "fallback", "fixture"]),
  DEMO_RESET_TOKEN: z.string().min(1),
  DEMO_ACCESS_PASSWORD: z.string().min(12).optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export class EnvironmentConfigurationError extends Error {
  readonly missingKeys: string[];

  constructor(missingKeys: string[]) {
    super(`Missing or invalid environment variables: ${missingKeys.join(", ")}`);
    this.name = "EnvironmentConfigurationError";
    this.missingKeys = missingKeys;
  }
}

export function getServerEnv(
  source: Record<string, string | undefined> = process.env,
): ServerEnv {
  const result = serverEnvSchema.safeParse(source);

  if (!result.success) {
    const keys = [...new Set(result.error.issues.map((issue) => String(issue.path[0])))]
      .filter(Boolean)
      .sort();
    throw new EnvironmentConfigurationError(keys);
  }

  return result.data;
}
