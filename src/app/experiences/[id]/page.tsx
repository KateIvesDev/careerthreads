import Link from "next/link";
import { notFound } from "next/navigation";
import { ApprovedExperienceEditor } from "@/components/review/ApprovedExperienceEditor";
import { getExperienceDetail, getThemeVocabulary } from "@/lib/db/queries";

export default async function ExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const [experience, vocabulary] = await Promise.all([getExperienceDetail(id), getThemeVocabulary()]); if (!experience) notFound();
  const themeLinks = experience.themes.flatMap((link) => link.themes[0] ? [{ ...link, theme: link.themes[0] }] : []);
  const initialEdit = { revision: experience.revision, title: experience.title, occurredOn: experience.occurred_on, summary: experience.summary, ownership: experience.ownership,
    impacts: experience.impacts.map((impact) => ({ id: impact.id, description: impact.description })), evidence: experience.evidence.map((item) => ({ id: item.id, label: item.label, noteOrExcerpt: item.note_or_excerpt, url: item.url })),
    themes: themeLinks.map((link) => ({ themeId: link.theme_id, rationale: link.rationale, strength: link.strength as 1 | 2 })), };
  return <main className="flow-shell detail-shell"><Link className="back-link" href="/evolution">← Career Evolution</Link><header><p className="eyebrow">Approved experience</p><h1>{experience.title}</h1><p>{experience.occurred_on}</p><div className="badge-row"><span className="source-badge source-user_report">{experience.source_kind.replaceAll("_", " ")}</span><span className={`source-badge confidence-${experience.confidence}`}>{experience.confidence.replaceAll("_", " ")}</span><span className="source-badge status-accepted">Approved {new Date(experience.approved_at).toLocaleDateString("en-US", { timeZone: "UTC" })}</span></div></header>
    <section className="review-card"><span className="source-badge source-user_report">User report</span><h2>What happened</h2><p>{experience.summary}</p>{experience.ownership ? <p><strong>Ownership:</strong> {experience.ownership}</p> : null}</section>
    {experience.impacts.map((impact) => <section className="review-card" key={impact.id}><span className={`source-badge confidence-${impact.confidence}`}>{impact.confidence.replaceAll("_", " ")}</span><h2>Impact</h2><p>{impact.description}</p></section>)}
    {themeLinks.map((link) => <section className="review-card interpretation-card" key={link.theme.slug}><span className="source-badge source-ai_interpretation">{link.source_kind.replaceAll("_", " ")} · you approved</span><h2>{link.theme.name}</h2><p>{link.rationale}</p></section>)}
    {experience.interpretation ? <section className="review-card interpretation-card"><span className="source-badge source-ai_interpretation">AI interpretation · you approved</span><h2>Interpretation</h2><p>{experience.interpretation}</p>{experience.uncertainty ? <p className="uncertainty">Uncertainty: {experience.uncertainty}</p> : null}</section> : null}
    {experience.evidence.map((item) => <section className="review-card" key={item.id}><span className="source-badge source-evidence">Evidence</span><h2>{item.label}</h2>{item.note_or_excerpt ? <p>{item.note_or_excerpt}</p> : null}{item.url?.startsWith("https://") ? <a href={item.url} rel="noreferrer">Open supporting link</a> : null}</section>)}
    <ApprovedExperienceEditor experienceId={experience.id} initial={initialEdit} vocabulary={vocabulary}/>
  </main>;
}
