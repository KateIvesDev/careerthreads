import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function matches(left: string, right: string) { const a = Buffer.from(left); const b = Buffer.from(right); return a.length === b.length && timingSafeEqual(a, b); }
export function proxy(request: NextRequest) {
  const password = process.env.DEMO_ACCESS_PASSWORD;
  if (process.env.NODE_ENV !== "production" && !password) return NextResponse.next();
  if (!password) return Response.json({ error: { code: "ACCESS_NOT_CONFIGURED", message: "Demo access is not configured.", retryable: false } }, { status: 503 });
  const authorization = request.headers.get("authorization") ?? "";
  if (authorization.startsWith("Basic ")) { try { const decoded = Buffer.from(authorization.slice(6), "base64").toString("utf8"); const separator = decoded.indexOf(":"); if (separator >= 0 && matches(decoded.slice(0, separator), "careerthread") && matches(decoded.slice(separator + 1), password)) return NextResponse.next(); } catch { /* reject malformed credentials */ } }
  return new Response("Authentication required", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Career Thread Demo", charset="UTF-8"', "Cache-Control": "no-store" } });
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
