import "server-only";
import { timingSafeEqual } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createDirectDatabaseClient } from "@/lib/db/direct";
import { getServerEnv } from "@/lib/env";

const SEEDED_PROFILE_ID = "00000000-0000-4000-8000-000000000001";
export async function resetDemoProfile(providedToken: string) {
  const env = getServerEnv();
  const provided = Buffer.from(providedToken); const expected = Buffer.from(env.DEMO_RESET_TOKEN);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) throw new Error("UNAUTHORIZED_RESET");
  if (env.DEMO_PROFILE_ID !== SEEDED_PROFILE_ID) throw new Error("RESET_PROFILE_MISMATCH");
  const seedSql = await readFile(path.join(process.cwd(), "supabase", "seed.sql"), "utf8"); const sql = createDirectDatabaseClient();
  try { await sql.begin(async (transaction) => { await transaction`delete from public.profiles where id = ${SEEDED_PROFILE_ID}`; await transaction.unsafe(seedSql); }); }
  finally { await sql.end(); }
}
