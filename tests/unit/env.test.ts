import { describe, expect, it } from "vitest";

import {
  EnvironmentConfigurationError,
  getServerEnv,
} from "@/lib/env";

const validEnv = {
  OPENAI_API_KEY: "test-key",
  OPENAI_MODEL: "configured-by-environment",
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "test-service-key",
  SUPABASE_DB_URL: "postgresql://example.invalid/database",
  DEMO_PROFILE_ID: "00000000-0000-4000-8000-000000000001",
  DEMO_SAFE_MODE: "fallback",
  DEMO_RESET_TOKEN: "test-reset-token",
};

describe("server environment", () => {
  it("accepts a complete environment", () => {
    expect(getServerEnv(validEnv).OPENAI_MODEL).toBe(
      "configured-by-environment",
    );
  });

  it("reports missing keys without values", () => {
    expect(() => getServerEnv({})).toThrow(EnvironmentConfigurationError);

    try {
      getServerEnv({});
    } catch (error) {
      expect(error).toBeInstanceOf(EnvironmentConfigurationError);
      expect((error as EnvironmentConfigurationError).missingKeys).toContain(
        "OPENAI_MODEL",
      );
      expect((error as Error).message).not.toContain("test-key");
    }
  });
});
