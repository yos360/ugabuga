-- Fix: record_site_event_v3 (202610190002_print_page_counts.sql) calls public.site_event_allowed(),
-- which was defined in 202610050001_site_event_rate_limit.sql — a file that never ran on the live
-- database. Every v3 call therefore failed, the site fell back to v2, and time on site and print
-- previews (v3-only) stopped being recorded on 19.10 at noon. This creates the function (same as
-- that file) and asks the API to reload its schema. Safe to run twice.
-- Applied automatically by .github/workflows/apply-migrations.yml.

create index if not exists owner_site_activity_visitor
  on public.owner_site_activity(visitor, created_at desc) where visitor is not null;

-- Rate limit for the anonymous analytics endpoints: per visitor 30 events a minute, events without
-- a visitor id 300 a minute in total, and 3000 a minute overall. Over the limit is silently dropped.
create or replace function public.site_event_allowed(p_visitor uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select
    (select count(*) from (select 1 from public.owner_site_activity
       where created_at > now() - interval '1 minute' limit 3000) x) < 3000
    and case
      when p_visitor is null then
        (select count(*) from (select 1 from public.owner_site_activity
           where created_at > now() - interval '1 minute' and visitor is null limit 300) x) < 300
      else
        (select count(*) from (select 1 from public.owner_site_activity
           where visitor = p_visitor and created_at > now() - interval '1 minute' limit 30) x) < 30
    end;
$$;
revoke all on function public.site_event_allowed(uuid) from public, anon, authenticated;

notify pgrst, 'reload schema';
