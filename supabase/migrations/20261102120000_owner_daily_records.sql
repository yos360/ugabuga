-- Best single day (Israel time) for each headline number of the mini report, over every day before
-- p_before (the start of today), so the widget can show "record: N" and a trophy when today beats it.
-- Same definitions as owner_activity_summary. Safe to run twice.
create or replace function public.owner_daily_records(p_before timestamptz)
returns jsonb language sql stable security invoker set search_path = '' as $$
  with d as (
    select (created_at at time zone 'Asia/Jerusalem')::date as day,
      count(distinct visitor) filter (where action <> 'time' and visitor is not null) as visitors,
      count(*) filter (where action = 'open') as pageviews,
      coalesce(sum(seconds) filter (where action = 'time'), 0) as time_total,
      count(distinct visitor) filter (where action = 'time' and visitor is not null) as time_visitors,
      count(*) filter (where action = 'preview') as preview,
      count(*) filter (where action = 'print') as print,
      count(*) filter (where action = 'download') as download,
      coalesce(sum(coalesce(pages, 1)) filter (where action in ('print', 'download')), 0) as pages,
      count(distinct coalesce(visitor::text, id::text)) filter (where action <> 'time' and source = 'qr') as qr,
      count(*) filter (where action = 'share') as share
    from public.owner_site_activity
    where created_at < p_before
    group by 1
  ), v as (
    select d.day, x.k, x.n
    from d cross join lateral (values
      ('visitors', d.visitors::numeric), ('pageviews', d.pageviews::numeric),
      ('avg_time', case when d.time_visitors > 0 then round(d.time_total::numeric / d.time_visitors) end),
      ('preview', d.preview::numeric), ('print', d.print::numeric), ('download', d.download::numeric),
      ('pages', d.pages::numeric), ('qr', d.qr::numeric), ('share', d.share::numeric)) as x(k, n)
    where x.n > 0
  ), best as (
    select distinct on (k) k, n, day from v order by k, n desc, day
  )
  select coalesce(jsonb_object_agg(k, jsonb_build_object('value', n, 'day', day)), '{}'::jsonb) from best;
$$;
revoke all on function public.owner_daily_records(timestamptz) from public, anon;
grant execute on function public.owner_daily_records(timestamptz) to authenticated;
