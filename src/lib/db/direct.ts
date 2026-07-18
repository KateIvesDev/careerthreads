import "server-only";

import postgres from "postgres";

import { getServerEnv } from "@/lib/env";

export function createDirectDatabaseClient() {
  return postgres(getServerEnv().SUPABASE_DB_URL, { max: 1, onnotice: () => undefined });
}
