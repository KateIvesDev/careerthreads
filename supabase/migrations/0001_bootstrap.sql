create table if not exists public.careerthread_health (
  id smallint primary key check (id = 1),
  checked_at timestamptz not null default now()
);

insert into public.careerthread_health (id)
values (1)
on conflict (id) do update set checked_at = now();

alter table public.careerthread_health enable row level security;
