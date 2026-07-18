export {};
async function main() {
  const baseUrl = process.argv[2] ?? "http://localhost:3000"; const token = process.env.DEMO_RESET_TOKEN;
  if (!token) throw new Error("DEMO_RESET_TOKEN is required");
  const headers: Record<string, string> = { "x-demo-reset-token": token }; if (process.env.DEMO_ACCESS_PASSWORD) headers.authorization = `Basic ${Buffer.from(`careerthread:${process.env.DEMO_ACCESS_PASSWORD}`).toString("base64")}`;
  const response = await fetch(new URL("/api/demo/reset", baseUrl), { method: "POST", headers });
  const payload = await response.json(); if (!response.ok) throw new Error(payload.error?.message ?? "Demo reset failed");
  console.log("Demo profile restored to the known seed state.");
}
main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : "Demo reset failed"); process.exitCode = 1; });
