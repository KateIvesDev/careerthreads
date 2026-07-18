# Career Thread

Career Thread is a professional-memory system for turning small work reflections into an approved, structured Career Record. Approved experiences build an inspectable Career Evolution view and can be reused in a promotion-packet section whose claims link back to their sources.

This repository contains a narrow hackathon MVP. The demo profile and its history are fictional.

Production demo: <https://careerthread.vercel.app>

Access username: `careerthread` (the shared judging password is distributed separately).

## Implemented flow

1. Start from the seeded Career Record rather than a chat screen.
2. Enter a text reflection and answer one grounded model-generated follow-up.
3. Review, edit, reject, or approve a strictly validated experience draft.
4. Inspect deterministic, qualitative theme evidence by quarter.
5. Select 2–4 approved experiences and generate an editable, source-linked promotion section.
6. Open every promotion claim citation back to its approved experience and provenance.

AI output remains proposed until approval. Career Evolution is application code, not an AI score. Numeric promotion claims and source IDs are validated against selected approved records.

## Architecture

- Next.js 16 and React 19 for server-rendered pages and API routes
- Supabase Postgres for normalized records, drafts, assets, and provenance
- Official OpenAI SDK with strict structured outputs
- Zod for request and model-output validation
- Vitest and Playwright for unit, integration, and browser coverage
- 1Password CLI for optional local secret injection

The model is always read from `OPENAI_MODEL`; no concrete GPT-5.6 identifier is hardcoded.

## Setup

Requirements: Node 24.14.x, npm, a Supabase project, and access to the hackathon-provided GPT-5.6 API model.

```bash
npm ci
cp .env.example .env.local
npm run db:migrate
npm run db:seed
npm run db:verify
npm run dev
```

Populate every variable listed in `.env.example`. `.env.local` is ignored by Git. For this project’s preferred no-plaintext workflow, use the 1Password instructions below instead.

### 1Password CLI workflow

1. Install and sign in to the 1Password desktop app and CLI.
2. Enable **Settings → Developer → Integrate with 1Password CLI**.
3. Copy `.env.1password.example` to `.env.1password`.
4. Replace the placeholder vault/item references and non-secret configuration.
5. Run `npm run secrets:check`.

For production, create a separate concealed `DEMO_ACCESS_PASSWORD` value of at least 12 characters. Production requests fail closed when it is missing. Judges authenticate with username `careerthread`; keep `DEMO_RESET_TOKEN` separate and operator-only.

Then use:

```bash
npm run db:migrate:secure
npm run db:seed:secure
npm run db:verify:secure
npm run dev:secure
```

## Demo-safe modes

`DEMO_SAFE_MODE` is recorded and disclosed in the UI:

- `off`: calls the configured model and returns an honest error if it fails.
- `fallback`: calls the model first, then uses a labeled heuristic/fixture/template only after failure.
- `fixture`: skips model calls and uses versioned deterministic demo responses with explicit labels.

Seeded history is fictional persisted data; it is never presented as live inference. Normal live operation uses the configured model for follow-up, extraction, and promotion generation.

## Database and protected reset

Migrations are applied in filename order and the seed is repeatable:

```bash
npm run db:migrate:secure
npm run db:seed:secure
npm run db:verify:secure
```

With the app running, restore only the configured canonical demo profile:

```bash
npm run demo:reset:secure -- http://localhost:3000
```

The reset route requires `DEMO_RESET_TOKEN`, accepts no profile ID, deletes only the canonical fictional profile, and reapplies the known seed in one transaction. Do not expose the token to browser code. Rotate it for deployment and restrict access to operators.

## Quality and release gates

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run test:integration
npm run test
npm run test:e2e:secure
npm run test:e2e:fixture:secure
npm run build
npm run smoke:secure -- http://localhost:3000
```

For a deployed environment, inject the same variables through the hosting provider and run `npm run smoke -- https://your-host` from a credentialed shell.

Run the browser suite directly against the authenticated production deployment with:

```bash
PLAYWRIGHT_BASE_URL=https://careerthread.vercel.app npm run test:e2e:secure
```

## Privacy and limitations

- The hackathon app is a single fictional-profile demonstration, not a multi-tenant production service.
- Reflection text and selected approved context are sent to the configured model only for the requested operation.
- Raw reflections, evidence excerpts, generated assets, and credentials are not intentionally logged.
- Evidence supports short notes and HTTPS metadata links. The MVP does not upload, parse, OCR, embed, or send document contents to AI.
- Confidence labels distinguish reported, supported, and needs-evidence material; they are not independent verification.
- Voice, evidence-file upload, multiple asset types, and live insight regeneration are deliberately deferred.

## Codex collaboration disclosure

OpenAI Codex was used as the implementation collaborator for architecture review, vertical-slice planning, Next.js/Supabase implementation, strict OpenAI structured-output integration, provenance and semantic validators, deterministic evolution scoring, tests, debugging, and release documentation. Product scope and approval decisions remained user-directed. The configured GPT-5.6 model powers the three in-product live AI operations through `OPENAI_MODEL`.

See [technical design](docs/technical-design.md), [implementation plan](docs/implementation-plan.md), [demo script](docs/demo-script.md), and [submission checklist](docs/submission-checklist.md).

## License

Licensed under the MIT License. See [LICENSE](LICENSE).
