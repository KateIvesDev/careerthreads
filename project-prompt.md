You are the lead engineer and technical product partner for this hackathon project.

The repository contains the product PRD and may also contain hackathon rules and judging criteria. Your task is to inspect the existing repository and produce a pragmatic technical design document for an MVP that can be implemented and demonstrated by July 21, 2026.

## Source material

Read these files first, using the actual paths present in the repository:

* The Career Thread PRD
* The official hackathon rules
* The official judging criteria
* Existing source code, configuration, README files, and dependency manifests

Treat the documents differently:

* The PRD defines the product vision, user value, trust principles, domain model, and desired user journey.
* The hackathon rules are hard constraints.
* The judging criteria determine what the implementation and demo should emphasize.
* The current repository establishes the technical starting point and any existing stack decisions.

Do not modify application code during this task unless I explicitly ask you to do so.

## Product thesis

Career Thread is a professional memory system that turns reflection and supporting evidence into a structured, evolving Career Record.

It is not primarily:

* an AI résumé writer,
* a generic chatbot,
* a conventional brag document,
* or an AI career coach.

The product’s differentiation must be visible in the implementation:

1. Reflection produces structured professional memory rather than merely retaining chat.
2. Experiences, evidence, impact, themes, insights, and goals are modeled separately.
3. The system shows how a user’s professional identity evolves over time.
4. AI-generated interpretations are explainable, editable, and subordinate to the user.
5. Generated career assets trace claims back to experiences and evidence.
6. The Career Record—not the chat interface—is the primary product surface.

## MVP demo thesis

Design backward from this demonstration:

1. A user records a professional experience through text or voice.
2. The mentor asks one or two useful, grounded follow-up questions.
3. The system extracts a structured experience, evidence, impact, and relevant themes.
4. The user reviews or edits the AI’s interpretation.
5. The Career Record and Career Evolution visualization update.
6. The user generates a promotion-packet section.
7. Important generated claims link back to their supporting experiences and evidence.

This complete path matters more than broad feature coverage.

## Time constraint

The implementation window is extremely short. Favor boring, reliable technology and the smallest architecture that proves the thesis.

Explicitly avoid:

* speculative infrastructure,
* premature scalability,
* unnecessary microservices,
* complex agent frameworks,
* custom model training,
* elaborate retrieval systems,
* integrations that do not appear in the primary demo,
* and production features that do not improve judging outcomes.

Use deterministic fixtures, seeded historical career data, or precomputed demo data where appropriate. Clearly distinguish genuine implemented behavior from seeded data. Do not propose misleading demo behavior.

## Your process

1. Inspect the entire relevant repository before proposing architecture.
2. Identify the current stack, what has already been implemented, and any important gaps.
3. Extract the hard constraints from the hackathon rules.
4. Translate the judging criteria into technical and demo priorities.
5. Identify contradictions or excessive scope in the PRD.
6. Make reasonable decisions instead of stopping for minor ambiguities.
7. Ask me no more than three questions, and only when the answers materially change the architecture or prevent implementation.
8. Produce the technical design in the repository at `docs/technical-design.md`, or use the repository’s established documentation location if a more appropriate one already exists.
9. Do not begin implementation until the design has been reviewed.

## Required technical design sections

### 1. Executive Summary

Explain the proposed architecture in plain language and how it proves the product thesis within the deadline.

### 2. Current Repository Assessment

Document:

* current framework and runtime,
* existing code and features,
* dependency state,
* deployment assumptions,
* reusable components,
* and technical risks already present.

Do not assume a greenfield project if code already exists.

### 3. Rules and Judging Alignment

Create a concise matrix containing:

* relevant rule or judging criterion,
* resulting technical implication,
* demo implication,
* and how compliance or success will be verified.

Call out any eligibility, technology, attribution, submission, hosting, or disclosure requirements that affect implementation.

### 4. Scope

Separate the proposal into:

* Must Build
* Should Build
* Seed or Simulate
* Explicitly Defer

Every Must Build item must support the primary demo flow.

