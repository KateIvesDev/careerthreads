import "server-only";

import { randomUUID } from "node:crypto";

import type { ExperienceExtraction } from "@/lib/ai/extraction-schema";
import { experienceExtractionSchema } from "@/lib/ai/extraction-schema";
import { getDemoProfileId } from "@/lib/auth/demo-profile";
import { createDirectDatabaseClient } from "@/lib/db/direct";
import type { PromotionPacketDraft } from "@/lib/ai/schemas";
import { promotionPacketSchema } from "@/lib/ai/schemas";

export async function createReflection(
  initialText: string,
  followUp: { question: string; generationMode: "live" | "heuristic" },
) {
  const sql = createDirectDatabaseClient();
  const id = randomUUID();
  try {
    await sql`
      insert into public.reflection_sessions (
        id, profile_id, initial_text, follow_up_question, input_mode, status, generation_mode
      ) values (
        ${id}, ${getDemoProfileId()}, ${initialText},
        ${followUp.question},
        'text', 'questioned', ${followUp.generationMode}
      )
    `;
    return id;
  } finally {
    await sql.end();
  }
}

export async function createExperienceDraft(
  sessionId: string,
  answer: string | null,
  payload: ExperienceExtraction,
  generation: {
    mode: "live" | "fixture";
    model: string | null;
    promptVersion: string;
  },
) {
  const sql = createDirectDatabaseClient();
  const draftId = randomUUID();
  const profileId = getDemoProfileId();
  try {
    await sql.begin(async (transaction) => {
      const sessions = await transaction<{ id: string }[]>`
        update public.reflection_sessions
        set follow_up_answer = ${answer}, status = 'extracted'
        where id = ${sessionId} and profile_id = ${profileId} and status = 'questioned'
        returning id
      `;
      if (!sessions[0]) throw new Error("Reflection session not found");

      await transaction`
        insert into public.experience_drafts (
          id, profile_id, session_id, payload_json, schema_version,
          model, prompt_version, generation_mode, status
        ) values (
          ${draftId}, ${profileId}, ${sessionId}, ${transaction.json(payload)},
          '1', ${generation.model}, ${generation.promptVersion}, ${generation.mode}, 'proposed'
        )
      `;
    });
    return draftId;
  } finally {
    await sql.end();
  }
}

export async function saveDraft(draftId: string, payload: ExperienceExtraction, expectedRevision: number) {
  const parsed = experienceExtractionSchema.parse(payload);
  const sql = createDirectDatabaseClient();
  try {
    const rows = await sql<{ revision: number }[]>`
      update public.experience_drafts
      set payload_json = ${sql.json(parsed)}, revision = revision + 1, updated_at = now()
      where id = ${draftId} and profile_id = ${getDemoProfileId()} and status = 'proposed' and revision = ${expectedRevision}
      returning revision
    `;
    if (!rows[0]) throw new Error("REVISION_CONFLICT");
    return rows[0].revision;
  } finally {
    await sql.end();
  }
}

export async function rejectDraft(draftId: string) {
  const sql = createDirectDatabaseClient();
  try {
    await sql`
      update public.experience_drafts
      set status = 'rejected', updated_at = now()
      where id = ${draftId} and profile_id = ${getDemoProfileId()} and status = 'proposed'
    `;
  } finally {
    await sql.end();
  }
}

