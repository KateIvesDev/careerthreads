import { describe, expect, it } from "vitest";
import { mayUseFallback, modeLabel, shouldCallLiveModel } from "@/lib/ai/demo-mode";
describe("demo-safe modes", () => {
  it("keeps off, fallback, and fixture behavior distinct", () => {
    expect(shouldCallLiveModel("off")).toBe(true); expect(mayUseFallback("off")).toBe(false);
    expect(shouldCallLiveModel("fallback")).toBe(true); expect(mayUseFallback("fallback")).toBe(true);
    expect(shouldCallLiveModel("fixture")).toBe(false); expect(modeLabel("fixture")).toBe("Demo fixture response");
  });
});
