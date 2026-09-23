-- Richer, still privacy-safe owner analytics.
-- Adds to every event: the page path (which game / printable / tool), device type,
-- traffic source, and an anonymous visitor id that the browser rotates every 24h
-- (counts unique daily visitors without identifying anyone). Still never stores
-- names, form input, IP addresses or query strings.

alter table public.owner_site_activity
  add column if not exists path text,
  add column if not exists device text,
  add column if not exists source text,
  add column if not exists visitor uuid;

alter table public.owner_site_activity drop constraint if exists owner_site_activity_action_check;
alter table public.owner_site_activity drop constraint if exists owner_site_activity_path_check;
alter table public.owner_site_activity drop constraint if exists owner_site_activity_device_check;
alter table public.owner_site_activity drop constraint if exists owner_site_activity_source_check;
alter table public.owner_site_activity add constraint owner_site_activity_action_check
  check (action in ('open','print','play','check','download','refresh','create','use','share'));
alter table public.owner_site_activity add constraint owner_site_activity_path_check
  check (path is null or path ~ '^/[a-z0-9/_-]{0,119}$');
alter table public.owner_site_activity add constraint owner_site_activity_device_check
  check (device is null or device in ('mobile','desktop'));
alter table public.owner_site_activity add constraint owner_site_activity_source_check
  check (source is null or source in ('direct','internal','google','bing','facebook','instagram','whatsapp','tiktok','youtube','email','other'));

create index if not exists owner_site_activity_path on public.owner_site_activity(path, created_at desc);

-- Insert-only entry point for anonymous visitors. Invalid optional fields are
-- dropped (stored as null) instead of rejecting the whole event.
create or replace function public.record_site_event_v2(
  p_category text, p_action text, p_path text default null,
  p_device text default null, p_source text default null, p_visitor uuid default null)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_category is null or p_action is null then return; end if;
  if char_length(p_category) = 0 or char_length(p_category) > 60 then return; end if;
  if p_action not in ('open','print','play','check','download','refresh','create','use','share') then return; end if;
  if p_path is not null and p_path !~ '^/[a-z0-9/_-]{0,119}$' then p_path := null; end if;
  if p_device is not null and p_device not in ('mobile','desktop') then p_device := null; end if;
  if p_source is not null and p_source not in ('direct','internal','google','bing','facebook','instagram','whatsapp','tiktok','youtube','email','other') then p_source := null; end if;
  delete from public.owner_site_activity where created_at < now() - interval '400 days';
  insert into public.owner_site_activity(category, action, path, device, source, visitor)
    values (left(p_category, 60), p_action, p_path, p_device, p_source, p_visitor);
end;
$$;
revoke all on function public.record_site_event_v2(text,text,text,text,text,uuid) from public;
grant execute on function public.record_site_event_v2(text,text,text,text,text,uuid) to anon, authenticated;

-- Owner-only aggregate report for a date range, computed in the database so the
-- dashboard stays fast however many events there are. SECURITY INVOKER: it reads
-- through the table's owner-only RLS policy, so anyone else simply gets zeros.
create or replace function public.owner_activity_summary(p_from timestamptz, p_to timestamptz)
returns jsonb language sql stable security invoker set search_path = '' as $$
  with e as (
    select *, (created_at at time zone 'Asia/Jerusalem') as local_at
    from public.owner_site_activity
    where created_at >= p_from and created_at < p_to
  )
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
    'recent', coalesce((select jsonb_agg(jsonb_build_object('at', created_at, 'path', path, 'category', category, 'action', action, 'device', device, 'source', source) order by created_at desc) from (
        select * from e order by created_at desc limit 100) x), '[]'::jsonb)
  );
$$;
revoke all on function public.owner_activity_summary(timestamptz, timestamptz) from public, anon;
grant execute on function public.owner_activity_summary(timestamptz, timestamptz) to authenticated;
