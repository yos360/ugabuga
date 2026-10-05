-- Rate limit for the anonymous analytics endpoints (record_site_event_v2/v3).
-- Both are callable with the public key, so a script could flood
-- owner_site_activity. Events over the limit are silently dropped (the client
-- fires and forgets, so nothing breaks for real visitors):
--   * per visitor: 30 events per minute (a real visitor sends a handful);
--   * events without a visitor id: 300 per minute in total;
--   * everything together: 3000 per minute — a ceiling against rotating ids.

create index if not exists owner_site_activity_visitor
  on public.owner_site_activity(visitor, created_at desc) where visitor is not null;

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
  if not public.site_event_allowed(p_visitor) then return; end if;
  if p_path is not null and p_path !~ '^/[a-z0-9/_-]{0,119}$' then p_path := null; end if;
  if p_device is not null and p_device not in ('mobile','desktop') then p_device := null; end if;
  if p_source is not null and p_source not in ('direct','internal','google','bing','facebook','instagram','whatsapp','tiktok','youtube','email','qr','other') then p_source := null; end if;
  insert into public.owner_site_activity(category, action, path, device, source, visitor, seconds)
    values (left(p_category, 60), p_action, p_path, p_device, p_source, p_visitor, p_seconds);
end;
$$;
revoke all on function public.record_site_event_v3(text,text,text,text,text,uuid,int) from public;
grant execute on function public.record_site_event_v3(text,text,text,text,text,uuid,int) to anon, authenticated;

-- The client still falls back to v2 when v3 fails, so limit it the same way.
create or replace function public.record_site_event_v2(
  p_category text, p_action text, p_path text default null,
  p_device text default null, p_source text default null, p_visitor uuid default null)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_category is null or p_action is null then return; end if;
  if char_length(p_category) = 0 or char_length(p_category) > 60 then return; end if;
  if p_action not in ('open','print','play','check','download','refresh','create','use','share') then return; end if;
  if not public.site_event_allowed(p_visitor) then return; end if;
  if p_path is not null and p_path !~ '^/[a-z0-9/_-]{0,119}$' then p_path := null; end if;
  if p_device is not null and p_device not in ('mobile','desktop') then p_device := null; end if;
  if p_source is not null and p_source not in ('direct','internal','google','bing','facebook','instagram','whatsapp','tiktok','youtube','email','qr','other') then p_source := null; end if;
  delete from public.owner_site_activity where created_at < now() - interval '400 days';
  insert into public.owner_site_activity(category, action, path, device, source, visitor)
    values (left(p_category, 60), p_action, p_path, p_device, p_source, p_visitor);
end;
$$;
revoke all on function public.record_site_event_v2(text,text,text,text,text,uuid) from public;
grant execute on function public.record_site_event_v2(text,text,text,text,text,uuid) to anon, authenticated;
