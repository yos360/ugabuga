-- Clicks on sponsored banners ("פרסומת") for the owner report (/admin/activity → "לחיצות על באנרים").
--
-- The site already records each click through record_site_event_v3 as action 'use' with category
-- 'sponsor:<id>' (src/utils/liveActivity.js → logSponsorClick), on the page where the banner was
-- clicked. No new table and nothing personal: the same anonymous daily visitor id as every other event.
-- owner_sponsor_clicks() is owner-only and returns aggregates only.
-- Safe to run twice. Applied automatically by .github/workflows/apply-migrations.yml.

create index if not exists owner_site_activity_sponsor
  on public.owner_site_activity(created_at desc) where category like 'sponsor:%';

-- Owner only. Days are Israel calendar days.
create or replace function public.owner_sponsor_clicks(p_from timestamptz, p_to timestamptz)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  return (
    with c as (
      select substr(category, 9) sponsor, coalesce(path, '') path, visitor,
             (created_at at time zone 'Asia/Jerusalem')::date d
      from public.owner_site_activity
      where created_at >= p_from and created_at < p_to
        and action = 'use' and category like 'sponsor:%'
    )
    select coalesce(jsonb_agg(x order by x.clicks desc, x.sponsor), '[]'::jsonb) from (
      select s.sponsor,
             count(*) clicks,
             count(distinct c.visitor) visitors,
             (select coalesce(jsonb_agg(p order by p.n desc, p.path), '[]'::jsonb) from (
                select c2.path, count(*) n from c c2 where c2.sponsor = s.sponsor group by 1 order by 2 desc, 1 limit 15) p) pages,
             (select coalesce(jsonb_agg(dd order by dd.d), '[]'::jsonb) from (
                select c3.d, count(*) n from c c3 where c3.sponsor = s.sponsor group by 1) dd) by_day
      from (select distinct sponsor from c) s join c on c.sponsor = s.sponsor
      group by s.sponsor
    ) x
  );
end;
$$;
revoke all on function public.owner_sponsor_clicks(timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.owner_sponsor_clicks(timestamptz, timestamptz) to authenticated;

notify pgrst, 'reload schema';
