# Career Thread MVP Implementation Checklist

**Status:** Proposed execution checklist; application code not started  
**Source:** `docs/technical-design.md`  
**Target demo:** July 21, 2026  
**Primary track:** Apps for Your Life  

## How to Use This Checklist

Implement slices in order. A slice is complete only when its user-visible outcome works and every required acceptance criterion passes. Do not start optional work merely because one task within a required slice is blocked; finish other safe tasks in the same slice and return to the blocker.

Each task declares:

- **Files:** concrete files expected to be created or changed. Small naming adjustments are acceptable if documented.
- **Dependencies:** earlier tasks, services, credentials, or decisions needed first.
- **Verification:** commands to run after implementation. These are the required script interfaces; create the corresponding `package.json` scripts in Slice 0.
- **Acceptance:** observable completion conditions.
- **Cutoff:** `REQUIRED` means the task must ship before the cutoff. `OPTIONAL` means abandon it if any required slice is incomplete or unstable.

The commands assume npm and the repository root. Where a route needs a running app, use `npm run dev` in one terminal and the shown command in another. Never put secrets directly in a command or commit them.

## Scope Guardrails

The cutoff scope is exactly:

> Text capture → one live follow-up → validated extraction → editable approval → structured persisted Career Record → deterministic Career Evolution → one evidence-linked promotion section → reliability, deployment, tests, and truthful submission disclosure.

Do not add the following before all required tasks pass:

- authentication or multiple profiles,
- résumé bullets or STAR stories,
- external work-platform integrations,
- document parsing, OCR, embeddings, RAG, or vector search,
- background jobs or agent frameworks,
- reminders, analytics, sharing, billing, or administration,
- generalized design systems,
- voice, file uploads, or live insight generation.

Evidence notes and HTTPS links are required because provenance is required. Evidence **file upload** is optional.

## Global Verification Commands

The first slice must establish these stable commands. Subsequent tasks may reference a narrower subset.

```bash
npm run lint
npm run typecheck
npm run test
npm run test:unit
npm run test:integration
npm run test:e2e
npm run build
npm run db:migrate
npm run db:seed
npm run db:verify
npm run smoke -- http://localhost:3000
```

Before a task is checked off, also inspect `git diff --check` and `git status --short` so generated secrets, accidental fixtures, or unrelated changes are not included.

---

# Slice 0 — Preflight and Deployable Shell

**User-visible outcome:** A branded Career Thread shell runs locally and at a production URL. Required configuration is validated, Supabase is reachable, and a server-only structured OpenAI smoke call succeeds using `OPENAI_MODEL` without a hardcoded model identifier.

**Slice dependencies:** Vercel project, Supabase project, OpenAI project/key, hackathon-provided GPT-5.6 model value.

**Slice exit gate:** Do not begin the walking skeleton until local build, production deployment, database connectivity, and configured-model smoke call have each succeeded at least once.

### 0.1 Scaffold and pin the modular monolith

- [x] Create the minimal Next.js App Router project with TypeScript, Tailwind CSS, ESLint, npm, and the `@/*` alias. Pin the Node runtime and commit the lockfile.
- **Files:** `package.json`, `package-lock.json`, `.nvmrc`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `public/`, `.gitignore`.
- **Dependencies:** None beyond installed Node/npm. Use current stable releases at scaffold time; record the resolved versions rather than guessing them in advance.
- **Verification:** `npm ci`; `npm run lint`; `npm run typecheck`; `npm run build`; `git diff --check`.
- **Acceptance:** `/` renders a minimal “Career Thread” shell; build uses the pinned Node engine; lockfile is committed; no template marketing page remains; no application feature beyond the shell is implemented yet.
- **Cutoff:** **REQUIRED**.

### 0.2 Establish scripts, test harnesses, and directory boundaries

- [x] Add Vitest, React Testing Library where needed, and Playwright. Create empty-but-running unit, integration, and E2E smoke suites. Establish the target folders from the technical design.
- **Files:** `package.json`, `vitest.config.ts`, `playwright.config.ts`, `tests/unit/smoke.test.ts`, `tests/integration/smoke.test.ts`, `tests/e2e/shell.spec.ts`, `src/components/ui/`, `src/lib/ai/`, `src/lib/auth/`, `src/lib/db/`, `src/lib/domain/`, `src/lib/validation/`.
- **Dependencies:** Task 0.1.
- **Verification:** `npm run test:unit`; `npm run test:integration`; `npm run test:e2e`; `npm run lint`; `npm run typecheck`.
- **Acceptance:** All global script names exist; each suite finds and runs at least one test; Playwright can open the local shell; source folders contain only useful starter modules or tracked placeholders supported by the framework.
- **Cutoff:** **REQUIRED**.

### 0.3 Add typed environment validation and server-only boundaries

- [x] Validate all required server variables at startup/use and expose only safe public variables. Require `OPENAI_MODEL`; never place a model identifier literal in application code. Prevent server modules from being imported into client components.
- **Files:** `.env.example`, `.env.1password.example`, `.gitignore`, `src/lib/env.ts`, `src/lib/ai/client.ts`, `src/lib/db/client.ts`, `scripts/secrets-check.ts`, `tests/unit/env.test.ts`.
- **Dependencies:** Tasks 0.1–0.2; official OpenAI and Supabase SDK packages.
- **Verification:** `npm run test:unit -- env`; `npm run typecheck`; `npm run build`; manually run the app once with a required variable absent.
- **Acceptance:** Missing variables produce a concise error naming only the missing keys; `.env.local`, `.env.1password`, and credentials are ignored; local secrets are injected with `op run`; `OPENAI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` never enter the client bundle; `OPENAI_MODEL` is read only through the shared adapter; repository search finds no concrete GPT-5.6 model identifier.
- **Cutoff:** **REQUIRED**.

### 0.4 Provision Supabase connectivity and migration workflow

- [x] Configure server-only Postgres access and repeatable migration/seed/verify scripts without introducing an ORM. At this stage a connectivity migration is sufficient; the domain schema arrives in Slice 1.
- **Files:** `supabase/config.toml` if the CLI workflow uses it, `supabase/migrations/0001_bootstrap.sql`, `scripts/db-migrate.mjs`, `scripts/db-seed.mjs`, `scripts/db-verify.mjs`, `src/lib/db/client.ts`, `package.json`, `.env.example`.
- **Dependencies:** Supabase project and Task 0.3.
- **Verification:** locally use `npm run db:migrate:secure`, `npm run db:seed:secure`, and `npm run db:verify:secure`; CI may use the ordinary commands with platform-injected variables; run the three commands a second time.
- **Acceptance:** Scripts work against the configured development project, do not print credentials, are safe to rerun, fail clearly when configuration is absent, and do not rely on globally installed tooling.
- **Cutoff:** **REQUIRED**.

### 0.5 Implement health and configured-model smoke checks

