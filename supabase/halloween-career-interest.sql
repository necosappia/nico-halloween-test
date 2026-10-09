-- Applied to the Halloween database on 2026-10-09.
alter table public.halloween_leads add column if not exists career_interest text check (career_interest in ('enseñar','comunidad','ambas','explorar','no')), add column if not exists zone text check (char_length(zone)<=120), add column if not exists mentorship_opt_in boolean not null default false;
grant insert (career_interest,zone,mentorship_opt_in) on public.halloween_leads to anon;
