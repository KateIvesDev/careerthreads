import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

describe("production demo access proxy", () => {
  afterEach(() => vi.unstubAllEnvs());
  it("rejects missing or incorrect credentials when access is configured", () => {
    vi.stubEnv("DEMO_ACCESS_PASSWORD", "long-demo-password");
    expect(proxy(new NextRequest("https://demo.example/" )).status).toBe(401);
    expect(proxy(new NextRequest("https://demo.example/", { headers: { authorization: `Basic ${Buffer.from("careerthread:wrong").toString("base64")}` } })).status).toBe(401);
  });
  it("allows the fixed username with the configured password", () => {
    vi.stubEnv("DEMO_ACCESS_PASSWORD", "long-demo-password"); const authorization = `Basic ${Buffer.from("careerthread:long-demo-password").toString("base64")}`;
    expect(proxy(new NextRequest("https://demo.example/", { headers: { authorization } })).status).toBe(200);
  });
});
