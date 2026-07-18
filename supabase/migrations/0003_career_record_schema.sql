create table if not exists public.profiles (
  id uuid primary key,
  display_name text not null check (length(trim(display_name)) > 0),
  headline text not null check (length(trim(headline)) > 0),
  demo_mode boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.reflection_sessions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  initial_text text not null check (length(trim(initial_text)) > 0),
  follow_up_question text,
  follow_up_answer text,
  input_mode text not null check (input_mode in ('text', 'voice_transcript')),
  status text not null check (status in ('captured', 'questioned', 'extracted', 'completed', 'discarded')),
  generation_mode text check (generation_mode in ('live', 'heuristic', 'fixture')),
  created_at timestamptz not null default now()
);

create table if not exists public.experience_drafts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  session_id uuid not null unique references public.reflection_sessions(id) on delete cascade,
  payload_json jsonb not null,
  schema_version text not null,
  model text,
  prompt_version text not null,
  generation_mode text not null check (generation_mode in ('live', 'fixture')),
  status text not null check (status in ('proposed', 'accepted', 'rejected')),
  revision integer not null default 1 check (revision > 0),
  accepted_experience_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  occurred_on date not null,
  summary text not null check (length(trim(summary)) > 0),
  ownership text,
  interpretation text,
  uncertainty text,
  source_kind text not null check (source_kind in ('user_report', 'evidence', 'ai_interpretation', 'derived')),
  confidence text not null check (confidence in ('reported', 'supported', 'needs_evidence')),
  approved_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.experience_drafts
  drop constraint if exists experience_drafts_accepted_experience_id_fkey;
alter table public.experience_drafts
  add constraint experience_drafts_accepted_experience_id_fkey
  foreign key (accepted_experience_id) references public.experiences(id) on delete set null;

create table if not exists public.evidence (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  experience_id uuid not null references public.experiences(id) on delete cascade,
  kind text not null check (kind in ('note', 'link', 'file')),
  label text not null check (length(trim(label)) > 0),
  note_or_excerpt text,
  url text,
  storage_path text,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  source_kind text not null check (source_kind in ('user_report', 'evidence', 'ai_interpretation', 'derived')),
  created_at timestamptz not null default now(),
  check (url is null or url ~ '^https://')
);

create table if not exists public.impacts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  experience_id uuid not null references public.experiences(id) on delete cascade,
  description text not null check (length(trim(description)) > 0),
  metric_value text,
  metric_unit text,
  scope text,
  source_kind text not null check (source_kind in ('user_report', 'evidence', 'ai_interpretation', 'derived')),
  confidence text not null check (confidence in ('reported', 'supported', 'needs_evidence')),
  approved_at timestamptz not null
);

create table if not exists public.themes (
  id uuid primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null,
  name text not null,
  description text not null,
  unique (profile_id, slug)
);

create table if not exists public.experience_themes (
  experience_id uuid not null references public.experiences(id) on delete cascade,
  theme_id uuid not null references public.themes(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  strength smallint not null check (strength in (1, 2)),
  rationale text not null check (length(trim(rationale)) > 0),
  status text not null check (status in ('proposed', 'accepted', 'rejected')),
  source_kind text not null check (source_kind in ('user_report', 'evidence', 'ai_interpretation', 'derived')),
  approved_at timestamptz,
  primary key (experience_id, theme_id)
);

create table if not exists public.insights (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  status text not null check (status in ('proposed', 'accepted', 'rejected')),
  source_kind text not null check (source_kind in ('user_report', 'evidence', 'ai_interpretation', 'derived')),
  confidence_label text not null check (confidence_label in ('emerging', 'recurring', 'well_supported')),
  generated_at timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  status text not null check (status in ('active', 'completed', 'paused')),
  target_date date,
  source_kind text not null check (source_kind in ('user_report', 'evidence', 'ai_interpretation', 'derived'))
);

create table if not exists public.career_assets (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('promotion_packet')),
  title text not null,
  content_json jsonb not null,
  status text not null check (status in ('draft', 'final')),
  model text,
  prompt_version text not null,
  generation_mode text not null check (generation_mode in ('live', 'template', 'fixture')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.provenance_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  subject_type text not null check (subject_type in ('experience', 'impact', 'theme_link', 'insight', 'asset_claim')),
  subject_id uuid not null,
  source_type text not null check (source_type in ('reflection_session', 'experience', 'impact', 'evidence')),
  source_id uuid not null,
  relation text not null check (relation in ('reported_in', 'supports', 'interpreted_from', 'cites')),
  quote text,
  created_at timestamptz not null default now()
);

create index if not exists experiences_profile_date_idx
  on public.experiences (profile_id, occurred_on desc);
create index if not exists experience_themes_profile_idx
  on public.experience_themes (profile_id, theme_id);
create index if not exists provenance_subject_idx
  on public.provenance_links (profile_id, subject_type, subject_id);

alter table public.profiles enable row level security;
alter table public.reflection_sessions enable row level security;
alter table public.experience_drafts enable row level security;
alter table public.experiences enable row level security;
alter table public.evidence enable row level security;
alter table public.impacts enable row level security;
alter table public.themes enable row level security;
alter table public.experience_themes enable row level security;
alter table public.insights enable row level security;
alter table public.goals enable row level security;
alter table public.career_assets enable row level security;
alter table public.provenance_links enable row level security;

grant select, insert, update, delete on table
  public.profiles,
  public.reflection_sessions,
  public.experience_drafts,
  public.experiences,
  public.evidence,
  public.impacts,
  public.themes,
  public.experience_themes,
  public.insights,
  public.goals,
  public.career_assets,
  public.provenance_links
to service_role;