Voice capture, text capture, and manual editing are desired product capabilities. Given the deadline, assess honestly whether all three can be implemented reliably. Recommend the smallest credible implementation, including graceful fallback behavior.

### 5. System Architecture

Describe the smallest suitable architecture, including:

* client application,
* server or server actions,
* persistence,
* file or evidence storage,
* AI model integration,
* structured extraction,
* career-asset generation,
* and deployment.

Include a Mermaid architecture diagram.

Prefer a modular monolith unless the repository or hackathon requirements provide a strong reason not to.

### 6. Domain Model

Define the minimum viable data model for:

* User or demo profile
* Reflection Session
* Experience
* Evidence
* Impact
* Theme
* Experience–Theme relationship
* Insight
* Goal
* Career Asset
* Source citation or provenance

For every entity, specify:

* purpose,
* essential fields,
* relationships,
* whether it must be persisted for the demo,
* and which fields can be seeded or derived.

Keep the schema as small as possible while preserving the distinction between experience, evidence, impact, and AI interpretation.

### 7. AI System Design

Specify separate AI operations rather than one unconstrained conversation:

* mentor follow-up generation,
* structured experience extraction,
* theme classification or suggestion,
* explainable insight generation,
* and promotion-packet generation.

For each operation, define:

* input,
* output,
* structured response schema,
* grounding context,
* prompt responsibilities,
* validation,
* user-review step,
* fallback behavior,
* and how unsupported claims are prevented.

The system must distinguish:

* user-provided facts,
* attached evidence,
* AI interpretation,
* and uncertainty.

AI output must never silently become accepted fact.

Recommend whether each operation should run live during the demo, be cached, or use seeded output as a fallback.

### 8. Provenance and Trust

Explain how the application will allow a user or judge to answer:

* Why does the system believe this is a leadership example?
* Which experiences strengthened this theme?
* What evidence supports this promotion-packet claim?
* Which information came from the user, a file, or AI interpretation?
* How can the user edit or reject the conclusion?

This is a central differentiator and must be represented in the architecture, not only in UI copy.

### 9. Career Evolution Model

Design a technically feasible version of the Career Evolution visualization.

Define:

* what the visualization measures,
* how theme strength is computed,
* how time is represented,
* how a new experience changes the visualization,
* and how users can inspect the experiences behind a trend.

Avoid false precision. Prefer an understandable heuristic over an opaque score.

Specify a simple deterministic scoring approach suitable for the hackathon, with AI suggesting classifications but application logic calculating displayed values.

### 10. Primary User Flows

Document the technical sequence for:

* text reflection,
* voice reflection and fallback,
* reviewing extracted records,
* attaching or referencing evidence,
* viewing Career Record,
* viewing Career Evolution,
* and generating a promotion packet.

For the main demo flow, provide a step-by-step sequence diagram or Mermaid flowchart showing data movement from input through AI extraction, persistence, visualization, and asset generation.

### 11. API and Server Contracts

Define the minimum required endpoints, server actions, or functions.

For each one, provide:

* name or route,
* purpose,
* request schema,
* response schema,
* expected errors,
* and whether it is blocking or asynchronous from the UI’s perspective.

Use concrete TypeScript-style interfaces or JSON examples where helpful.

Do not invent APIs that the MVP does not need.

### 12. Frontend Structure

Propose the key routes and components, including at minimum:

* Career Record home screen
* Reflection experience
* Record review/editing
* Experience detail with provenance
* Career Evolution visualization
* Career Asset generation and review

For each screen, state what is real, seeded, editable, or derived.

Provide an annotated file and folder structure compatible with the existing repository.

### 13. State and Persistence

For every important type of state, explain:

* where it lives,
* how it is created,
* how it is updated,
* what survives a refresh,
* and what happens when an operation fails.

Include the simplest suitable approach to demo-user authentication. If full authentication is unnecessary for the hackathon, say so and provide a safe demo-mode approach.

### 14. Evidence Handling

Recommend the smallest useful evidence feature.

Address:

