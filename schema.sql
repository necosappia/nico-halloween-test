create table public.halloween_leads (
 id uuid primary key default gen_random_uuid(),
 name text not null check (length(trim(name)) between 2 and 100),
 email text not null check (length(email) <= 200 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
 phone text not null check (length(phone) between 8 and 25),
 answers jsonb not null check (jsonb_typeof(answers) = 'array' and jsonb_array_length(answers) = 16),
 level text not null check (level in ('preparacion','primeros-pasos','urbana')),
 score integer not null check (score between 0 and 18),
 gift text not null check (gift in ('clase','tutorial')),
 marketing boolean not null default false,
 consent boolean not null check (consent = true),
 test_version text not null check (test_version = 'halloween-2026-v4-braking-16'),
 created_at timestamptz not null default now()
);
alter table public.halloween_leads enable row level security;
revoke all on public.halloween_leads from anon, authenticated;
grant insert (id,name,email,phone,answers,level,score,gift,marketing,consent,test_version) on public.halloween_leads to anon;
create policy halloween_capture_only on public.halloween_leads for insert to anon with check (consent = true and test_version = 'halloween-2026-v4-braking-16');
grant all on public.halloween_leads to service_role;