- [ ] Add a protected/non-sensitive health route and CLI smoke check that verifies app, database, and one minimal strict-structured OpenAI response using `OPENAI_MODEL`. Do not return secrets or raw provider errors to browsers.
- **Files:** `src/app/api/health/route.ts`, `src/lib/ai/client.ts`, `src/lib/ai/schemas.ts`, `scripts/smoke.mjs`, `tests/integration/health.test.ts`, `package.json`.
- **Dependencies:** Tasks 0.3–0.4; valid OpenAI and Supabase credentials.
- **Verification:** `npm run test:integration -- health`; `npm run smoke -- http://localhost:3000`; `npm run build`; repeat smoke with an invalid `OPENAI_MODEL` in a safe local environment.
- **Acceptance:** A valid environment reports app/database/model readiness; invalid configuration fails with a useful non-secret status; request metadata records the configured model returned by the provider; source code contains no model ID literal.
- **Cutoff:** **REQUIRED**.

### 0.6 Deploy the shell immediately

- [ ] Connect Vercel, configure Preview and Production variables, deploy the shell, and run the remote smoke check.
- **Files:** `README.md` initial deployment notes, `vercel.json` only if required, Vercel project configuration outside the repository.
- **Dependencies:** Tasks 0.1–0.5; Vercel access.
- **Verification:** `npm run build`; `npm run smoke -- https://<deployment-host>`; open the URL in a clean browser.
- **Acceptance:** Production URL renders; database and configured model smoke checks succeed; authenticated/private caching is not enabled for demo data routes; deployment does not expose secrets; the URL is recorded in a private submission checklist if not yet public.
- **Cutoff:** **REQUIRED**.

---

# Slice 1 — Walking Skeleton: Structured Career Record

**User-visible outcome:** A fictional seeded Career Record opens as the home screen. A user enters a text reflection, sees a fixture-backed draft, edits it, approves it, refreshes, and sees a new structured experience. This must work before live AI or chart polish.

**Slice dependencies:** Slice 0 complete.

**Slice exit gate:** The complete fixture-backed path survives refresh and creates normalized records transactionally. This is the non-negotiable end-of-first-session milestone.

### 1.1 Create the minimum relational schema

- [x] Add tables and constraints for Profile, ReflectionSession, ExperienceDraft, Experience, Evidence, Impact, Theme, ExperienceTheme, Insight, Goal, CareerAsset, and ProvenanceLink. Use UUIDs/UTC, explicit status/source/confidence checks, ownership columns, and a unique ExperienceTheme pair.
- **Files:** `supabase/migrations/0002_career_record_schema.sql`, `src/lib/db/types.ts`, `docs/data-model.md` only if generated/maintained as a schema reference.
- **Dependencies:** Task 0.4; domain model in the technical design.
- **Verification:** `npm run db:migrate`; `npm run db:verify`; `npm run test:integration -- schema`; inspect migration in a fresh database or temporary schema.
- **Acceptance:** All required entities exist; draft JSON is separate from accepted normalized records; foreign keys prevent orphan core rows; source/status/confidence values are constrained; repeated migration is safe; there is no generic arbitrary graph or chat-message system.
- **Cutoff:** **REQUIRED**.

### 1.2 Build fictional seed data and deterministic reset SQL foundation

- [x] Seed one fictional profile, 5–7 approved experiences over 12–18 months, 5–7 fixed themes, impacts, safe evidence notes/links, ExperienceTheme links, one accepted insight, and one active goal. Use stable IDs needed by fixtures/tests.
- **Files:** `supabase/seed.sql`, `tests/fixtures/seed-expectations.ts`, `docs/demo-data.md` or README seed disclosure section.
- **Dependencies:** Task 1.1; original creator-owned text only.
- **Verification:** `npm run db:seed`; `npm run db:verify`; run seed twice; query counts through an integration test.
- **Acceptance:** Seed is idempotent; dates cover at least four quarters; at least three themes recur; evidence includes only neutral note/HTTPS-link metadata; company/person names are fictional; README/docs clearly call the historical record seeded; no third-party trademarks or confidential data appear.
- **Cutoff:** **REQUIRED**.

### 1.3 Implement server-scoped demo profile repositories

- [x] Resolve `DEMO_PROFILE_ID` server-side and create narrow typed query/mutation functions. Every query must scope to this profile; browser inputs never select ownership.
- **Files:** `src/lib/auth/demo-profile.ts`, `src/lib/db/queries.ts`, `src/lib/db/mutations.ts`, `src/lib/db/types.ts`, `tests/integration/profile-scope.test.ts`.
- **Dependencies:** Tasks 0.3, 1.1–1.2.
- **Verification:** `npm run test:integration -- profile-scope`; `npm run typecheck`; `npm run lint`.
- **Acceptance:** Querying an ID belonging to another/unknown profile returns not found; mutations cannot override profile ownership; repository errors are mapped without leaking SQL or credentials; no route directly assembles raw SQL.
- **Cutoff:** **REQUIRED**.

### 1.4 Build the Career Record read model and home screen

- [x] Create `GET /api/record` and the server-rendered home screen showing profile, recent experiences, theme summary, seeded insight, evidence state, goal, and a prominent Reflect action. The home must not resemble a chatbot.
- **Files:** `src/app/api/record/route.ts`, `src/app/page.tsx`, `src/app/loading.tsx`, `src/app/error.tsx`, `src/components/record/RecordHeader.tsx`, `src/components/record/ExperienceCard.tsx`, `src/components/record/ThemeSummary.tsx`, `src/components/provenance/SourceBadge.tsx`, `src/lib/db/queries.ts`, `src/lib/validation/api.ts`.
- **Dependencies:** Task 1.3.
- **Verification:** `npm run test:integration -- record`; `npm run test:e2e -- shell`; `npm run lint`; `npm run typecheck`; manual refresh at `/`.
- **Acceptance:** Only approved experiences appear; seeded/AI/derived labels are accurate; recent experiences link to stable detail URLs; loading and database failure states are comprehensible; Reflect is the primary CTA; Career Record is unmistakably the primary surface.
- **Cutoff:** **REQUIRED**.

### 1.5 Define versioned extraction fixtures and schemas

- [x] Define the full `ExperienceExtraction` Zod/JSON schema and one rehearsed valid fixture, including facts, impacts, evidence suggestion, allowed themes, interpretation, uncertainty, source references, model/prompt/schema versions, and `generationMode: fixture`.
- **Files:** `src/lib/ai/schemas.ts`, `src/lib/ai/fixtures.ts`, `tests/fixtures/reflection.ts`, `tests/unit/extraction-schema.test.ts`.
- **Dependencies:** Tasks 1.1–1.2; fixed theme vocabulary.
- **Verification:** `npm run test:unit -- extraction-schema`; `npm run typecheck`; mutate fixture fields in negative tests.
- **Acceptance:** Valid fixture parses; missing source refs, unknown theme slugs, invalid dates/statuses, excessive lengths, and unsupported confidence values fail; the fixture contains no facts absent from its rehearsed input; fixture mode is explicit.
- **Cutoff:** **REQUIRED**.

