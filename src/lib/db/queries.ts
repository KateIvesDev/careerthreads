import "server-only";

import { getDemoProfileId } from "@/lib/auth/demo-profile";
import { createServerDatabaseClient } from "@/lib/db/client";
import type {
  CareerRecordView,
  Confidence,
  SourceKind,
} from "@/lib/db/types";
import type { ExperienceExtraction } from "@/lib/ai/extraction-schema";
import { buildCareerEvolution } from "@/lib/domain/career-evolution";
import type { EvolutionInput } from "@/lib/domain/career-evolution";
import type { PromotionPacketDraft } from "@/lib/ai/schemas";
import type { PromotionSource } from "@/lib/domain/provenance";

function assertNoError(error: { message: string } | null, operation: string) {
  if (error) {
    throw new Error(`${operation} failed`);
  }
}

export async function getReflectionSession(sessionId: string) {
  const database = createServerDatabaseClient();
  const result = await database
    .from("reflection_sessions")
    .select("id, initial_text, follow_up_question, follow_up_answer, status")
    .eq("id", sessionId)
    .eq("profile_id", getDemoProfileId())
    .maybeSingle();
  assertNoError(result.error, "Reflection-session query");
  return result.data;
}

export async function getRecentExperienceContext() {
  const database = createServerDatabaseClient();
  const result = await database
    .from("experiences")
    .select("title, occurred_on")
    .eq("profile_id", getDemoProfileId())
    .not("approved_at", "is", null)
    .order("occurred_on", { ascending: false })
    .limit(5);
  assertNoError(result.error, "Recent-experience query");
  return (result.data ?? []).map((item) => ({ title: item.title, occurredOn: item.occurred_on }));
}

export async function getThemeVocabulary() {
  const database = createServerDatabaseClient();
  const result = await database
    .from("themes")
    .select("id, slug, name, description")
    .eq("profile_id", getDemoProfileId())
    .order("name");
  assertNoError(result.error, "Theme-vocabulary query");
  return result.data ?? [];
}

export async function getExperienceDraft(draftId: string) {
  const database = createServerDatabaseClient();
  const result = await database
    .from("experience_drafts")
    .select("id, payload_json, generation_mode, status, revision")
    .eq("id", draftId)
    .eq("profile_id", getDemoProfileId())
    .maybeSingle();
  assertNoError(result.error, "Experience-draft query");
  return result.data
    ? { ...result.data, payload_json: result.data.payload_json as ExperienceExtraction }
    : null;
}

export async function getCareerEvolution() {
  const database = createServerDatabaseClient();
  const profileId = getDemoProfileId();
  const [experiences, themes, links] = await Promise.all([
    database.from("experiences").select("id, title, occurred_on").eq("profile_id", profileId).not("approved_at", "is", null),
    database.from("themes").select("id, slug, name").eq("profile_id", profileId),
    database.from("experience_themes").select("experience_id, theme_id, strength, rationale, status, source_kind, approved_at").eq("profile_id", profileId),
  ]);
  assertNoError(experiences.error, "Evolution-experience query");
  assertNoError(themes.error, "Evolution-theme query");
  assertNoError(links.error, "Evolution-link query");
  const experienceMap = new Map((experiences.data ?? []).map((item) => [item.id, item]));
  const themeMap = new Map((themes.data ?? []).map((item) => [item.id, item]));
  const inputs: EvolutionInput[] = (links.data ?? []).flatMap((link) => {
    const experience = experienceMap.get(link.experience_id); const theme = themeMap.get(link.theme_id);
    if (!experience || !theme) return [];
    return [{
      experienceId: experience.id, title: experience.title, occurredOn: experience.occurred_on,
      themeId: theme.id, themeSlug: theme.slug, themeName: theme.name,
      strength: link.strength as 1 | 2, rationale: link.rationale,
      sourceKind: link.source_kind as SourceKind,
      status: link.status as EvolutionInput["status"], approvedAt: link.approved_at,
    }];
  });
  return buildCareerEvolution(inputs);
}

export async function getExperienceDetail(experienceId: string) {
  const database = createServerDatabaseClient(); const profileId = getDemoProfileId();
  const [experience, links] = await Promise.all([
    database.from("experiences").select("id, title, occurred_on, summary, ownership, interpretation, uncertainty, source_kind, confidence, approved_at, revision, impacts(id, description, confidence), evidence(id, label, note_or_excerpt, url, source_kind)").eq("id", experienceId).eq("profile_id", profileId).not("approved_at", "is", null).maybeSingle(),
    database.from("experience_themes").select("theme_id, strength, rationale, source_kind, approved_at, themes!inner(name, slug)").eq("experience_id", experienceId).eq("profile_id", profileId).eq("status", "accepted").not("approved_at", "is", null),
  ]);
  assertNoError(experience.error, "Experience-detail query"); assertNoError(links.error, "Experience-theme-detail query");
  return experience.data ? { ...experience.data, themes: links.data ?? [] } : null;
}

export async function getPromotionSourceOptions() {
  const database = createServerDatabaseClient(); const result = await database.from("experiences").select("id, title, occurred_on, summary, confidence").eq("profile_id", getDemoProfileId()).not("approved_at", "is", null).order("occurred_on", { ascending: false });
  assertNoError(result.error, "Promotion-source-options query"); return result.data ?? [];
}

