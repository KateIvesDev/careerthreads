alter table public.experiences
  add column if not exists revision integer not null default 1 check (revision > 0);