### 1.6 Implement fixture-backed text reflection and extraction routes

- [x] Create a reflection session from text, return a deterministic useful follow-up, accept answer/skip, save a fixture-backed ExperienceDraft, and restore session/draft state after refresh.
- **Files:** `src/app/reflect/page.tsx`, `src/components/reflection/ReflectionComposer.tsx`, `src/components/reflection/FollowUpCard.tsx`, `src/app/api/reflections/route.ts`, `src/app/api/reflections/[id]/extract/route.ts`, `src/lib/db/mutations.ts`, `src/lib/db/queries.ts`, `src/lib/ai/fixtures.ts`, `src/lib/validation/reflections.ts`, `tests/integration/reflection-fixture.test.ts`.
- **Dependencies:** Tasks 1.3 and 1.5.
- **Verification:** `npm run test:integration -- reflection-fixture`; `npm run typecheck`; manual submit/answer/skip/refresh flows.
- **Acceptance:** Empty/oversized text is rejected; initial text is persisted before extraction; exactly one follow-up is shown; refresh returns to the correct stage; extraction saves only a draft; fixture fallback is visibly labeled; typed text is not lost on a handled failure.
- **Cutoff:** **REQUIRED**.

### 1.7 Build review/edit/discard UI and draft save contract

- [x] Render facts, impact, evidence note/link, themes, AI interpretation, and uncertainty in separate editable sections. Support explicit discard and a basic full-draft save before approval.
- **Files:** `src/app/review/[draftId]/page.tsx`, `src/components/review/FactEditor.tsx`, `src/components/review/ImpactEditor.tsx`, `src/components/review/ThemeEditor.tsx`, `src/components/review/EvidenceEditor.tsx`, `src/components/review/ApprovalBar.tsx`, `src/components/provenance/SourceBadge.tsx`, `src/app/api/drafts/[id]/route.ts`, `src/lib/validation/drafts.ts`.
- **Dependencies:** Task 1.6.
- **Verification:** `npm run test:integration -- drafts`; `npm run typecheck`; manual edit/remove/discard/refresh tests.
- **Acceptance:** User can change factual text, remove impact/theme suggestions, add a note or valid HTTPS evidence link, and see origin labels; AI interpretation never appears as an accepted fact; discard changes no approved records; saved draft survives refresh.
- **Cutoff:** **REQUIRED**.

### 1.8 Implement transactional approval and provenance

- [x] Convert the validated draft into Experience, Impact, Evidence metadata, accepted ExperienceTheme links, and constrained ProvenanceLinks in one transaction. Make approval idempotent.
- **Files:** `src/app/api/drafts/[id]/approve/route.ts`, `src/lib/db/mutations.ts`, `src/lib/domain/provenance.ts`, `src/lib/validation/drafts.ts`, `tests/integration/approve-draft.test.ts`.
- **Dependencies:** Tasks 1.1, 1.7.
- **Verification:** `npm run test:integration -- approve-draft`; `npm run db:verify`; manually double-submit approval; simulate a failed child insert in the integration database.
- **Acceptance:** Successful approval creates all normalized rows and marks the draft accepted; partial failure creates none; duplicate approval returns the existing Experience ID; rejected/unapproved drafts do not enter the Career Record; provenance connects accepted interpretations/fields to valid session fragments.
- **Cutoff:** **REQUIRED**.

### 1.9 Complete the fixture-backed walking-skeleton checkpoint

- [x] Add the first E2E path through home → reflect → follow-up → fixture draft → edit → approve → refreshed home.
- **Files:** `tests/e2e/walking-skeleton.spec.ts`, `playwright.config.ts`, seed/reset test helpers.
- **Dependencies:** Tasks 1.1–1.8.
- **Verification:** `npm run db:seed`; `npm run test:e2e -- walking-skeleton`; `npm run test`; `npm run build`.
- **Acceptance:** The test observes the newly approved experience after a browser reload; source labels remain visible; no live model call is needed for this checkpoint; the flow works manually in the deployed Preview environment.
- **Cutoff:** **REQUIRED**.

---

# Slice 2 — Live Structured GPT-5.6 Operations

**User-visible outcome:** The reflection flow asks one useful live follow-up and extracts a structured, source-aware draft using the GPT-5.6 model configured in `OPENAI_MODEL`. Invalid or unavailable model output never becomes accepted data.

**Slice dependencies:** Slice 1 complete; configured model smoke call from Slice 0 still passes.

**Slice exit gate:** A rehearsed live reflection succeeds, schema/semantic failures are rejected, and fallback mode is visible.

### 2.1 Harden the shared AI adapter

- [x] Centralize official SDK calls, strict response format, timeouts, request metadata, prompt/schema versions, safe error mapping, and server-only logging. Implement at most one retry where the operation permits it.
- **Files:** `src/lib/ai/client.ts`, `src/lib/ai/errors.ts`, `src/lib/ai/telemetry.ts`, `src/lib/env.ts`, `tests/unit/ai-client.test.ts`.
- **Dependencies:** Tasks 0.3, 0.5; OpenAI SDK.
- **Verification:** `npm run test:unit -- ai-client`; `npm run typecheck`; manual timeout/invalid-model test using a safe local override.
- **Acceptance:** All operations use `OPENAI_MODEL`; no raw career content is logged; timeout/refusal/rate-limit/schema errors map to typed safe errors; retry count is bounded; client-side code cannot import the adapter.
- **Cutoff:** **REQUIRED**.

### 2.2 Implement live mentor follow-up generation

- [x] Create the versioned prompt/schema operation that uses the initial reflection and at most five recent approved titles/dates, selects one factual gap, and returns one question of at most 25 words.
- **Files:** `src/lib/ai/follow-up.ts`, `src/lib/ai/schemas.ts`, `src/app/api/reflections/route.ts`, `src/lib/db/queries.ts`, `tests/unit/follow-up-schema.test.ts`, `tests/integration/follow-up-live.test.ts`.
- **Dependencies:** Task 2.1; reflection route from Task 1.6.
- **Verification:** `npm run test:unit -- follow-up`; `npm run test:integration -- follow-up`; run one manual live request; test `DEMO_SAFE_MODE=fallback` with a forced provider error.
- **Acceptance:** Normal mode makes a real configured-model call; question is single-purpose and grounded; `shouldAsk: false` can skip unnecessary follow-up without inventing one; 8-second timeout applies; heuristic/fixture fallback is recorded and visibly labeled.
- **Cutoff:** **REQUIRED**.

### 2.3 Implement live structured extraction and theme suggestion