export async function approveDraft(draftId: string, expectedRevision: number) {
  const sql = createDirectDatabaseClient();
  const profileId = getDemoProfileId();
  try {
    return await sql.begin(async (transaction) => {
      const [draft] = await transaction<{
        session_id: string;
        payload_json: ExperienceExtraction;
        status: string;
        revision: number;
        accepted_experience_id: string | null;
      }[]>`
        select session_id, payload_json, status, accepted_experience_id, revision
        from public.experience_drafts
        where id = ${draftId} and profile_id = ${profileId}
        for update
      `;
      if (!draft) throw new Error("Draft not found");
      if (draft.status === "accepted" && draft.accepted_experience_id) {
        return draft.accepted_experience_id;
      }
      if (draft.status !== "proposed") throw new Error("Draft cannot be approved");
      if (draft.revision !== expectedRevision) throw new Error("REVISION_CONFLICT");

      const payload = experienceExtractionSchema.parse(draft.payload_json);
      const experienceId = randomUUID();
      await transaction`
        insert into public.experiences (
          id, profile_id, title, occurred_on, summary, ownership,
          interpretation, uncertainty, source_kind, confidence, approved_at
        ) values (
          ${experienceId}, ${profileId}, ${payload.experience.title},
          ${payload.experience.occurredOn}, ${payload.experience.summary},
          ${payload.experience.ownership}, ${payload.interpretation.text || null},
          ${payload.interpretation.uncertainty}, 'user_report',
          ${payload.evidence ? "supported" : "reported"}, now()
        )
      `;

      for (const impact of payload.impacts) {
        await transaction`
          insert into public.impacts (
            profile_id, experience_id, description, metric_value, metric_unit,
            source_kind, confidence, approved_at
          ) values (
            ${profileId}, ${experienceId}, ${impact.description}, ${impact.metricValue},
            ${impact.metricUnit}, 'user_report', ${impact.confidence}, now()
          )
        `;
      }

      if (payload.evidence && (payload.evidence.label || payload.evidence.noteOrExcerpt || payload.evidence.url)) {
        await transaction`
          insert into public.evidence (
            profile_id, experience_id, kind, label, note_or_excerpt, url, source_kind
          ) values (
            ${profileId}, ${experienceId}, ${payload.evidence.url ? "link" : "note"},
            ${payload.evidence.label || "Supporting evidence"},
            ${payload.evidence.noteOrExcerpt || null}, ${payload.evidence.url || null}, 'evidence'
          )
        `;
      }

      for (const theme of payload.themes) {
        const [themeRecord] = await transaction<{ id: string }[]>`
          select id from public.themes
          where profile_id = ${profileId} and slug = ${theme.themeSlug}
        `;
        if (!themeRecord) throw new Error("Unknown theme");
        await transaction`
          insert into public.experience_themes (
            experience_id, theme_id, profile_id, strength, rationale,
            status, source_kind, approved_at
          ) values (
            ${experienceId}, ${themeRecord.id}, ${profileId}, ${theme.strength},
            ${theme.rationale}, 'accepted', 'ai_interpretation', now()
          )
        `;
      }

      await transaction`
        insert into public.provenance_links (
          profile_id, subject_type, subject_id, source_type, source_id, relation, quote
        ) values (
          ${profileId}, 'experience', ${experienceId}, 'reflection_session',
          ${draft.session_id}, 'reported_in', ${payload.experience.factFragments[0]?.text ?? null}
        )
      `;
      await transaction`
        update public.experience_drafts
        set status = 'accepted', accepted_experience_id = ${experienceId}, updated_at = now()
        where id = ${draftId}
      `;
      await transaction`
        update public.reflection_sessions set status = 'completed'
        where id = ${draft.session_id}
      `;
      return experienceId;
    });
  } finally {
    await sql.end();
  }
}

export async function createPromotionAsset(draft: PromotionPacketDraft, generation: { mode: "live" | "template" | "fixture"; model: string | null; promptVersion: string }) {
  const sql = createDirectDatabaseClient(); const id = randomUUID(); const profileId = getDemoProfileId();
  try { await sql.begin(async (transaction) => {
    await transaction`insert into public.career_assets (id, profile_id, type, title, content_json, status, model, prompt_version, generation_mode) values (${id}, ${profileId}, 'promotion_packet', ${draft.heading}, ${transaction.json(draft)}, 'draft', ${generation.model}, ${generation.promptVersion}, ${generation.mode})`;
    for (const claim of draft.claims) for (const sourceId of claim.sourceIds) await transaction`insert into public.provenance_links (profile_id, subject_type, subject_id, source_type, source_id, relation, quote) values (${profileId}, 'asset_claim', ${claim.id}, 'experience', ${sourceId}, 'cites', ${claim.text})`;
  }); return id; } finally { await sql.end(); }
}

export async function savePromotionAsset(assetId: string, draft: PromotionPacketDraft, status: "draft" | "final") {
  const parsed = promotionPacketSchema.parse(draft); const sql = createDirectDatabaseClient();
  try { const rows = await sql<{ id: string }[]>`update public.career_assets set title = ${parsed.heading}, content_json = ${sql.json(parsed)}, status = ${status}, updated_at = now() where id = ${assetId} and profile_id = ${getDemoProfileId()} and type = 'promotion_packet' returning id`; if (!rows[0]) throw new Error("Asset not found"); return rows[0].id; } finally { await sql.end(); }
}

