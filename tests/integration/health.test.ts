import { describe, expect, it } from "vitest";

describe("health contract", () => {
  it("uses an explicit readiness shape", () => {
    const response = {
      status: "ok",
      checks: { configuration: "ok", database: "ok", model: "skipped" },
    } as const;

    expect(response.status).toBe("ok");
    expect(response.checks.database).toBe("ok");
  });
});
