-- NOT APPLIED. Requires the verified UUID created for the authorized owner.
-- No table, role, service key, anon SELECT or public capture policy changes.
begin;
do $migration$
declare
  owner_uuid uuid := 'REPLACE_WITH_VERIFIED_OWNER_UUID';
begin
  if not exists (select 1 from auth.users where id=owner_uuid and email_confirmed_at is not null) then
    raise exception 'Owner account must exist and have confirmed email';
  end if;
  if not (select relrowsecurity from pg_class where oid='public.halloween_leads'::regclass) then
    raise exception 'RLS must remain enabled';
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='halloween_leads' and cmd in ('SELECT','ALL')) then
    raise exception 'Review existing read policies before adding owner access';
  end if;
  execute format('create policy halloween_owner_read on public.halloween_leads for select to authenticated using ((select auth.uid()) = %L::uuid)', owner_uuid);
end
$migration$;
grant select (id,name,email,phone,instagram,skate_type,answers,level,score,gift,marketing,consent,test_version,created_at,career_interest,zone,mentorship_opt_in) on public.halloween_leads to authenticated;
commit;
