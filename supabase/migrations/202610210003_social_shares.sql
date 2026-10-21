-- Shares and social traffic in the owner report (/admin/activity), on the existing analytics table.
--
-- owner_site_activity gets an optional `channel`:
--   on action 'share' — where the visitor chose to share: whatsapp / facebook / native (the phone's
--     share sheet) / copy / email. These are CLICKS (an intent): Facebook and WhatsApp never tell a
--     website whether a post was actually published, or in which group or profile.
--   'native_done'     — the phone's share sheet reported that the visitor picked an app and sent it.
--                       The only share the site can know was completed.
--   on action 'open'  — 'from_share' when the visit arrived through a link shared from the site
--                       (utm_medium=share), so shared-link visits are told apart from ads.
-- record_site_event_v3 gains p_channel (default null — older pages keep working unchanged).
-- owner_social_report() is owner-only and returns aggregates only.
-- Safe to run twice. Applied automatically by .github/workflows/apply-migrations.yml.

alter table public.owner_site_activity add column if not exists channel text;
alter table public.owner_site_activity drop constraint if exists owner_site_activity_channel_check;
alter table public.owner_site_activity add constraint owner_site_activity_channel_check
  check (channel is null or channel in ('whatsapp','facebook','native','copy','email','native_done','from_share'));
create index if not exists owner_site_activity_social
  on public.owner_site_activity(created_at desc) where action = 'share' or source in ('facebook','whatsapp');

-- The rate-limit helper record_site_event_v3 calls (as in 202610200003), re-created here so it always
-- exists wherever the newest v3 does.
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


-- Same function as 202610190002_print_page_counts.sql, plus p_channel. The old signature is dropped
-- so a call by name is never ambiguous.
drop function if exists public.record_site_event_v3(text, text, text, text, text, uuid, int, int);
create or replace function public.record_site_event_v3(
  p_category text, p_action text, p_path text default null,
  p_device text default null, p_source text default null, p_visitor uuid default null, p_seconds int default null,
  p_pages int default null, p_channel text default null)
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
  if not (p_action = 'share' and p_channel in ('whatsapp','facebook','native','copy','email','native_done'))
     and not (p_action = 'open' and p_channel = 'from_share') then p_channel := null; end if;
  insert into public.owner_site_activity(category, action, path, device, source, visitor, seconds, pages, channel)
    values (left(p_category, 60), p_action, p_path, p_device, p_source, p_visitor, p_seconds, p_pages, p_channel);
end;
$$;
revoke all on function public.record_site_event_v3(text,text,text,text,text,uuid,int,int,text) from public;
grant execute on function public.record_site_event_v3(text,text,text,text,text,uuid,int,int,text) to anon, authenticated;

-- Owner only. Days are Israel calendar days.
create or replace function public.owner_social_report(p_from timestamptz, p_to timestamptz)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  return (
    with a as (
      select created_at, (created_at at time zone 'Asia/Jerusalem')::date d, category, action, coalesce(path, '') path,
             source, visitor, channel
      from public.owner_site_activity
      where created_at >= p_from and created_at < p_to
        and (action = 'share' or (action = 'open' and source in ('facebook','whatsapp')))
    ),
    -- one landing per visitor per source: the first page they opened
    landings as (
      select distinct on (source, coalesce(visitor::text, created_at::text)) source, path, category,
             (channel = 'from_share') shared, d
      from a where action = 'open'
      order by source, coalesce(visitor::text, created_at::text), created_at
    ),
    shares as (select * from a where action = 'share')
    select jsonb_build_object(
      'clicks', coalesce((select jsonb_object_agg(k, n) from (select coalesce(channel, 'other') k, count(*) n from shares where coalesce(channel, '') <> 'native_done' group by 1) x), '{}'::jsonb),
      'completed', (select count(*) from shares where channel = 'native_done'),
      'visits', jsonb_build_object(
        'facebook', (select count(*) from landings where source = 'facebook'),
        'facebook_shared', (select count(*) from landings where source = 'facebook' and shared),
        'whatsapp', (select count(*) from landings where source = 'whatsapp'),
        'whatsapp_shared', (select count(*) from landings where source = 'whatsapp' and shared)),
      'top_shared', coalesce((select jsonb_agg(x order by x.total desc, x.path) from (
          select path, max(category) category, count(*) total,
                 count(*) filter (where channel = 'facebook') facebook,
                 count(*) filter (where channel = 'whatsapp') whatsapp,
                 count(*) filter (where channel not in ('facebook','whatsapp') or channel is null) other
          from shares where coalesce(channel, '') <> 'native_done' group by path order by 3 desc, 1 limit 15) x), '[]'::jsonb),
      'top_landing', coalesce((select jsonb_agg(x order by x.total desc, x.path) from (
          select path, max(category) category, count(*) total,
                 count(*) filter (where source = 'facebook') facebook,
                 count(*) filter (where source = 'whatsapp') whatsapp,
                 count(*) filter (where shared) from_shares
          from landings group by path order by 3 desc, 1 limit 15) x), '[]'::jsonb),
      'by_day', coalesce((select jsonb_agg(x order by x.d) from (
          select dd.d,
                 (select count(*) from shares s where s.d = dd.d and s.channel = 'facebook') fb_clicks,
                 (select count(*) from shares s where s.d = dd.d and s.channel = 'whatsapp') wa_clicks,
                 (select count(*) from shares s where s.d = dd.d and (s.channel not in ('facebook','whatsapp','native_done') or s.channel is null)) other_clicks,
                 (select count(*) from landings l where l.d = dd.d and l.source = 'facebook') fb_visits,
                 (select count(*) from landings l where l.d = dd.d and l.source = 'whatsapp') wa_visits
          from (select distinct d from a) dd) x), '[]'::jsonb)
    ));
end;
$$;
revoke all on function public.owner_social_report(timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.owner_social_report(timestamptz, timestamptz) to authenticated;

notify pgrst, 'reload schema';