- [x] Create one network operation with separate prompt/schema responsibilities for fact extraction and allowlisted theme suggestion. Preserve source fragments, null unknowns, uncertainty, and evidence suggestions.
- **Files:** `src/lib/ai/extract.ts`, `src/lib/ai/classify-themes.ts`, `src/lib/ai/schemas.ts`, `src/app/api/reflections/[id]/extract/route.ts`, `tests/unit/extraction-schema.test.ts`, `tests/integration/extraction-live.test.ts`.
- **Dependencies:** Tasks 1.5, 2.1–2.2.
- **Verification:** `npm run test:unit -- extraction`; `npm run test:integration -- extraction`; run the rehearsed reflection live; force malformed fixture responses in tests.
- **Acceptance:** Live output validates against strict schema; themes are limited to the fixed vocabulary and three suggestions; all source refs exist; dates are bounded; unknown values remain null; no AI response writes normalized accepted records; 15-second timeout and one schema retry are enforced.
- **Cutoff:** **REQUIRED**.

### 2.4 Add semantic unsupported-claim validation

- [x] Validate beyond shape: numeric impact tokens must exist in cited session/evidence text, source references must resolve, and theme rationales must cite available fragments. Reject rather than silently repair unsupported output.
- **Files:** `src/lib/domain/provenance.ts`, `src/lib/validation/ai-output.ts`, `tests/unit/unsupported-claims.test.ts`, `tests/fixtures/invalid-ai-output.ts`.
- **Dependencies:** Task 2.3.
- **Verification:** `npm run test:unit -- unsupported-claims`; `npm run test:integration -- extraction`.
- **Acceptance:** Invented metrics, missing source fragments, unknown theme IDs, and empty rationales fail; ordinary punctuation/format variations do not create false numeric matches; rejected output cannot be saved as an accepted draft; user receives retry/manual-entry recovery.
- **Cutoff:** **REQUIRED**.

### 2.5 Finish live/fixture state disclosure in reflection and review

- [x] Display live, heuristic, template, or fixture mode where relevant; show loading/timeout/manual recovery; never represent a fallback as live inference.
- **Files:** `src/components/reflection/ReflectionComposer.tsx`, `src/components/reflection/FollowUpCard.tsx`, `src/app/review/[draftId]/page.tsx`, `src/components/provenance/SourceBadge.tsx`, `src/components/ui/GenerationModeBadge.tsx`.
- **Dependencies:** Tasks 2.2–2.4.
- **Verification:** `npm run test:e2e -- walking-skeleton`; manual `DEMO_SAFE_MODE=off`, `fallback`, and `fixture` checks; `npm run build`.
- **Acceptance:** User can distinguish user report, evidence, AI interpretation, and fallback mode without relying on color; failure retains original text and supports retry/manual continuation; normal successful path shows configured live generation without exposing provider secrets.
- **Cutoff:** **REQUIRED**.

---

# Slice 3 — Deterministic Career Evolution

**User-visible outcome:** The Career Evolution view shows qualitative theme evidence over quarters, updates after approval, and reveals the exact experiences behind every trend point.

**Slice dependencies:** Slices 1–2 complete; approved ExperienceTheme links exist.

**Slice exit gate:** Unit-tested scoring and accessible drill-down work from both seeded data and a newly approved experience.

### 3.1 Implement pure scoring and view-model selectors

- [x] Bucket approved theme links by quarter, sum strength 1/2, cap quarter evidence at 4, calculate trailing two-quarter trend capped at 6, and map qualitative bands. Exclude drafts/rejected links.
- **Files:** `src/lib/domain/career-evolution.ts`, `src/lib/db/queries.ts`, `tests/unit/career-evolution.test.ts`.
- **Dependencies:** Tasks 1.1, 1.8.
- **Verification:** `npm run test:unit -- career-evolution`; `npm run typecheck`.
- **Acceptance:** Tests cover empty data, quarter boundaries, caps, trailing window, multiple themes, rejected/unapproved records, and a newly added experience; results contain underlying experience IDs/counts; no LLM or persisted floating-point score is involved.
- **Cutoff:** **REQUIRED**.

### 3.2 Add evolution data to the Career Record contract

- [x] Extend `CareerRecordView` and `GET /api/record` with deterministic series and supporting-record metadata. Keep ownership and approval filters server-side.
- **Files:** `src/app/api/record/route.ts`, `src/lib/db/queries.ts`, `src/lib/db/types.ts`, `src/lib/domain/career-evolution.ts`, `tests/integration/record-evolution.test.ts`.
- **Dependencies:** Task 3.1.
- **Verification:** `npm run test:integration -- record-evolution`; `npm run typecheck`; inspect seeded response.
- **Acceptance:** Response includes fixed quarter labels, qualitative bands, counts/weights, and allowed Experience IDs; adding/approving a record changes the expected quarter; rejected drafts never change the response.
- **Cutoff:** **REQUIRED**.

### 3.3 Build an accessible Career Evolution visualization

- [x] Render a small SVG or similarly simple chart with theme filters, quarter axis, qualitative labels, keyboard-focusable points, tooltips, explanatory subtitle, and a tabular/list fallback from the same view model.
- **Files:** `src/app/evolution/page.tsx`, `src/components/evolution/EvolutionChart.tsx`, `src/components/evolution/ThemeLegend.tsx`, `src/components/evolution/SupportingRecords.tsx`, `src/components/record/ThemeSummary.tsx`, `src/app/page.tsx`.
- **Dependencies:** Task 3.2.
- **Verification:** `npm run test:e2e -- evolution`; `npm run lint`; manual keyboard and mobile/desktop checks.
- **Acceptance:** Chart says it measures approved Career Record evidence, not performance; no decimals or percentages appear; hover and keyboard focus expose experience count/evidence points; the list fallback communicates the same data; chart failure does not erase the underlying summary.
- **Cutoff:** **REQUIRED**.

### 3.4 Implement trend-to-experience drill-down

- [x] Make each chart point/theme summary open the exact approved supporting experiences and rationales, then link to experience details.
- **Files:** `src/components/evolution/EvolutionChart.tsx`, `src/components/evolution/SupportingRecords.tsx`, `src/app/experiences/[id]/page.tsx`, `src/lib/db/queries.ts`, `tests/e2e/evolution.spec.ts`.
- **Dependencies:** Tasks 3.2–3.3.
- **Verification:** `npm run test:e2e -- evolution`; manually click seeded and newly approved points.
- **Acceptance:** Every visible point resolves to matching records for that theme/quarter; rationale and source-kind labels are visible; unknown/other-profile IDs return not found; navigation back preserves the understandable context.
- **Cutoff:** **REQUIRED**.

---

# Slice 4 — Evidence-Linked Promotion Packet

**User-visible outcome:** The user selects 2–4 approved experiences and generates one editable promotion-packet section. Every claim has working source chips, and unsupported or unknown citations are rejected.

**Slice dependencies:** Slices 1–3 complete; experience details and provenance are queryable.

**Slice exit gate:** A live generated packet and deterministic fallback both contain only approved source IDs; every visible claim drills into a source.

