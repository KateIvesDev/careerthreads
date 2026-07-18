import Link from "next/link";
import { notFound } from "next/navigation";
import { ReviewEditor } from "@/components/review/ReviewEditor";
import { getExperienceDraft } from "@/lib/db/queries";

export default async function ReviewPage({ params }: { params: Promise<{ draftId: string }> }) {
  const { draftId } = await params; const draft = await getExperienceDraft(draftId); if (!draft || draft.status !== "proposed") notFound();
  const generationLabel = draft.generation_mode === "live" ? "Live AI draft" : "Demo fixture response";
  return <main className="flow-shell review-shell"><Link className="back-link" href="/">← Career Record</Link><header><div className="badge-row"><span className="source-badge source-ai_interpretation">{generationLabel}</span><span className="source-badge">Not yet accepted</span></div><p className="eyebrow">Review interpretation</p><h1>Decide what belongs in your record.</h1><p>Facts, evidence, impact, and AI interpretation remain separate. Edit or reject anything that does not feel accurate.</p></header><ReviewEditor draftId={draft.id} initialDraft={draft.payload_json} initialRevision={draft.revision} generationMode={draft.generation_mode} /></main>;
}
