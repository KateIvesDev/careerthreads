import { resetDemoProfile } from "@/lib/db/demo-reset";
import { timingSafeEqual } from "node:crypto";
export async function POST(request: Request) {
  const authorization = request.headers.get("authorization") ?? ""; const token = request.headers.get("x-demo-reset-token") ?? (authorization.startsWith("Bearer ") ? authorization.slice(7) : "");
  const expectedToken = process.env.DEMO_RESET_TOKEN ?? ""; const supplied = Buffer.from(token); const expected = Buffer.from(expectedToken);
  if (!expectedToken || supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return Response.json({ error: { code: "UNAUTHORIZED", message: "Reset authorization failed.", retryable: false } }, { status: 401 });
  try { await resetDemoProfile(token); return Response.json({ data: { status: "reset" } }); }
  catch (error) { const unauthorized = error instanceof Error && error.message === "UNAUTHORIZED_RESET"; return Response.json({ error: { code: unauthorized ? "UNAUTHORIZED" : "RESET_FAILED", message: unauthorized ? "Reset authorization failed." : "The demo could not be reset safely.", retryable: !unauthorized } }, { status: unauthorized ? 401 : 500 }); }
}
