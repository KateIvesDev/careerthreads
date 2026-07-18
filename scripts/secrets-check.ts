import { getServerEnv } from "../src/lib/env";

const env = getServerEnv();

console.info("1Password environment injection is ready", {
  requiredVariables: [
    "OPENAI_API_KEY",
    "OPENAI_MODEL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_DB_URL",
    "DEMO_PROFILE_ID",
    "DEMO_SAFE_MODE",
    "DEMO_RESET_TOKEN",
  ],
  demoSafeMode: env.DEMO_SAFE_MODE,
});
