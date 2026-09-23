-- Allow 'qr' as a traffic source, so scans of the QR code stamped on every
-- printed page (see PrintPreview.jsx) can be reported separately from other
-- traffic in the owner's dashboard.

alter table public.owner_site_activity drop constraint if exists owner_site_activity_source_check;
alter table public.owner_site_activity add constraint owner_site_activity_source_check
  check (source is null or source in ('direct','internal','google','bing','facebook','instagram','whatsapp','tiktok','youtube','email','qr','other'));

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
  if p_source is not null and p_source not in ('direct','internal','google','bing','facebook','instagram','whatsapp','tiktok','youtube','email','qr','other') then p_source := null; end if;
  delete from public.owner_site_activity where created_at < now() - interval '400 days';
  insert into public.owner_site_activity(category, action, path, device, source, visitor)
    values (left(p_category, 60), p_action, p_path, p_device, p_source, p_visitor);
end;
$$;
revoke all on function public.record_site_event_v2(text,text,text,text,text,uuid) from public;
grant execute on function public.record_site_event_v2(text,text,text,text,text,uuid) to anon, authenticated;
