import { beforeEach, describe, expect, it, vi } from "vitest";
const { resetDemoProfile } = vi.hoisted(() => ({ resetDemoProfile: vi.fn() }));
vi.mock("@/lib/db/demo-reset", () => ({ resetDemoProfile }));
import { POST } from "@/app/api/demo/reset/route";
describe("demo reset route", () => {
  beforeEach(() => { resetDemoProfile.mockReset(); process.env.DEMO_RESET_TOKEN = "token"; });
  it("rejects an unauthorized reset without exposing details", async () => { const response = await POST(new Request("http://local/api/demo/reset", { method: "POST", headers: { authorization: "Bearer wrong" } })); expect(response.status).toBe(401); expect(await response.json()).toMatchObject({ error: { code: "UNAUTHORIZED", retryable: false } }); expect(resetDemoProfile).not.toHaveBeenCalled(); });
  it("accepts a server-validated token and has no profile input", async () => { resetDemoProfile.mockResolvedValue(undefined); const response = await POST(new Request("http://local/api/demo/reset", { method: "POST", headers: { authorization: "Bearer token" }, body: JSON.stringify({ profileId: "ignored" }) })); expect(response.status).toBe(200); expect(resetDemoProfile).toHaveBeenCalledWith("token"); });
});
