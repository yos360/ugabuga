-- Function access clean-up (Supabase security advisor, 2026-10-03). Safe to run more than once.
--
-- Postgres lets everyone (PUBLIC, so also the anon key) execute a new function unless that is
-- revoked. The site only calls a known set of RPCs; everything else is closed here.

do $$
declare
  f regprocedure;
begin
  -- 1) Internal helpers. They are only called from inside SECURITY DEFINER functions (which run as
  --    the owner), so nobody needs to call them directly.
  for f in
    select p.oid::regprocedure from pg_proc p
    where p.pronamespace = 'public'::regnamespace and p.proname in (
      'sup_url', 'sup_txt', 'sup_phone', 'sup_list', 'sup_stats', 'sup_public',
      'quiz_short_code', 'quiz_clean_settings', 'quiz_clean_questions', 'quiz_clean_names',
      'party_short_code', 'party_items_with_ids', 'party_item_taken', 'party_item_need',
      'party_clean_details', 'party_items_public',
      -- 2) Old versions the site no longer calls (it uses get/create/update_party_list3,
      --    claim_party_item2, unclaim_party_item and record_site_event_v2/v3).
      'get_party_list', 'get_party_list2', 'create_party_list', 'create_party_list2',
      'update_party_list', 'update_party_list2', 'claim_party_item',
      'record_site_event', 'record_print_activity')
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', f);
  end loop;

  -- 3) Signed-in only: owner report and the supplier account area. They also check the user inside,
  --    but there is no reason for the anon key to reach them at all.
  for f in
    select p.oid::regprocedure from pg_proc p
    where p.pronamespace = 'public'::regnamespace and p.proname in (
      'owner_activity_summary', 'supplier_save', 'supplier_request_page',
      'supplier_admin_list', 'supplier_admin_delete', 'supplier_mine')
  loop
    execute format('revoke execute on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;

  -- 4) Pin search_path on every function in public that doesn't have one yet
  --    (advisor: "Function Search Path Mutable").
  for f in
    select p.oid::regprocedure from pg_proc p
    where p.pronamespace = 'public'::regnamespace and p.prokind = 'f'
      and not exists (select 1 from unnest(coalesce(p.proconfig, array[]::text[])) c where c like 'search_path=%')
  loop
    execute format('alter function %s set search_path = public', f);
  end loop;
end $$;

-- Check (should return 0 rows): public functions without a pinned search_path.
-- select p.proname from pg_proc p where p.pronamespace = 'public'::regnamespace and p.prokind = 'f'
--   and not exists (select 1 from unnest(coalesce(p.proconfig, array[]::text[])) c where c like 'search_path=%');
