-- Para una base existente creada con la versión de 14 o 15 preguntas.
-- Conserva los registros anteriores. Ejecutar antes de publicar esta versión.
begin;
alter table public.halloween_leads drop constraint halloween_leads_answers_check;
alter table public.halloween_leads drop constraint halloween_leads_test_version_check;
alter table public.halloween_leads add constraint halloween_leads_answers_check check (
 jsonb_typeof(answers) = 'array' and (
 (test_version = 'halloween-2026-v2-rigid-14' and jsonb_array_length(answers) = 14) or
 (test_version = 'halloween-2026-v3-braking-15' and jsonb_array_length(answers) = 15) or
 (test_version = 'halloween-2026-v4-braking-16' and jsonb_array_length(answers) = 16)
 ));
alter table public.halloween_leads add constraint halloween_leads_test_version_check check (
 test_version in ('halloween-2026-v2-rigid-14', 'halloween-2026-v3-braking-15', 'halloween-2026-v4-braking-16'));
alter policy halloween_capture_only on public.halloween_leads with check (
 consent = true and test_version in ('halloween-2026-v2-rigid-14', 'halloween-2026-v3-braking-15', 'halloween-2026-v4-braking-16'));
commit;
