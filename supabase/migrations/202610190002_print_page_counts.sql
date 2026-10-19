-- Printed sheets, not just print clicks: printing 30 coloring pages at once used to count as one.
-- The site now sends how many A4 sheets each print or PDF contains (copies included); this stores it
-- and adds sheet totals to the owner report. Safe to run twice.
alter table public.owner_site_activity add column if not exists pages int;

-- Same as 202610050001_site_event_rate_limit.sql, plus p_pages (1–500) for print and download rows.
drop function if exists public.record_site_event_v3(text, text, text, text, text, uuid, int);
create or replace function public.record_site_event_v3(
  p_category text, p_action text, p_path text default null,
  p_device text default null, p_source text default null, p_visitor uuid default null, p_seconds int default null,
  p_pages int default null)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_category is null or p_action is null then return; end if;
  if char_length(p_category) = 0 or char_length(p_category) > 60 then return; end if;
  if p_action not in ('open','print','play','check','download','refresh','create','use','share','preview','time') then return; end if;
  if p_action = 'time' then
    if p_seconds is null or p_seconds < 3 then return; end if;
    p_seconds := least(p_seconds, 14400);
  else
    p_seconds := null;
  end if;
  if p_action in ('print', 'download') and p_pages is not null then p_pages := least(greatest(p_pages, 1), 500); else p_pages := null; end if;
  if not public.site_event_allowed(p_visitor) then return; end if;
  if p_path is not null and p_path !~ '^/[a-z0-9/_-]{0,119}$' then p_path := null; end if;
  if p_device is not null and p_device not in ('mobile','desktop') then p_device := null; end if;
  if p_source is not null and p_source not in ('direct','internal','google','bing','facebook','instagram','whatsapp','tiktok','youtube','email','qr','other') then p_source := null; end if;
  insert into public.owner_site_activity(category, action, path, device, source, visitor, seconds, pages)
    values (left(p_category, 60), p_action, p_path, p_device, p_source, p_visitor, p_seconds, p_pages);
end;
$$;
revoke all on function public.record_site_event_v3(text,text,text,text,text,uuid,int,int) from public;
grant execute on function public.record_site_event_v3(text,text,text,text,text,uuid,int,int) to anon, authenticated;

-- Same as 202610070002_owner_visitors_active_only.sql, plus pages_by_action, sheet totals in
-- print_funnel and pages in recent.
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
    -- Sheets, not clicks: one print of 30 coloring pages is 30. Rows from before the page count was
    -- recorded count as one sheet each.
    'pages_by_action', jsonb_build_object(
        'print', coalesce((select sum(coalesce(pages, 1)) from e where action = 'print'), 0),
        'download', coalesce((select sum(coalesce(pages, 1)) from e where action = 'download'), 0)),
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
    'print_funnel', coalesce((select jsonb_agg(jsonb_build_object('path', path, 'category', category, 'opens', o, 'previews', pv, 'prints', pr, 'print_pages', pp, 'pdf_pages', dp) order by pr desc, pv desc) from (
        select coalesce(path,'') path, category,
               count(*) filter (where action = 'open') o,
               count(*) filter (where action = 'preview') pv,
               count(*) filter (where action = 'print') pr,
               coalesce(sum(coalesce(pages, 1)) filter (where action = 'print'), 0) pp,
               coalesce(sum(coalesce(pages, 1)) filter (where action = 'download'), 0) dp
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
    'recent', coalesce((select jsonb_agg(jsonb_build_object('at', created_at, 'path', path, 'category', category, 'action', action, 'device', device, 'source', source, 'seconds', seconds, 'pages', pages, 'visitor', left(visitor::text, 6)) order by created_at desc) from (
        select * from a order by created_at desc limit 100) x), '[]'::jsonb)
  );
$$;
revoke all on function public.owner_activity_summary(timestamptz, timestamptz) from public, anon;
grant execute on function public.owner_activity_summary(timestamptz, timestamptz) to authenticated;