### 4.1 Complete experience detail and provenance presentation

- [x] Build the full Experience detail query/page that separates user report, accepted impact, evidence note/link, AI-suggested interpretation/theme rationale, uncertainty, and approval/source history.
- **Files:** `src/app/experiences/[id]/page.tsx`, `src/app/api/experiences/[id]/route.ts`, `src/components/provenance/ProvenanceDrawer.tsx`, `src/components/provenance/SourceBadge.tsx`, `src/lib/db/queries.ts`, `tests/integration/experience-detail.test.ts`.
- **Dependencies:** Tasks 1.8, 3.4.
- **Verification:** `npm run test:integration -- experience-detail`; `npm run test:e2e -- evolution`; manual seeded/new experience inspection.
- **Acceptance:** Judges can answer why a theme applies and what supports an impact; note/link evidence is safe and clearly labeled; unknown/other-profile records are inaccessible; no file content parsing exists.
- **Cutoff:** **REQUIRED**.

### 4.2 Define promotion-packet schemas and deterministic template

- [x] Define `PromotionPacketDraft`, claim-level evidence states, gaps, source allowlist rules, and a deterministic fallback that directly templates approved summaries/impacts with citations.
- **Files:** `src/lib/ai/schemas.ts`, `src/lib/ai/promotion-packet.ts`, `src/lib/domain/provenance.ts`, `tests/unit/promotion-schema.test.ts`, `tests/unit/promotion-template.test.ts`, `tests/fixtures/promotion.ts`.
- **Dependencies:** Task 4.1.
- **Verification:** `npm run test:unit -- promotion`; test empty/unknown/duplicate source IDs.
- **Acceptance:** Each claim requires at least one source; template uses no text beyond selected approved records and neutral connectors; gaps are explicit; 2–4 selected experiences are enforced; generated mode is `live`, `template`, or `fixture`.
- **Cutoff:** **REQUIRED**.

### 4.3 Implement live grounded promotion generation

- [x] Build a compact server-owned context from selected approved Experiences, Impacts, evidence metadata/excerpts, themes, and goal/title context. Call the configured GPT-5.6 model with a strict schema and 20-second timeout.
- **Files:** `src/lib/ai/promotion-packet.ts`, `src/lib/ai/client.ts`, `src/app/api/assets/promotion-packet/route.ts`, `src/lib/db/queries.ts`, `src/lib/db/mutations.ts`, `tests/integration/promotion-generation.test.ts`.
- **Dependencies:** Tasks 2.1, 4.2.
- **Verification:** `npm run test:integration -- promotion-generation`; one manual live generation; forced timeout/template fallback test.
- **Acceptance:** Browser cannot submit source text/model/profile ID, only selected Experience IDs and optional target role; server reloads and allowlists approved sources; result is saved as a CareerAsset draft with model/prompt/mode metadata; timeout leaves selection intact and offers template fallback.
- **Cutoff:** **REQUIRED**.

### 4.4 Enforce semantic citation and numeric grounding

- [x] Reject unknown/other-profile/unselected source IDs, claims with no sources, and numeric tokens absent from cited approved source text. Create ProvenanceLinks only after validation.
- **Files:** `src/lib/domain/provenance.ts`, `src/lib/validation/ai-output.ts`, `src/app/api/assets/promotion-packet/route.ts`, `tests/unit/promotion-citations.test.ts`, `tests/integration/promotion-provenance.test.ts`.
- **Dependencies:** Task 4.3.
- **Verification:** `npm run test:unit -- promotion-citations`; `npm run test:integration -- promotion-provenance`.
- **Acceptance:** Invalid generated claims are never persisted as valid assets; every saved claim resolves to at least one selected approved source; user-reported versus supported versus needs-evidence states survive generation; numeric invention tests fail deterministically.
- **Cutoff:** **REQUIRED**.

### 4.5 Build asset selection, generation, editing, and citation UI

- [x] Build `/assets/promotion` with 2–4 source selection, progress/error states, editable heading/summary/claims, evidence-gap display, source chips, and preserved draft edits.
- **Files:** `src/app/assets/promotion/page.tsx`, `src/components/assets/SourceSelector.tsx`, `src/components/assets/ClaimEditor.tsx`, `src/components/assets/EvidenceGap.tsx`, `src/components/provenance/CitationChip.tsx`, `src/components/provenance/ProvenanceDrawer.tsx`, `src/app/api/assets/[id]/route.ts`.
- **Dependencies:** Tasks 4.1–4.4.
- **Verification:** `npm run test:e2e -- promotion`; `npm run typecheck`; manual live/template generation, edit, refresh, and citation checks.
- **Acceptance:** User cannot generate from unapproved sources; every claim visibly has source chips; clicking chips reveals the source without losing edits; fixture/template mode is labeled; edits save as user edits while original citations remain inspectable; unsupported gaps are not rewritten as achievements.
- **Cutoff:** **REQUIRED**.

---

# Slice 5 — Review, Editing, and Trust Hardening

**User-visible outcome:** Draft work survives refresh and common failures. Users can reject AI conclusions, safely edit accepted records, and retry without duplicates or corrupted evolution/provenance.

**Slice dependencies:** Slices 1–4 complete.

**Slice exit gate:** Refresh, concurrent revision, duplicate approval, rejection, and accepted-record edit checks pass.

### 5.1 Add draft autosave with optimistic concurrency

- [ ] Add revision numbers, debounced full-draft autosave, visible saving/saved/error states, and conflict recovery that does not overwrite newer server data silently.
- **Files:** `supabase/migrations/0003_revisions.sql`, `src/app/api/drafts/[id]/route.ts`, `src/components/review/ApprovalBar.tsx`, `src/app/review/[draftId]/page.tsx`, `src/lib/db/mutations.ts`, `tests/integration/draft-concurrency.test.ts`.
- **Dependencies:** Task 1.7.
- **Verification:** `npm run db:migrate`; `npm run test:integration -- draft-concurrency`; manual two-tab edit and network-failure check.
- **Acceptance:** Refresh restores latest saved edits; stale revision returns `409`; UI preserves local text and offers reload/retry; approval requires current revision; no background save marks the draft accepted.
- **Cutoff:** **REQUIRED**.

### 5.2 Harden reject, skip, retry, and idempotency paths

- [ ] Make draft discard/reject durable, follow-up skip explicit, model retry bounded, approval idempotent, and repeated asset generation distinguishable.
- **Files:** `src/app/api/drafts/[id]/route.ts`, `src/app/api/drafts/[id]/approve/route.ts`, `src/app/api/reflections/[id]/extract/route.ts`, `src/app/api/assets/promotion-packet/route.ts`, `src/lib/db/mutations.ts`, `tests/integration/state-transitions.test.ts`.
- **Dependencies:** Tasks 1.8, 2.3, 4.3.
- **Verification:** `npm run test:integration -- state-transitions`; manually double-click Submit/Approve/Generate.
- **Acceptance:** Rejected draft never affects Career Record/evolution; duplicate approval returns existing record; retry cannot exceed policy; repeated generation creates an intentional new draft or returns an idempotent result according to documented behavior; UI disables unsafe duplicate actions while pending.
- **Cutoff:** **REQUIRED**.

