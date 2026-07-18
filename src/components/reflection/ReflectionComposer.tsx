"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function ReflectionComposer() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [question, setQuestion] = useState<string | null>(null);
  const [generationMode, setGenerationMode] = useState<"live" | "heuristic" | null>(null);
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(null);
    const response = await fetch("/api/reflections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, inputMode: "text" }) });
    const payload = await response.json(); setBusy(false);
    if (!response.ok) return setError(payload.error?.message ?? "Could not start reflection.");
    setSessionId(payload.data.sessionId); setQuestion(payload.data.followUp.question); setGenerationMode(payload.data.followUp.generationMode);
  }

  async function extract(skipFollowUp = false) {
    if (!sessionId) return; setBusy(true); setError(null);
    const response = await fetch(`/api/reflections/${sessionId}/extract`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answer, skipFollowUp }) });
    const payload = await response.json(); setBusy(false);
    if (!response.ok) return setError(payload.error?.message ?? "Could not build the draft.");
    router.push(`/review/${payload.data.draftId}`);
  }

  return (
    <div className="reflection-card">
      <div className="fixture-notice"><strong>Review before saving</strong><span>AI suggestions stay separate from your record until you accept them.</span></div>
      {!sessionId ? (
        <form onSubmit={start}>
          <label htmlFor="reflection">What happened in your work recently?</label>
          <textarea id="reflection" value={text} onChange={(event) => setText(event.target.value)} placeholder="I helped the team…" rows={8} required />
          <button className="primary-action" disabled={busy} type="submit">{busy ? "Saving…" : "Continue reflection"}</button>
        </form>
      ) : (
        <div>
          <p className="card-label">One useful follow-up · {generationMode === "live" ? "Live AI" : "Heuristic fallback"}</p><h2>{question}</h2>
          <label htmlFor="answer">Your answer</label>
          <textarea id="answer" value={answer} onChange={(event) => setAnswer(event.target.value)} rows={5} />
          <div className="action-row"><button className="primary-action" disabled={busy} onClick={() => extract(false)} type="button">{busy ? "Building draft…" : "Review interpretation"}</button><button className="text-action" disabled={busy} onClick={() => extract(true)} type="button">Skip</button></div>
        </div>
      )}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </div>
  );
}
