insert into public.careerthread_health (id)
values (1)
on conflict (id) do update set checked_at = now();

insert into public.profiles (id, display_name, headline, demo_mode)
values (
  '00000000-0000-4000-8000-000000000001',
  'Maya Chen',
  'Senior Software Engineer · Platform & Developer Experience',
  true
)
on conflict (id) do update set
  display_name = excluded.display_name,
  headline = excluded.headline,
  demo_mode = excluded.demo_mode;

insert into public.themes (id, profile_id, slug, name, description) values
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'technical-leadership', 'Technical Leadership', 'Guiding technical direction and helping others make durable decisions.'),
  ('10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'developer-experience', 'Developer Experience', 'Making engineering systems easier and safer to use.'),
  ('10000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', 'mentorship', 'Mentorship', 'Growing the confidence and capability of other engineers.'),
  ('10000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000001', 'reliability', 'Reliability', 'Improving operational resilience and learning from incidents.'),
  ('10000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000001', 'cross-functional-influence', 'Cross-functional Influence', 'Aligning engineering work with partners and customer needs.'),
  ('10000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000001', 'product-thinking', 'Product Thinking', 'Connecting technical choices to meaningful user outcomes.')
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description;

insert into public.experiences (
  id, profile_id, title, occurred_on, summary, ownership, interpretation,
  uncertainty, source_kind, confidence, approved_at
) values
  ('20000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'Simplified the local development setup', '2025-02-14', 'Reworked the local setup path after noticing new engineers repeatedly lost time to undocumented dependencies.', 'Initiated the work and coordinated feedback from recent hires.', 'This is an early example of developer-experience leadership grounded in observed friction.', null, 'user_report', 'supported', '2025-02-18T16:00:00Z'),
  ('20000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'Mentored an engineer through service ownership', '2025-05-09', 'Created a gradual ownership plan for an engineer taking responsibility for a critical internal service.', 'Designed the plan and held weekly technical reviews.', 'The experience suggests mentorship through durable capability-building rather than task assistance.', null, 'user_report', 'supported', '2025-05-12T16:00:00Z'),
  ('20000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', 'Led follow-through after a production incident', '2025-08-22', 'Facilitated a blameless review and coordinated the highest-priority reliability improvements after an authentication incident.', 'Owned the review and follow-up plan across two teams.', 'This combines reliability work with cross-team technical leadership.', null, 'user_report', 'supported', '2025-08-25T16:00:00Z'),
  ('20000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000001', 'Aligned teams on an API migration', '2025-11-07', 'Developed a staged migration proposal that resolved competing constraints between platform and product teams.', 'Authored the proposal and facilitated the decision meetings.', 'The record shows growing influence beyond a single codebase.', null, 'user_report', 'supported', '2025-11-10T16:00:00Z'),
  ('20000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000001', 'Introduced safer deployment checks', '2026-02-20', 'Added pre-deployment checks and a clearer rollback guide after identifying repeated release uncertainty.', 'Proposed and implemented the first version with the release working group.', 'This strengthens a recurring thread of making engineering systems safer to use.', null, 'user_report', 'supported', '2026-02-23T16:00:00Z'),
  ('20000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000001', 'Turned support patterns into a product proposal', '2026-05-15', 'Synthesized recurring support themes into a proposal for self-service diagnostics and partnered with product on scope.', 'Initiated the analysis and co-authored the proposal.', 'This connects technical judgment with customer and product context.', 'The proposal has not shipped yet, so outcome evidence is still emerging.', 'user_report', 'reported', '2026-05-18T16:00:00Z')
on conflict (id) do update set
  title = excluded.title,
  occurred_on = excluded.occurred_on,
  summary = excluded.summary,
  ownership = excluded.ownership,
  interpretation = excluded.interpretation,
  uncertainty = excluded.uncertainty,
  confidence = excluded.confidence;

insert into public.impacts (
  id, profile_id, experience_id, description, metric_value, metric_unit,
  scope, source_kind, confidence, approved_at
) values
  ('30000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'Reduced the documented setup path from roughly half a day to under one hour for the next three hires.', '1', 'hour', 'Three new engineers', 'evidence', 'supported', '2025-02-18T16:00:00Z'),
  ('30000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', 'The engineer independently led the next service release and became its primary reviewer.', null, null, 'One engineer and one service', 'evidence', 'supported', '2025-05-12T16:00:00Z'),
  ('30000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000003', 'Closed the two highest-risk incident follow-ups before the next release cycle.', '2', 'follow-ups', 'Two engineering teams', 'evidence', 'supported', '2025-08-25T16:00:00Z'),
  ('30000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000004', 'Enabled both teams to complete the migration without a coordinated release freeze.', null, null, 'Platform and product engineering', 'user_report', 'reported', '2025-11-10T16:00:00Z'),
  ('30000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000005', 'Gave release owners a repeatable go/no-go check and documented recovery path.', null, null, 'Release working group', 'evidence', 'supported', '2026-02-23T16:00:00Z'),
  ('30000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000006', 'Created an agreed problem statement and candidate scope; delivery impact is not yet available.', null, null, 'Support, product, and engineering', 'user_report', 'needs_evidence', '2026-05-18T16:00:00Z')
on conflict (id) do update set description = excluded.description, confidence = excluded.confidence;

insert into public.evidence (
  id, profile_id, experience_id, kind, label, note_or_excerpt, url, source_kind
) values
  ('40000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'note', 'Onboarding follow-up note', 'Three new engineers completed the revised setup in under one hour.', null, 'evidence'),
  ('40000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', 'note', 'Mentorship outcome note', 'The engineer led the following release and took over primary review responsibility.', null, 'evidence'),
  ('40000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000003', 'note', 'Incident action register', 'The two highest-risk actions were marked complete before the next release.', null, 'evidence'),
  ('40000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000004', 'note', 'Migration decision record', 'Both teams approved the staged migration and named owners for each phase.', null, 'evidence'),
  ('40000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000005', 'note', 'Release working-group feedback', 'Release owners adopted the checklist and rollback guide for the following cycle.', null, 'evidence'),
  ('40000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000006', 'note', 'Product discovery summary', 'Partners agreed on the recurring support patterns; outcome evidence remains pending.', null, 'evidence')
on conflict (id) do update set label = excluded.label, note_or_excerpt = excluded.note_or_excerpt;

insert into public.experience_themes (
  experience_id, theme_id, profile_id, strength, rationale, status, source_kind, approved_at
) values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 2, 'Removed repeated setup friction and established a clearer path for future engineers.', 'accepted', 'ai_interpretation', '2025-02-18T16:00:00Z'),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', 2, 'Built another engineer’s independent ownership over time.', 'accepted', 'ai_interpretation', '2025-05-12T16:00:00Z'),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 1, 'Used technical review to transfer durable decision-making capability.', 'accepted', 'ai_interpretation', '2025-05-12T16:00:00Z'),
  ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000001', 2, 'Converted incident learning into completed reliability work.', 'accepted', 'ai_interpretation', '2025-08-25T16:00:00Z'),
  ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 2, 'Led review and follow-through across two teams.', 'accepted', 'ai_interpretation', '2025-08-25T16:00:00Z'),
  ('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000001', 2, 'Aligned competing team constraints into a shared migration decision.', 'accepted', 'ai_interpretation', '2025-11-10T16:00:00Z'),
  ('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 2, 'Set technical direction beyond a single codebase.', 'accepted', 'ai_interpretation', '2025-11-10T16:00:00Z'),
  ('20000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000001', 1, 'Introduced preventive checks and a recovery path.', 'accepted', 'ai_interpretation', '2026-02-23T16:00:00Z'),
  ('20000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 2, 'Made releases easier and safer for other engineers.', 'accepted', 'ai_interpretation', '2026-02-23T16:00:00Z'),
  ('20000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000001', 2, 'Connected support patterns to a scoped product opportunity.', 'accepted', 'ai_interpretation', '2026-05-18T16:00:00Z'),
  ('20000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000001', 1, 'Built shared understanding across support, product, and engineering.', 'accepted', 'ai_interpretation', '2026-05-18T16:00:00Z')
on conflict (experience_id, theme_id) do update set
  strength = excluded.strength,
  rationale = excluded.rationale,
  status = excluded.status,
  approved_at = excluded.approved_at;

insert into public.insights (
  id, profile_id, title, body, status, source_kind, confidence_label, generated_at
) values (
  '50000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000001',
  'Your influence is moving from systems to shared direction',
  'Across incident follow-through, API migration planning, and release practices, your strongest recent examples pair technical judgment with making decisions easier for other teams.',
  'accepted',
  'ai_interpretation',
  'recurring',
  '2026-06-01T16:00:00Z'
)
on conflict (id) do update set title = excluded.title, body = excluded.body;

insert into public.goals (id, profile_id, title, status, target_date, source_kind)
values (
  '60000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000001',
  'Build a promotion case around cross-team technical leadership',
  'active',
  '2026-09-30',
  'user_report'
)
on conflict (id) do update set title = excluded.title, status = excluded.status, target_date = excluded.target_date;
