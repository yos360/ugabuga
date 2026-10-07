-- Owner report: "visitors" counts only people who opened a page or did something in the range.
-- Before, a visitor whose only row in the range was a time-on-page report (e.g. a tab opened
-- before midnight, closed after it) was counted as a visitor of the new day too.
-- Same function as 202610040001_owner_by_visitor.sql except for the 'visitors' line.
create or replace function public.owner_activity_summary(p_from timestamptz, p_to timestamptz)
returns jsonb language sql stable security invoker set search_path = '' as $$
  with a as (
    select *, (created_at at time zone 'Asia/Jerusalem') as local_at
    from public.owner_site_activity
    where created_at >= p_from and created_at < p_to
  ), e as (select * from a where action <> 'time'),
     t as (select * from a where action = 'time')
  select jsonb_build_object(
    'total', (select count(*) from e),
    'visitors', (select count(distinct visitor) from e where visitor is not null),
    'pageviews', (select count(*) from e where action = 'open'),
    'by_action', coalesce((select jsonb_object_agg(action, n) from (select action, count(*) n from e group by action) x), '{}'::jsonb),
    'by_day', coalesce((select jsonb_agg(jsonb_build_object('day', d, 'events', n, 'visitors', v) order by d) from (
        select local_at::date d, count(*) n, count(distinct visitor) v from e group by 1) x), '[]'::jsonb),
    'by_hour', coalesce((select jsonb_agg(jsonb_build_object('hour', h, 'events', n) order by h) from (
        select extract(hour from local_at)::int h, count(*) n from e group by 1) x), '[]'::jsonb),
    'devices', coalesce((select jsonb_object_agg(coalesce(device,'unknown'), n) from (select device, count(distinct coalesce(visitor::text, id::text)) n from e group by device) x), '{}'::jsonb),
    'sources', coalesce((select jsonb_object_agg(coalesce(source,'unknown'), n) from (select source, count(distinct coalesce(visitor::text, id::text)) n from e group by source) x), '{}'::jsonb),
    'top', coalesce((select jsonb_agg(jsonb_build_object('path', path, 'category', category, 'action', action, 'n', n) order by n desc) from (
        select coalesce(path, '') path, category, action, count(*) n from e group by 1, 2, 3 order by 4 desc limit 300) x), '[]'::jsonb),
    'time_total', coalesce((select sum(seconds) from t), 0),
    'time_visitors', (select count(distinct visitor) from t where visitor is not null),
    'time_by_path', coalesce((select jsonb_agg(jsonb_build_object('path', path, 'category', category, 'visits', n, 'visitors', v, 'total', s, 'avg', av) order by s desc) from (
        select coalesce(path,'') path, category, count(*) n, count(distinct visitor) v, sum(seconds) s, round(avg(seconds))::int av
        from t group by 1, 2 order by 5 desc limit 60) x), '[]'::jsonb),
    'print_funnel', coalesce((select jsonb_agg(jsonb_build_object('path', path, 'category', category, 'opens', o, 'previews', pv, 'prints', pr) order by pr desc, pv desc) from (
        select coalesce(path,'') path, category,
               count(*) filter (where action = 'open') o,
               count(*) filter (where action = 'preview') pv,
               count(*) filter (where action = 'print') pr
        from e group by 1, 2
        having count(*) filter (where action in ('preview','print')) > 0
        order by 5 desc, 4 desc limit 60) x), '[]'::jsonb),
    'qr_landing', coalesce((select jsonb_agg(jsonb_build_object('path', path, 'category', category, 'scans', n) order by n desc) from (
        select path, category, count(*) n from (
          select distinct on (coalesce(visitor::text, id::text)) coalesce(path,'') path, category
          from e where source = 'qr' and action = 'open'
          order by coalesce(visitor::text, id::text), created_at) f
        group by 1, 2 order by 3 desc limit 40) x), '[]'::jsonb),
    'by_visitor', coalesce((select jsonb_agg(x order by x.events desc, x.last desc) from (
        select left(visitor::text, 6) v,
               count(*) filter (where action <> 'time') events,
               count(*) filter (where action = 'open') opens,
               count(*) filter (where action not in ('open', 'time')) acts,
               count(distinct path) filter (where action <> 'time') pages,
               coalesce(sum(seconds), 0) secs,
               (array_agg(source order by created_at))[1] source,
               (array_agg(device order by created_at))[1] device,
               min(created_at) first, max(created_at) last,
               (array_agg(jsonb_build_object('p', coalesce(path, ''), 'c', category, 'a', action, 'at', created_at) order by created_at)
                  filter (where action <> 'time'))[1:30] steps
        from a where visitor is not null group by visitor
        order by 2 desc, 10 desc limit 80) x), '[]'::jsonb),
    'recent', coalesce((select jsonb_agg(jsonb_build_object('at', created_at, 'path', path, 'category', category, 'action', action, 'device', device, 'source', source, 'seconds', seconds, 'visitor', left(visitor::text, 6)) order by created_at desc) from (
        select * from a order by created_at desc limit 100) x), '[]'::jsonb)
  );
$$;
revoke all on function public.owner_activity_summary(timestamptz, timestamptz) from public, anon;
grant execute on function public.owner_activity_summary(timestamptz, timestamptz) to authenticated;
