export {};
async function main() {
  const target = process.argv[2];

  if (!target) {
    throw new Error("Usage: npm run smoke -- <base-url>");
  }

  const headers: Record<string, string> = { "x-demo-reset-token": process.env.DEMO_RESET_TOKEN ?? "" };
  if (process.env.DEMO_ACCESS_PASSWORD) headers.authorization = `Basic ${Buffer.from(`careerthread:${process.env.DEMO_ACCESS_PASSWORD}`).toString("base64")}`;
  const response = await fetch(new URL("/api/health?model=1", target), { headers });
  const payload: unknown = await response.json();

  if (!response.ok) {
    throw new Error(`Smoke check failed with status ${response.status}`);
  }

  console.info("Smoke check passed", payload);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Smoke check failed");
  process.exitCode = 1;
});
