import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { loadEnvConfig } from "@next/env";
import postgres from "postgres";

import { getServerEnv } from "../src/lib/env";

loadEnvConfig(process.cwd());

export function createMigrationClient() {
  const env = getServerEnv();
  return postgres(env.SUPABASE_DB_URL, {
    max: 1,
    onnotice: () => undefined,
  });
}

export async function migrationFiles() {
  const directory = path.join(process.cwd(), "supabase", "migrations");
  const files = (await readdir(directory))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  return Promise.all(
    files.map(async (file) => ({
      name: file,
      sql: await readFile(path.join(directory, file), "utf8"),
    })),
  );
}