export interface ExperienceEdit {
  revision: number; title: string; occurredOn: string; summary: string; ownership: string | null;
  impacts: Array<{ id?: string; description: string }>;
  evidence: Array<{ id?: string; label: string; noteOrExcerpt: string | null; url: string | null }>;
  themes: Array<{ themeId: string; rationale: string; strength: 1 | 2 }>;
}
export async function editApprovedExperience(experienceId: string, edit: ExperienceEdit) {
  const sql = createDirectDatabaseClient(); const profileId = getDemoProfileId();
  try { return await sql.begin(async (transaction) => {
    const ownedImpacts = await transaction<{ id: string }[]>`select id from public.impacts where experience_id=${experienceId} and profile_id=${profileId}`;
    const ownedEvidence = await transaction<{ id: string }[]>`select id from public.evidence where experience_id=${experienceId} and profile_id=${profileId}`;
    const ownedThemes = edit.themes.length ? await transaction<{ id: string }[]>`select id from public.themes where profile_id=${profileId} and id in ${transaction(edit.themes.map((item) => item.themeId))}` : [];
    const impactAllowlist = new Set(ownedImpacts.map((item) => item.id)); const evidenceAllowlist = new Set(ownedEvidence.map((item) => item.id)); const themeAllowlist = new Set(ownedThemes.map((item) => item.id));
    if (edit.impacts.some((item) => item.id && !impactAllowlist.has(item.id)) || edit.evidence.some((item) => item.id && !evidenceAllowlist.has(item.id)) || edit.themes.some((item) => !themeAllowlist.has(item.themeId))) throw new Error("UNAUTHORIZED_EDIT_REFERENCE");
    const rows = await transaction<{ revision: number }[]>`update public.experiences set title=${edit.title}, occurred_on=${edit.occurredOn}, summary=${edit.summary}, ownership=${edit.ownership}, revision=revision+1, updated_at=now() where id=${experienceId} and profile_id=${profileId} and revision=${edit.revision} returning revision`;
    if (!rows[0]) throw new Error("REVISION_CONFLICT");
    const impactIds = edit.impacts.flatMap((item) => item.id ? [item.id] : []);
    if (impactIds.length) await transaction`delete from public.impacts where experience_id=${experienceId} and profile_id=${profileId} and id not in ${transaction(impactIds)}`; else await transaction`delete from public.impacts where experience_id=${experienceId} and profile_id=${profileId}`;
    for (const impact of edit.impacts) { if (impact.id) await transaction`update public.impacts set description=${impact.description} where id=${impact.id} and experience_id=${experienceId} and profile_id=${profileId}`; else await transaction`insert into public.impacts (profile_id, experience_id, description, source_kind, confidence, approved_at) values (${profileId}, ${experienceId}, ${impact.description}, 'user_report', 'reported', now())`; }
    const evidenceIds = edit.evidence.flatMap((item) => item.id ? [item.id] : []);
    if (evidenceIds.length) await transaction`delete from public.evidence where experience_id=${experienceId} and profile_id=${profileId} and id not in ${transaction(evidenceIds)}`; else await transaction`delete from public.evidence where experience_id=${experienceId} and profile_id=${profileId}`;
    for (const evidence of edit.evidence) { if (evidence.id) await transaction`update public.evidence set label=${evidence.label}, note_or_excerpt=${evidence.noteOrExcerpt}, url=${evidence.url}, kind=${evidence.url ? "link" : "note"} where id=${evidence.id} and experience_id=${experienceId} and profile_id=${profileId}`; else await transaction`insert into public.evidence (profile_id, experience_id, kind, label, note_or_excerpt, url, source_kind) values (${profileId}, ${experienceId}, ${evidence.url ? "link" : "note"}, ${evidence.label}, ${evidence.noteOrExcerpt}, ${evidence.url}, 'user_report')`; }
    const themeIds = edit.themes.map((item) => item.themeId); if (themeIds.length) await transaction`delete from public.experience_themes where experience_id=${experienceId} and profile_id=${profileId} and theme_id not in ${transaction(themeIds)}`; else await transaction`delete from public.experience_themes where experience_id=${experienceId} and profile_id=${profileId}`;
    for (const theme of edit.themes) await transaction`insert into public.experience_themes (experience_id, theme_id, profile_id, strength, rationale, status, source_kind, approved_at) values (${experienceId}, ${theme.themeId}, ${profileId}, ${theme.strength}, ${theme.rationale}, 'accepted', 'user_report', now()) on conflict (experience_id, theme_id) do update set strength=excluded.strength, rationale=excluded.rationale, status='accepted', approved_at=coalesce(public.experience_themes.approved_at, now())`;
    return rows[0].revision;
  }); } finally { await sql.end(); }
}
