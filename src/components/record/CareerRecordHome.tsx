import Link from "next/link";

import { ConfidenceBadge, SourceBadge } from "@/components/provenance/SourceBadge";
import type { CareerRecordView } from "@/lib/db/types";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function CareerRecordHome({ record }: { record: CareerRecordView }) {
  return (
    <main className="record-shell">
      <nav className="record-nav" aria-label="Primary navigation">
        <Link className="wordmark" href="/" aria-label="Career Thread home">
          <span className="wordmark-mark" aria-hidden="true" />
          Career Thread
        </Link>
        <div className="record-nav-links">
          <span className="active-nav">Record</span>
          <Link href="/evolution">Evolution</Link>
          <Link href="/assets/promotion">Assets</Link>
        </div>
      </nav>

      <header className="record-header">
        <div>
          <p className="eyebrow">Career Record</p>
          <h1>{record.profile.displayName}&apos;s professional memory</h1>
          <p>{record.profile.headline}</p>
        </div>
        <Link className="primary-action" href="/reflect">
          Reflect on recent work
        </Link>
      </header>

      <section className="record-grid">
        <div className="record-main-column">
          <div className="section-heading">
            <div>
              <p className="card-label">Recent experiences</p>
              <h2>What you&apos;ve been building</h2>
            </div>
            <span>{record.experiences.length} approved records</span>
          </div>

          <div className="experience-list">
            {record.experiences.map((experience) => (
              <article className="experience-card" key={experience.id}>
                <div className="experience-date">
                  {dateFormatter.format(new Date(`${experience.occurredOn}T00:00:00Z`))}
                </div>
                <div>
                  <h3>{experience.title}</h3>
                  <p>{experience.summary}</p>
                  {experience.impact ? (
                    <p className="impact-line">
                      <strong>Impact</strong> {experience.impact}
                    </p>
                  ) : null}
                  <div className="badge-row">
                    <SourceBadge sourceKind={experience.sourceKind} />
                    <ConfidenceBadge confidence={experience.confidence} />
                    <span className="evidence-count">
                      {experience.evidenceCount} evidence note
                      {experience.evidenceCount === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="record-side-column">
          <section className="side-card themes-card">
            <p className="card-label">Current threads</p>
            <h2>Themes in your record</h2>
            <div className="theme-list">
              {record.themes.slice(0, 5).map((theme) => (
                <Link className="theme-row" href={`/evolution#${theme.slug}`} key={theme.id}>
                  <div>
                    <strong>{theme.name}</strong>
                    <span>{theme.experienceCount} experiences</span>
                  </div>
                  <span className="theme-mark" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>

          {record.insight ? (
            <section className="side-card insight-card">
              <div className="badge-row">
                <SourceBadge sourceKind={record.insight.sourceKind} />
                <span className="source-badge status-accepted">You approved</span>
              </div>
              <h2>{record.insight.title}</h2>
              <p>{record.insight.body}</p>
            </section>
          ) : null}

          {record.goal ? (
            <section className="side-card goal-card">
              <p className="card-label">Active goal</p>
              <h2>{record.goal.title}</h2>
              <p>
                Target {record.goal.targetDate ? dateFormatter.format(new Date(`${record.goal.targetDate}T00:00:00Z`)) : "date open"}
              </p>
            </section>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
