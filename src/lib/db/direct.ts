import "server-only";

import postgres from "postgres";

import { getServerEnv } from "@/lib/env";

export function createDirectDatabaseClient() {
  return postgres(getServerEnv().SUPABASE_DB_URL, {
    max: 1,
    // Supabase's transaction pooler does not support named prepared statements.
    // Disabling them also keeps each Vercel invocation safe to route through PgBouncer.
    prepare: false,
    onnotice: () => undefined,
  });
}