* supported file or link types,
* metadata storage,
* whether file contents are parsed,
* privacy implications,
* size limits,
* and fallback behavior.

Do not build a generalized document-ingestion or retrieval platform unless it is essential to the judged demo.

### 15. Failure and Demo Resilience

Identify the most likely demo failures, especially:

* model latency or malformed output,
* microphone permissions,
* speech transcription failure,
* unavailable external services,
* missing environment variables,
* empty or incomplete career data,
* and deployment problems.

For each failure, provide a graceful fallback that preserves the narrative of the demo.

Include a demo-safe mode with seeded data where justified.

### 16. Security and Privacy

Document the minimum responsible protections for highly personal career data, including:

* secret management,
* data access boundaries,
* upload restrictions,
* logging practices,
* prompt-injection considerations for evidence files,
* and deletion or reset behavior.

Distinguish hackathon safeguards from later production requirements.

### 17. Testing and Verification

Define a small, prioritized test plan:

* unit tests for deterministic domain logic,
* schema validation for AI responses,
* one happy-path integration test,
* manual UI checks,
* and a complete demo rehearsal checklist.

Every major feature should have a concrete verification step.

### 18. Deployment

Recommend the fastest reliable deployment path based on the repository’s current stack.

Include:

* required services,
* environment variables,
* setup commands,
* database initialization or seed process,
* deployment steps,
* and a fresh-environment smoke test.

Use current official documentation when version-sensitive details need verification.

### 19. Implementation Plan

Break implementation into ordered vertical slices.

For every slice, include:

* user-visible outcome,
* files or components likely affected,
* dependencies,
* verification checkpoint,
* and estimated relative effort: XS, S, M, or L.

Order work so that a complete but visually basic demo path exists as early as possible.

Use this priority:

1. End-to-end text-based demo path
2. Structured Career Record and persistence
3. Career Evolution visualization
4. Evidence-linked promotion packet
5. Review and editing
6. Voice input with text fallback
7. Visual polish
8. Nonessential enhancements

Identify a clear cutoff line: everything below it should be abandoned if the schedule slips.

### 20. Architecture Decision Records

List the most consequential choices and alternatives considered, including:

* structured model versus chat transcript,
* deterministic theme scoring versus LLM-generated scoring,
* persistence approach,
* live versus seeded demo data,
* evidence storage,
* and voice implementation.

Keep each decision concise.

### 21. Open Questions and Risks

Include only unresolved issues that genuinely affect implementation.

For each, recommend a default decision so work can proceed immediately.

### 22. Definition of Done

Provide a measurable checklist for:

* product thesis,
* primary demo flow,
* rules compliance,
* judging-criteria alignment,
* reliability,
* deployment,
* and submission readiness.

## Important design principles

* The Career Record is the home screen.
* Conversation is an input mechanism, not the durable product.
* Store structured career memory, not merely transcript history.
* User-provided facts and AI interpretations must remain distinguishable.
* The user can edit or reject AI conclusions.
* Every meaningful insight should be explainable.
* Promotion-packet claims should be traceable to supporting records.
* Career Evolution must be understandable and avoid manufactured precision.
* A narrow complete experience is better than several incomplete features.
* Optimize for a compelling three-to-five-minute demonstration.
* Do not describe future roadmap functionality as though it exists in the MVP.

## Final self-review

Before finishing, audit the design and include a brief section titled “Scope Reality Check” that answers:

1. What is most likely to be overbuilt?
2. What should be cut first?
3. What portion best demonstrates differentiation from BragBook and generic AI chat tools?
4. Could one developer realistically build the proposed Must Build scope before July 21?
5. What must be working by the end of the first implementation session?
6. What should be seeded rather than built?
7. What would make a judge dismiss this as an AI wrapper, and how does the design prevent that?

Be direct. Do not protect the original PRD from criticism.

After writing the document, respond with:

* the proposed architecture in five bullets,
* the three largest risks,
* the recommended cutoff scope,
* any questions requiring my answer,
* and the exact next Codex prompt I should use to turn the design into an implementation checklist.
