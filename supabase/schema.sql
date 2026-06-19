create extension if not exists "pgcrypto";

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique,
  name text not null default '',
  major_class text not null default '',
  signature text not null default '',
  photos jsonb not null default '[]'::jsonb,
  extra_fields jsonb not null default '{}'::jsonb,
  password_hash text,
  password_set_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists students_public_id_idx on public.students(public_id);

alter table public.students enable row level security;

create policy "public profiles are readable"
on public.students
for select
using (true);

