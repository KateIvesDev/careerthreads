import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CareerRecordHome } from "@/components/record/CareerRecordHome";
import type { CareerRecordView } from "@/lib/db/types";

const record: CareerRecordView = {
  profile: {
    id: "profile",
    displayName: "Maya Chen",
    headline: "Senior Software Engineer",
  },
  experiences: [
    {
      id: "experience",
      title: "Simplified local setup",
      occurredOn: "2026-05-01",
      summary: "Made onboarding more reliable.",
      confidence: "supported",
      sourceKind: "user_report",
      impact: "New engineers started faster.",
      evidenceCount: 1,
    },
  ],
  themes: [
    {
      id: "theme",
      slug: "developer-experience",
      name: "Developer Experience",
      description: "Making systems easier to use.",
      experienceCount: 1,
    },
  ],
  evolution: { quarters: [], themes: [] },
  insight: null,
  goal: null,
};

describe("Career Record home", () => {
  it("makes the structured record the primary product", () => {
    render(<CareerRecordHome record={record} />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Maya Chen's professional memory",
      }),
    ).toBeDefined();
    expect(screen.getByText("Simplified local setup")).toBeDefined();
    expect(screen.getByText("User reported")).toBeDefined();
  });
});
