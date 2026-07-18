import type { SourceKind } from "@/lib/db/types";

export type EvolutionBand = "No evidence" | "Emerging" | "Recurring" | "Well supported";

export interface EvolutionInput {
  experienceId: string;
  title: string;
  occurredOn: string;
  themeId: string;
  themeSlug: string;
  themeName: string;
  strength: 1 | 2;
  rationale: string;
  sourceKind: SourceKind;
  status: "proposed" | "accepted" | "rejected";
  approvedAt: string | null;
}

export interface EvolutionPoint {
  quarter: string;
  evidenceWeight: number;
  trailingWeight: number;
  band: EvolutionBand;
  experienceIds: string[];
  experienceCount: number;
}

export interface EvolutionTheme {
  id: string;
  slug: string;
  name: string;
  points: EvolutionPoint[];
  supportingRecords: Array<{
    experienceId: string;
    title: string;
    occurredOn: string;
    quarter: string;
    rationale: string;
    strength: 1 | 2;
    sourceKind: SourceKind;
  }>;
}

export interface CareerEvolutionView {
  quarters: string[];
  themes: EvolutionTheme[];
}

export function quarterForDate(date: string) {
  const [year, month] = date.split("-").map(Number);
  return `${year} Q${Math.floor((month - 1) / 3) + 1}`;
}

function bandForWeight(weight: number): EvolutionBand {
  if (weight === 0) return "No evidence";
  if (weight <= 2) return "Emerging";
  if (weight <= 4) return "Recurring";
  return "Well supported";
}

function continuousQuarters(labels: string[]) {
  if (!labels.length) return [];
  const ordinal = (label: string) => { const [year, quarter] = label.split(" Q").map(Number); return year * 4 + quarter - 1; };
  const start = Math.min(...labels.map(ordinal)); const end = Math.max(...labels.map(ordinal));
  return Array.from({ length: end - start + 1 }, (_, offset) => {
    const value = start + offset; return `${Math.floor(value / 4)} Q${value % 4 + 1}`;
  });
}

export function buildCareerEvolution(inputs: EvolutionInput[]): CareerEvolutionView {
  const accepted = inputs.filter((item) => item.status === "accepted" && item.approvedAt);
  const quarters = continuousQuarters([...new Set(accepted.map((item) => quarterForDate(item.occurredOn)))]);
  const themeMap = new Map<string, EvolutionInput[]>();
  for (const item of accepted) themeMap.set(item.themeId, [...(themeMap.get(item.themeId) ?? []), item]);

  return {
    quarters,
    themes: [...themeMap.values()].map((records) => {
      const first = records[0];
      const rawWeights = quarters.map((quarter) => Math.min(4, records
        .filter((item) => quarterForDate(item.occurredOn) === quarter)
        .reduce((sum, item) => sum + item.strength, 0)));
      return {
        id: first.themeId,
        slug: first.themeSlug,
        name: first.themeName,
        points: quarters.map((quarter, index) => {
          const quarterRecords = records.filter((item) => quarterForDate(item.occurredOn) === quarter);
          const trailingWeight = Math.min(6, rawWeights[index] + (rawWeights[index - 1] ?? 0));
          return {
            quarter,
            evidenceWeight: rawWeights[index],
            trailingWeight,
            band: bandForWeight(trailingWeight),
            experienceIds: [...new Set(quarterRecords.map((item) => item.experienceId))],
            experienceCount: new Set(quarterRecords.map((item) => item.experienceId)).size,
          };
        }),
        supportingRecords: records.map((item) => ({
          experienceId: item.experienceId, title: item.title, occurredOn: item.occurredOn,
          quarter: quarterForDate(item.occurredOn), rationale: item.rationale,
          strength: item.strength, sourceKind: item.sourceKind,
        })),
      };
    }).sort((a, b) => a.name.localeCompare(b.name)),
  };
}