### 5.3 Allow safe edits to approved experiences

- [ ] Add allowlisted editing for title/date/summary/ownership, impacts, evidence note/link, and theme links with optimistic concurrency. Recalculate derived evolution after save; preserve provenance/source history.
- **Files:** `src/app/experiences/[id]/page.tsx`, `src/app/api/experiences/[id]/route.ts`, `src/components/review/FactEditor.tsx`, `src/components/review/ImpactEditor.tsx`, `src/components/review/ThemeEditor.tsx`, `src/components/review/EvidenceEditor.tsx`, `src/lib/db/mutations.ts`, `tests/integration/edit-experience.test.ts`.
- **Dependencies:** Tasks 3.1–3.4, 4.1.
- **Verification:** `npm run test:integration -- edit-experience`; `npm run test:e2e -- evolution`; manual edit/date/theme removal checks.
- **Acceptance:** Only allowlisted fields change; HTTPS link validation applies; stale edits return conflict; removing/changing a theme updates the chart deterministically; audit/source labels remain accurate; other-profile IDs remain inaccessible.
- **Cutoff:** **REQUIRED** because the approved design promises editable conclusions.

### 5.4 Complete trust and accessibility review

- [ ] Audit all primary screens for fact/evidence/AI/derived/uncertainty labels, keyboard operation, form labels, focus management, non-color cues, and plain-language confidence states.
- **Files:** `src/app/page.tsx`, `src/app/reflect/page.tsx`, `src/app/review/[draftId]/page.tsx`, `src/app/experiences/[id]/page.tsx`, `src/app/evolution/page.tsx`, `src/app/assets/promotion/page.tsx`, affected `src/components/` and `src/app/globals.css`.
- **Dependencies:** Tasks 5.1–5.3.
- **Verification:** `npm run lint`; `npm run test:e2e`; manual keyboard-only pass at desktop video viewport and a mobile viewport; browser accessibility audit if available.
- **Acceptance:** User can edit/reject conclusions without a mouse; badges have text; chart has list fallback; errors move focus appropriately; no screen claims AI interpretation is verified fact; privacy notice explains model processing and fictional demo data.
- **Cutoff:** **REQUIRED**.

---

# Slice 6 — Reliability, Deployment, and Submission Readiness

**User-visible outcome:** The complete required flow is reproducible locally and in production, survives model failure honestly, resets to a known state, and is documented for judges.

**Slice dependencies:** Slices 0–5 complete.

**Slice exit gate / cutoff:** All tasks in this slice must pass. Once they do, freeze required scope. Work below the cutoff may begin only if the production demo has passed three consecutive rehearsals.

### 6.1 Finalize disclosed demo-safe modes

- [x] Implement `off`, `fallback`, and `fixture` centrally for follow-up, extraction, and promotion generation. Version fixtures and persist/display `generationMode`; never silently use a fixture.
- **Files:** `src/lib/ai/client.ts`, `src/lib/ai/fixtures.ts`, `src/lib/env.ts`, `src/components/ui/GenerationModeBadge.tsx`, relevant API handlers, `tests/integration/demo-safe-mode.test.ts`.
- **Dependencies:** Slices 2 and 4.
- **Verification:** `npm run test:integration -- demo-safe-mode`; run the rehearsed flow once in each mode; `npm run build`.
- **Acceptance:** `off` returns a useful failure without fixture substitution; `fallback` tries live first and only uses an exact known fixture/template after failure; `fixture` is explicit; database/UI/README agree on mode; seeded history is never mislabeled as live or fixture inference.
- **Cutoff:** **REQUIRED**.

### 6.2 Implement protected, exact-scope demo reset

- [x] Reset only the configured demo profile's mutable rows to the known seed state in a transaction. Protect the operation with a server-held token/deployment control; never accept arbitrary profile IDs or paths.
- **Files:** `src/app/api/demo/reset/route.ts`, `src/lib/db/mutations.ts`, `scripts/demo-reset.mjs`, `supabase/seed.sql`, `tests/integration/demo-reset.test.ts`, `.env.example`.
- **Dependencies:** Tasks 1.2–1.3; final schema.
- **Verification:** `npm run test:integration -- demo-reset`; create mutable data, run the reset script, then `npm run db:verify`; attempt unauthorized reset.
- **Acceptance:** Known seed counts/content return; other data is untouched; unauthorized request fails; reset is safe to repeat; no broad delete or client-selected target exists; production exposure follows the documented access decision.
- **Cutoff:** **REQUIRED**.

### 6.3 Complete prioritized automated tests

- [x] Consolidate unit, AI-schema, integration, and one complete Playwright flow. Remove meaningless smoke placeholders only after real coverage replaces them.
- **Files:** `tests/unit/career-evolution.test.ts`, `tests/unit/evidence-strength.test.ts`, `tests/unit/unsupported-claims.test.ts`, `tests/unit/promotion-citations.test.ts`, `tests/integration/reflection-approval.test.ts`, `tests/integration/promotion-provenance.test.ts`, `tests/e2e/demo-flow.spec.ts`, test fixtures/config.
- **Dependencies:** Slices 1–5.
- **Verification:** `npm run test:unit`; `npm run test:integration`; `npm run test:e2e`; `npm run test`.
- **Acceptance:** Tests cover deterministic scoring, AI schema rejection, source allowlists, numeric grounding, approval transaction/idempotency, edit recalculation, full fixture-backed demo, and citation drill-down; tests are deterministic and leave the demo profile reset.
- **Cutoff:** **REQUIRED**.

### 6.4 Add operational failure states and privacy-safe logging

- [x] Verify missing env, database outage, model timeout/malformed output, empty data, and chart/render failures have bounded, honest UI recovery. Audit logs for personal career content and secrets.
- **Files:** route error helpers under `src/lib/validation/` or `src/lib/errors/`, `src/app/error.tsx`, route handlers, `src/lib/ai/telemetry.ts`, `src/components/ui/ErrorState.tsx`, `tests/integration/failure-modes.test.ts`.
- **Dependencies:** Task 6.1 and all primary routes.
- **Verification:** `npm run test:integration -- failure-modes`; manual provider/database failure checks in safe non-production configuration; repository search for secret names and raw logging calls.
- **Acceptance:** Errors use the standard `{ error: { code, message, retryable } }` envelope; text/source selections survive retryable failures; no raw reflection/evidence/asset/audio or credentials are logged; manual entry/template fallback preserves the narrative; writes are never faked during database failure.
- **Cutoff:** **REQUIRED**.

### 6.5 Finalize README, license, and hackathon disclosures

