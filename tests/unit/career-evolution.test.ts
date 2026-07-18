import { describe, expect, it } from "vitest";
import { buildCareerEvolution, quarterForDate, type EvolutionInput } from "@/lib/domain/career-evolution";

function link(overrides: Partial<EvolutionInput> = {}): EvolutionInput {
  return { experienceId: "e1", title: "Example", occurredOn: "2026-03-31", themeId: "t1", themeSlug: "leadership", themeName: "Leadership", strength: 2, rationale: "Led the decision.", sourceKind: "ai_interpretation", status: "accepted", approvedAt: "2026-04-01", ...overrides };
}

describe("career evolution", () => {
  it("handles empty data and quarter boundaries", () => {
    expect(buildCareerEvolution([])).toEqual({ quarters: [], themes: [] });
    expect(quarterForDate("2026-03-31")).toBe("2026 Q1");
    expect(quarterForDate("2026-04-01")).toBe("2026 Q2");
  });

  it("caps quarter evidence at four and trailing evidence at six", () => {
    const result = buildCareerEvolution([
      link(), link({ experienceId: "e2" }), link({ experienceId: "e3" }),
      link({ experienceId: "e4", occurredOn: "2026-04-01" }), link({ experienceId: "e5", occurredOn: "2026-04-02" }),
    ]);
    expect(result.themes[0].points).toMatchObject([
      { evidenceWeight: 4, trailingWeight: 4, band: "Recurring", experienceCount: 3 },
      { evidenceWeight: 4, trailingWeight: 6, band: "Well supported", experienceCount: 2 },
    ]);
  });

  it("separates themes and excludes rejected or unapproved links", () => {
    const result = buildCareerEvolution([
      link(), link({ experienceId: "rejected", status: "rejected" }),
      link({ experienceId: "pending", approvedAt: null }),
      link({ experienceId: "e2", themeId: "t2", themeSlug: "reliability", themeName: "Reliability", strength: 1 }),
    ]);
    expect(result.themes).toHaveLength(2);
    expect(result.themes.flatMap((theme) => theme.supportingRecords.map((record) => record.experienceId))).not.toContain("rejected");
    expect(result.themes[0].points[0].experienceIds).toHaveLength(1);
  });

  it("adds a newly approved experience to its quarter", () => {
    const before = buildCareerEvolution([link()]);
    const after = buildCareerEvolution([link(), link({ experienceId: "new", occurredOn: "2026-04-10", strength: 1 })]);
    expect(before.quarters).toEqual(["2026 Q1"]);
    expect(after.quarters).toEqual(["2026 Q1", "2026 Q2"]);
    expect(after.themes[0].points[1].experienceIds).toEqual(["new"]);
  });

  it("renders empty intervening quarters and does not trail across them", () => {
    const result = buildCareerEvolution([link(), link({ experienceId: "later", occurredOn: "2026-10-01" })]);
    expect(result.quarters).toEqual(["2026 Q1", "2026 Q2", "2026 Q3", "2026 Q4"]);
    expect(result.themes[0].points[3].trailingWeight).toBe(2);
  });
});
