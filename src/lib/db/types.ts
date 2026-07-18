export type SourceKind =
  | "user_report"
  | "evidence"
  | "ai_interpretation"
  | "derived";

export type Confidence = "reported" | "supported" | "needs_evidence";

export interface RecordExperience {
  id: string;
  title: string;
  occurredOn: string;
  summary: string;
  confidence: Confidence;
  sourceKind: SourceKind;
  impact: string | null;
  evidenceCount: number;
}

export interface RecordTheme {
  id: string;
  slug: string;
  name: string;
  description: string;
  experienceCount: number;
}

export interface CareerRecordView {
  profile: {
    id: string;
    displayName: string;
    headline: string;
  };
  experiences: RecordExperience[];
  themes: RecordTheme[];
  evolution: import("@/lib/domain/career-evolution").CareerEvolutionView;
  insight: {
    title: string;
    body: string;
    sourceKind: SourceKind;
  } | null;
  goal: {
    title: string;
    targetDate: string | null;
  } | null;
}