- [ ] Document the problem, implemented demo flow, architecture, exact setup/scripts, environment variable names, migration/seed/reset, deployed demo access, live versus seeded/fallback behavior, privacy limitations, Codex collaboration, GPT-5.6 use through `OPENAI_MODEL`, and deferred scope. Add an appropriate repository license.
- **Files:** `README.md`, `LICENSE`, `.env.example`, `docs/technical-design.md` only for discovered corrections, `docs/implementation-plan.md` task status only.
- **Dependencies:** Stable implementation and commands from Tasks 6.1–6.4.
- **Verification:** follow README from a clean checkout or temporary clone; `npm ci`; `npm run db:migrate`; `npm run db:seed`; `npm run build`; compare feature claims to the deployed app.
- **Acceptance:** A judge can run/test without unstated global tools; Codex contribution is concrete and factual; model ID is not hardcoded; seeded/fixture behavior is disclosed; production safeguards are not overstated; repository licensing/access satisfies submission rules.
- **Cutoff:** **REQUIRED**.

### 6.6 Run fresh-environment and production smoke gates

- [ ] Validate a clean install/build/seed and the deployed production URL. Test one live configured-model call separately from the fixture-backed deterministic E2E flow.
- **Files:** `scripts/smoke.mjs`, `tests/e2e/demo-flow.spec.ts`, `README.md`, deployment configuration only as needed.
- **Dependencies:** Tasks 6.1–6.5; production credentials and URL.
- **Verification:** `npm ci`; `npm run db:migrate`; `npm run db:seed`; `npm run lint`; `npm run typecheck`; `npm run test`; `npm run build`; `npm run smoke -- https://<deployment-host>`.
- **Acceptance:** All commands pass in a fresh environment; production opens in a clean browser; live follow-up/extraction/promotion calls use the configured model; fixture-backed E2E passes independently; no uncommitted migration/config is required.
- **Cutoff:** **REQUIRED**.

### 6.7 Rehearse and freeze the required demo

- [ ] Reset and rehearse the exact sub-three-minute narrative at least three consecutive times after the production freeze. Tag/record the tested commit.
- **Files:** `docs/demo-script.md`, `README.md` if access instructions change, Git tag/commit history.
- **Dependencies:** Task 6.6.
- **Verification:** timed manual run; `npm run smoke -- https://<deployment-host>` immediately before and after rehearsal; verify tag/commit matches deployment.
- **Acceptance:** Flow completes in 2:30–2:45; opens on Career Record; one reflection changes structured records/evolution; promotion claim citations open; narration identifies Codex/GPT-5.6 and seeded/fallback behavior; three consecutive rehearsals need no database repair or code change.
- **Cutoff:** **REQUIRED**.

### 6.8 Complete submission compliance checklist

- [ ] Prepare and verify all non-code submission artifacts and access requirements.
- **Files:** `docs/demo-script.md`, `README.md`, optional `docs/submission-checklist.md`; Devpost/YouTube/repository settings outside the repo.
- **Dependencies:** Task 6.7; final hackathon rules recheck.
- **Verification:** signed-out YouTube visibility test; repository access test from a separate account; video duration/media review; compare submission text to shipped behavior.
- **Acceptance:** Apps for Your Life category selected; public YouTube video is under three minutes with clear audio; no unauthorized trademarks/music/material; repository is public with license or shared with both required judging addresses; description is accurate; README collaboration section exists; `/feedback` Codex Session ID is captured; deployed test route/access code works.
- **Cutoff:** **REQUIRED**.

---

# CUTOFF LINE

**Stop here unless all Slice 0–6 tasks are complete, production smoke passes, and the required demo has succeeded three consecutive times.**

If time is short, ship at this line. The product already demonstrates its differentiation: reflection becomes user-approved structured memory, deterministic career evolution changes, and promotion claims trace to approved evidence.

Everything below is optional and must not delay, destabilize, or broaden the required path.

---

# Slice 7 — Optional Voice Transcription

**User-visible outcome:** A user may record up to 90 seconds, receive an editable transcript, and continue through the existing text flow. Voice is not a realtime agent.

**Slice dependencies:** Cutoff gate passed; `OPENAI_TRANSCRIBE_MODEL` available; supported browser rehearsal environment.

### 7.1 Add browser recording with text-first fallback

- [ ] Feature-detect `MediaRecorder`, request permission only on user action, record at most 90 seconds, select a supported MIME type, and retain existing typed text.
- **Files:** `src/components/reflection/VoiceRecorder.tsx`, `src/components/reflection/ReflectionComposer.tsx`, `src/app/reflect/page.tsx`, `tests/e2e/voice-fallback.spec.ts`.
- **Dependencies:** Stable `/reflect` flow.
- **Verification:** `npm run test:e2e -- voice-fallback`; manual permission allow/deny and unsupported-browser checks.
- **Acceptance:** Denial/unsupported state focuses the text box with concise copy; typed text is never erased; recording visibly stops at the limit; audio is held only for the current transcription attempt.
- **Cutoff:** **OPTIONAL — first feature to cut after file upload/live insights**.

### 7.2 Add server transcription route

- [ ] Validate multipart audio, detected format, maximum 10 MB/90 seconds, and server-only transcription call. Return editable text; do not persist audio.
- **Files:** `src/app/api/transcribe/route.ts`, `src/lib/ai/transcribe.ts`, `src/lib/validation/audio.ts`, `.env.example`, `tests/integration/transcribe.test.ts`.
- **Dependencies:** Task 7.1; configured transcription model.
- **Verification:** `npm run test:integration -- transcribe`; manual WebM success; oversized/unsupported/timeout tests.
- **Acceptance:** Supported recording returns text; file limits and types are enforced; failure returns immediate text fallback; audio/raw transcript is not logged or stored; resulting text uses the existing reflection API with `inputMode: voice_transcript`.
- **Cutoff:** **OPTIONAL**.

---

# Slice 8 — Optional Visual Polish

**User-visible outcome:** The stable demo reads clearly at video and mobile sizes without adding new behavior.

**Slice dependencies:** Cutoff gate passed; voice inclusion already decided.

### 8.1 Polish only the recorded route

- [ ] Improve spacing, hierarchy, responsive behavior, focus/hover states, restrained loading transitions, and source/citation legibility across the exact demo path.
- **Files:** `src/app/globals.css`, primary route pages, existing `src/components/record/`, `src/components/reflection/`, `src/components/review/`, `src/components/evolution/`, `src/components/assets/`, `src/components/provenance/`.
- **Dependencies:** Frozen functionality.
- **Verification:** `npm run test:e2e`; `npm run build`; manual desktop recording viewport and mobile viewport; timed rehearsal.
- **Acceptance:** No new dependency or component system is introduced without necessity; motion does not delay interaction; long text and error states remain usable; visual changes do not break three-minute pacing or accessibility.
- **Cutoff:** **OPTIONAL**.

