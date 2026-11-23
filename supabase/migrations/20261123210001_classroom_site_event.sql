-- Google Classroom share channel, step 2 of 3: record_site_event_v3 accepts source/channel 'classroom'.
-- Same function as 202610210003_social_shares.sql plus 'classroom'. Safe to run twice.
-- (Applied on its own: the earlier combined file never got through.)
-- The rate-limit helper record_site_event_v3 calls, re-created so it always exists wherever this v3 does.
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