export async function getPromotionSources(experienceIds: string[]): Promise<PromotionSource[]> {
  const uniqueIds = [...new Set(experienceIds)]; if (uniqueIds.length < 2 || uniqueIds.length > 4) throw new Error("Select two to four approved experiences");
  const database = createServerDatabaseClient(); const profileId = getDemoProfileId();
  const [experiences, links] = await Promise.all([
    database.from("experiences").select("id, title, occurred_on, summary, ownership, confidence, impacts(description, confidence), evidence(label, note_or_excerpt)").eq("profile_id", profileId).in("id", uniqueIds).not("approved_at", "is", null),
    database.from("experience_themes").select("experience_id, rationale, themes!inner(name)").eq("profile_id", profileId).in("experience_id", uniqueIds).eq("status", "accepted").not("approved_at", "is", null),
  ]);
  assertNoError(experiences.error, "Promotion-sources query"); assertNoError(links.error, "Promotion-source-themes query");
  if ((experiences.data ?? []).length !== uniqueIds.length) throw new Error("Unknown promotion source");
  return (experiences.data ?? []).map((item) => ({
    id: item.id, title: item.title, occurredOn: item.occurred_on, summary: item.summary, ownership: item.ownership,
    confidence: item.confidence as PromotionSource["confidence"], impacts: item.impacts as PromotionSource["impacts"],
    evidence: item.evidence.map((evidence) => ({ label: evidence.label, noteOrExcerpt: evidence.note_or_excerpt })),
    themes: (links.data ?? []).filter((link) => link.experience_id === item.id).flatMap((link) => link.themes[0] ? [{ name: link.themes[0].name, rationale: link.rationale }] : []),
  }));
}

export async function getCareerAsset(assetId: string) {
  const database = createServerDatabaseClient(); const result = await database.from("career_assets").select("id, title, content_json, status, generation_mode, model, prompt_version").eq("id", assetId).eq("profile_id", getDemoProfileId()).maybeSingle();
  assertNoError(result.error, "Career-asset query"); return result.data ? { ...result.data, content_json: result.data.content_json as PromotionPacketDraft } : null;
}

export async function getAssetSourceIds(assetId: string) {
  const asset = await getCareerAsset(assetId); if (!asset) return null;
  return [...new Set(asset.content_json.claims.flatMap((claim) => claim.sourceIds))];
}

export async function getCareerRecord(): Promise<CareerRecordView> {
  const profileId = getDemoProfileId();
  const database = createServerDatabaseClient();

  const [profileResult, experiencesResult, themesResult, linksResult, insightResult, goalResult] =
    await Promise.all([
      database
        .from("profiles")
        .select("id, display_name, headline")
        .eq("id", profileId)
        .single(),
      database
        .from("experiences")
        .select(
          "id, title, occurred_on, summary, confidence, source_kind, impacts(description), evidence(id)",
        )
        .eq("profile_id", profileId)
        .not("approved_at", "is", null)
        .order("occurred_on", { ascending: false })
        .limit(8),
      database
        .from("themes")
        .select("id, slug, name, description")
        .eq("profile_id", profileId)
        .order("name"),
      database
        .from("experience_themes")
        .select("theme_id")
        .eq("profile_id", profileId)
        .eq("status", "accepted"),
      database
        .from("insights")
        .select("title, body, source_kind")
        .eq("profile_id", profileId)
        .eq("status", "accepted")
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      database
        .from("goals")
        .select("title, target_date")
        .eq("profile_id", profileId)
        .eq("status", "active")
        .limit(1)
        .maybeSingle(),
    ]);

  assertNoError(profileResult.error, "Profile query");
  assertNoError(experiencesResult.error, "Experience query");
  assertNoError(themesResult.error, "Theme query");
  assertNoError(linksResult.error, "Theme-link query");
  assertNoError(insightResult.error, "Insight query");
  assertNoError(goalResult.error, "Goal query");

  if (!profileResult.data) {
    throw new Error("Demo profile not found");
  }

  const themeCounts = new Map<string, number>();
  for (const link of linksResult.data ?? []) {
    themeCounts.set(link.theme_id, (themeCounts.get(link.theme_id) ?? 0) + 1);
  }

  return {
    profile: {
      id: profileResult.data.id,
      displayName: profileResult.data.display_name,
      headline: profileResult.data.headline,
    },
    experiences: (experiencesResult.data ?? []).map((experience) => ({
      id: experience.id,
      title: experience.title,
      occurredOn: experience.occurred_on,
      summary: experience.summary,
      confidence: experience.confidence as Confidence,
      sourceKind: experience.source_kind as SourceKind,
      impact: experience.impacts[0]?.description ?? null,
      evidenceCount: experience.evidence.length,
    })),
    themes: (themesResult.data ?? [])
      .map((theme) => ({
        id: theme.id,
        slug: theme.slug,
        name: theme.name,
        description: theme.description,
        experienceCount: themeCounts.get(theme.id) ?? 0,
      }))
      .sort((a, b) => b.experienceCount - a.experienceCount),
    evolution: await getCareerEvolution(),
    insight: insightResult.data
      ? {
          title: insightResult.data.title,
          body: insightResult.data.body,
          sourceKind: insightResult.data.source_kind as SourceKind,
        }
      : null,
    goal: goalResult.data
      ? {
          title: goalResult.data.title,
          targetDate: goalResult.data.target_date,
        }
      : null,
  };
}
