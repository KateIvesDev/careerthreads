import { readFile } from "node:fs/promises";
import path from "node:path";

import { createMigrationClient } from "./db";

async function main() {
  const sql = createMigrationClient();

  try {
    const seed = await readFile(
      path.join(process.cwd(), "supabase", "seed.sql"),
      "utf8",
    );
    await sql.begin((transaction) => transaction.unsafe(seed));
    console.info("Seed completed");
  } finally {
    await sql.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Seed failed");
  process.exitCode = 1;
});
