import { createMigrationClient, migrationFiles } from "./db";

async function main() {
  const sql = createMigrationClient();

  try {
    const expected = await migrationFiles();
    const applied = await sql<{ name: string }[]>`
    select name from public.careerthread_schema_migrations order by name
  `;
    const [health] = await sql<{ id: number }[]>`
    select id from public.careerthread_health where id = 1
  `;
    const [recordCounts] = await sql<{
      profiles: number;
      experiences: number;
      themes: number;
    }[]>`
      select
        (select count(*)::int from public.profiles) as profiles,
        (select count(*)::int from public.experiences) as experiences,
        (select count(*)::int from public.themes) as themes
    `;

    const appliedNames = new Set(applied.map(({ name }) => name));
    const missing = expected.filter(({ name }) => !appliedNames.has(name));
    if (
      missing.length > 0 ||
      !health ||
      !recordCounts ||
      recordCounts.profiles < 1 ||
      recordCounts.experiences < 6 ||
      recordCounts.themes < 6
    ) {
      throw new Error("Database verification failed");
    }
    console.info(
      `Database ready with ${applied.length} migration(s), ${recordCounts.experiences} experience(s), and ${recordCounts.themes} theme(s)`,
    );
  } finally {
    await sql.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Verification failed");
  process.exitCode = 1;
});
