-- Owner analytics: time spent per page, print-preview opens, and a print funnel.
-- Still privacy-safe: no names, typed text, IPs or query strings.

alter table public.owner_site_activity add column if not exists seconds int;

alter table public.owner_site_activity drop constraint if exists owner_site_activity_action_check;
alter table public.owner_site_activity add constraint owner_site_activity_action_check
  check (action in ('open','print','play','check','download','refresh','create','use','share','preview','time'));
alter table public.owner_site_activity drop constraint if exists owner_site_activity_seconds_check;
alter table public.owner_site_activity add constraint owner_site_activity_seconds_check
  check (seconds is null or seconds between 1 and 14400);

create or replace function public.record_site_event_v3(
  p_category text, p_action text, p_path text default null,
  p_device text default null, p_source text default null, p_visitor uuid default null, p_seconds int default null)
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
  if p_path is not null and p_path !~ '^/[a-z0-9/_-]{0,119}$' then p_path := null; end if;
  if p_device is not null and p_device not in ('mobile','desktop') then p_device := null; end if;
  if p_source is not null and p_source not in ('direct','internal','google','bing','facebook','instagram','whatsapp','tiktok','youtube','email','qr','other') then p_source := null; end if;
  insert into public.owner_site_activity(category, action, path, device, source, visitor, seconds)
    values (left(p_category, 60), p_action, p_path, p_device, p_source, p_visitor, p_seconds);
end;
$$;
revoke all on function public.record_site_event_v3(text,text,text,text,text,uuid,int) from public;
grant execute on function public.record_site_event_v3(text,text,text,text,text,uuid,int) to anon, authenticated;

-- 'qr' was sent by the client but rejected by the old source check; allow it.
alter table public.owner_site_activity drop constraint if exists owner_site_activity_source_check;
alter table public.owner_site_activity add constraint owner_site_activity_source_check
  check (source is null or source in ('direct','internal','google','bing','facebook','instagram','whatsapp','tiktok','youtube','email','qr','other'));

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
    'visitors', (select count(distinct visitor) from a where visitor is not null),
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
    'recent', coalesce((select jsonb_agg(jsonb_build_object('at', created_at, 'path', path, 'category', category, 'action', action, 'device', device, 'source', source, 'seconds', seconds) order by created_at desc) from (
        select * from a order by created_at desc limit 100) x), '[]'::jsonb)
  );
$$;
revoke all on function public.owner_activity_summary(timestamptz, timestamptz) from public, anon;
grant execute on function public.owner_activity_summary(timestamptz, timestamptz) to authenticated;