### 8.2 Add copy-to-clipboard for the final asset

- [ ] Add an accessible copy action for the promotion section with success/failure feedback.
- **Files:** `src/components/assets/CopyAssetButton.tsx`, `src/app/assets/promotion/page.tsx`, `tests/e2e/promotion.spec.ts`.
- **Dependencies:** Stable promotion asset UI.
- **Verification:** `npm run test:e2e -- promotion`; manual clipboard permission/failure check.
- **Acceptance:** Copies only visible user-reviewed content, not citation IDs/hidden prompts; failure is non-blocking; citations remain visible in the app.
- **Cutoff:** **OPTIONAL**.

---

# Slice 9 — Optional Evidence Upload and Live Insight Refresh

**User-visible outcome:** Only if substantial time remains, the user may attach one small private file as evidence metadata and/or request one source-linked insight refresh.

**Slice dependencies:** All earlier shipped features stable; security review time available. These tasks are independent and may be skipped separately.

### 9.1 Add one-file private evidence upload

- [ ] Support one PDF/TXT/PNG/JPEG up to 10 MB, server-detected MIME, generated storage name, private bucket, metadata row, and short-lived signed access. Do not parse or send contents to AI.
- **Files:** `supabase/migrations/0004_evidence_storage.sql` if policies/schema change, Supabase storage policy SQL, `src/app/api/evidence/upload/route.ts`, `src/app/api/evidence/[id]/download/route.ts`, `src/components/review/EvidenceEditor.tsx`, `src/lib/validation/uploads.ts`, `tests/integration/evidence-upload.test.ts`.
- **Dependencies:** Supabase Storage; completed metadata evidence/provenance path.
- **Verification:** `npm run db:migrate`; `npm run test:integration -- evidence-upload`; test valid file, MIME mismatch, oversized file, SVG/HTML/archive/executable rejection, unauthorized ID, and expired URL.
- **Acceptance:** Bucket is private; service credential stays server-only; filenames are sanitized/generated; file is never rendered as active HTML or added to AI context; upload failure preserves note/link evidence; privacy copy is updated.
- **Cutoff:** **OPTIONAL — should almost certainly be cut**.

### 9.2 Add source-linked insight refresh

- [ ] Generate at most one proposed insight from at least two approved experiences and deterministic aggregates; validate all source IDs and require user accept/reject.
- **Files:** `src/lib/ai/insights.ts`, `src/lib/ai/schemas.ts`, `src/app/api/insights/route.ts`, `src/components/record/InsightCard.tsx`, `src/lib/domain/provenance.ts`, `tests/unit/insight-schema.test.ts`, `tests/integration/insight-generation.test.ts`.
- **Dependencies:** Stable live AI adapter and provenance; seeded insight already works without this task.
- **Verification:** `npm run test:unit -- insight`; `npm run test:integration -- insight-generation`; manual accept/reject.
- **Acceptance:** Insight cites at least two approved input experiences; unknown IDs/numbers fail; it begins proposed and never affects the record before acceptance; deterministic derived summary remains available if generation fails.
- **Cutoff:** **OPTIONAL — should almost certainly be cut**.

---

## Required End-to-End Acceptance Matrix

| Capability | Automated gate | Manual gate | Required before cutoff |
|---|---|---|---|
| Configurable GPT-5.6 | Env unit test + live smoke | Confirm deployed request metadata uses `OPENAI_MODEL` | Yes |
| Seeded Career Record | DB verify + record integration | Home opens on fictional 12–18 month history | Yes |
| Text reflection | Reflection integration + E2E | Input survives skip/retry/refresh | Yes |
| Structured extraction | Schema/semantic tests | Live draft distinguishes facts and interpretation | Yes |
| Review/edit/reject | State transition tests | Edit, remove theme, reject, approve | Yes |
| Transactional persistence | Approval integration | Refresh shows normalized new record | Yes |
| Evidence metadata | Draft/experience integration | Add original note or safe HTTPS link | Yes |
| Experience provenance | Detail integration | Explain leadership rationale and sources | Yes |
| Career Evolution | Scoring unit + evolution E2E | New experience changes correct theme/quarter | Yes |
| Promotion packet | Citation unit/integration + E2E | Every claim chip opens approved source | Yes |
| Demo-safe fallback | Mode integration | Fixture/template badge is unmistakable | Yes |
| Reset | Reset integration | Restore exact starting state | Yes |
| Deployment | Build + remote smoke | Clean-browser full flow | Yes |
| Voice | Voice/transcription tests | Allow/deny/failure path | No |
| File upload | Upload security tests | Private access/failure fallback | No |
| Live insights | Schema/provenance tests | Accept/reject proposed insight | No |

## Daily Execution Checkpoints

### End of implementation session 1

- [ ] Slice 0 is complete and deployed.
- [ ] Slice 1 fixture-backed walking skeleton passes after refresh.
- [ ] Database seed/reset foundation is repeatable.
- [ ] If this checkpoint is missed, do not add voice, uploads, live insights, animation, or additional asset types.

### End of implementation session 2

- [x] Slice 2 live follow-up/extraction passes with configured model and semantic validation.
- [x] Slice 3 scoring/chart/drill-down passes.
- [ ] Required flow remains deployable.
- [ ] If this checkpoint is missed, simplify chart visuals to the accessible table/list plus minimal SVG; do not weaken provenance.

### End of implementation session 3

- [ ] Slices 4–6 pass in production.
- [ ] README/fresh install/submission artifacts are ready.
- [ ] Three consecutive timed rehearsals succeed.
- [ ] Record video only from the frozen tested deployment/commit.

## Final Definition of Done

The implementation is ready to submit only when all statements below are true:

- [ ] Career Record—not chat—is the home and primary product surface.
- [ ] A real text reflection produces one grounded follow-up and a strictly validated draft.
- [ ] AI output remains proposed until the user edits/approves it.
- [ ] Approved data is persisted as distinct Experience, Impact, Evidence, Theme relationship, and provenance records.
- [ ] Facts, user reports, evidence, AI interpretation, derived scoring, and uncertainty remain distinguishable.
- [x] Career Evolution is deterministic, qualitative, inspectable, and changed by the new approved experience.
- [x] A promotion-packet section uses only approved records and every claim resolves to its supporting sources.
- [ ] The configured GPT-5.6 model is supplied through `OPENAI_MODEL`; no concrete model identifier is hardcoded.
- [ ] Live, seeded, heuristic, template, and fixture behavior is recorded and disclosed accurately.
- [ ] Required unit, schema, integration, E2E, build, and production smoke gates pass.
- [ ] The demo resets safely, completes in under three minutes, and has passed three consecutive rehearsals.
- [ ] README, license, repository access, YouTube video, submission description, Codex collaboration disclosure, and `/feedback` Session ID satisfy the supplied rules.

If those checks pass, stop building. Additional breadth would increase risk more than judging value.
