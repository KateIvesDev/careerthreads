import type { Confidence, SourceKind } from "@/lib/db/types";

const sourceLabels: Record<SourceKind, string> = {
  user_report: "User reported",
  evidence: "Evidence",
  ai_interpretation: "AI interpretation",
  derived: "Derived",
};

const confidenceLabels: Record<Confidence, string> = {
  reported: "Reported",
  supported: "Supported",
  needs_evidence: "Needs evidence",
};

export function SourceBadge({ sourceKind }: { sourceKind: SourceKind }) {
  return <span className={`source-badge source-${sourceKind}`}>{sourceLabels[sourceKind]}</span>;
}

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  return <span className={`source-badge confidence-${confidence}`}>{confidenceLabels[confidence]}</span>;
}
