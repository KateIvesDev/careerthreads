import { createMigrationClient, migrationFiles } from "./db";

async function main() {
  const sql = createMigrationClient();

  try {
    await sql`
    create table if not exists public.careerthread_schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )
  `;

    for (const migration of await migrationFiles()) {
      const [existing] = await sql<{ name: string }[]>`
      select name from public.careerthread_schema_migrations
      where name = ${migration.name}
    `;

      if (existing) continue;

      await sql.begin(async (transaction) => {
        await transaction.unsafe(migration.sql);
        await transaction`
        insert into public.careerthread_schema_migrations (name)
        values (${migration.name})
      `;
      });
      console.info(`Applied migration ${migration.name}`);
    }
  } finally {
    await sql.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Migration failed");
  process.exitCode = 1;
});
