-- Google Classroom as a share channel (23.11.2026): the print dialog's "שיתוף לקלאסרום" button
-- opens classroom.google.com/share for the page and is counted as action 'share', channel 'classroom'.
-- Visits that arrive from Classroom (utm_source=google_classroom or classroom.google.com) get source
-- 'classroom', so they are not counted as Google search.
-- Same record_site_event_v3 as 202610210003_social_shares.sql with 'classroom' allowed. Safe to run twice.

alter table public.owner_site_activity drop constraint if exists owner_site_activity_channel_check;
alter table public.owner_site_activity add constraint owner_site_activity_channel_check
  check (channel is null or channel in ('whatsapp','facebook','native','copy','email','native_done','from_share','classroom')) not valid;

alter table public.owner_site_activity drop constraint if exists owner_site_activity_source_check;
alter table public.owner_site_activity add constraint owner_site_activity_source_check
  check (source is null or source in ('direct','internal','google','bing','facebook','instagram','whatsapp','tiktok','youtube','email','qr','other','classroom')) not valid;

-- The rate-limit helper record_site_event_v3 calls, re-created so it always exists wherever this v3 does.
create or replace function public.site_event_allowed(p_visitor uuid)
returns boolean language sql stable security definer set search_path = '' as $
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
$;
revoke all on function public.site_event_allowed(uuid) from public, anon, authenticated;

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
  if p_source is not null and p_source not in ('direct','internal','google','bing','facebook','instagram','whatsapp','tiktok','youtube','email','qr','other','classroom') then p_source := null; end if;
  if not (p_action = 'share' and p_channel in ('whatsapp','facebook','native','copy','email','native_done','classroom'))
     and not (p_action = 'open' and p_channel = 'from_share') then p_channel := null; end if;
  insert into public.owner_site_activity(category, action, path, device, source, visitor, seconds, pages, channel)
    values (left(p_category, 60), p_action, p_path, p_device, p_source, p_visitor, p_seconds, p_pages, p_channel);
end;
$$;
revoke all on function public.record_site_event_v3(text,text,text,text,text,uuid,int,int,text) from public;
grant execute on function public.record_site_event_v3(text,text,text,text,text,uuid,int,int,text) to anon, authenticated;

-- Owner only: shares to Classroom and visits that came from Classroom, with the top pages.
create or replace function public.owner_classroom_report(p_from timestamptz, p_to timestamptz)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  return (
    select jsonb_build_object(
      'shares', (select count(*) from public.owner_site_activity
                 where created_at >= p_from and created_at < p_to and action = 'share' and channel = 'classroom'),
      'visits', (select count(distinct coalesce(visitor::text, id::text)) from public.owner_site_activity
                 where created_at >= p_from and created_at < p_to and action = 'open' and source = 'classroom'),
      'top', coalesce((select jsonb_agg(jsonb_build_object('path', t.path, 'shares', t.shares, 'visits', t.visits) order by t.shares + t.visits desc, t.path)
        from (select coalesce(path, '') as path,
                     count(*) filter (where action = 'share') as shares,
                     count(*) filter (where action = 'open') as visits
              from public.owner_site_activity
              where created_at >= p_from and created_at < p_to
                and ((action = 'share' and channel = 'classroom') or (action = 'open' and source = 'classroom'))
              group by coalesce(path, '')
              order by count(*) desc
              limit 15) t), '[]'::jsonb));
end;
$$;
revoke all on function public.owner_classroom_report(timestamptz, timestamptz) from public, anon;
grant execute on function public.owner_classroom_report(timestamptz, timestamptz) to authenticated;
