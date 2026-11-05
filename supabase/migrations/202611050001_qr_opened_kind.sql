-- The short QR link now counts each scan on the server. The page reports 'opened' when it finishes
-- loading, so the gap between the two shows phones that gave up on the way.
-- Safe to run again: drop constraint if exists / create or replace.

alter table public.qr_variant_events drop constraint if exists qr_variant_events_kind_check;
alter table public.qr_variant_events add constraint qr_variant_events_kind_check check (kind in ('printed','scanned','opened'));

create or replace function public.record_qr_variant(p_variant text, p_kind text, p_path text default null)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_variant is null or p_variant !~ '^[a-z][0-9]{1,2}$' or p_kind not in ('printed','scanned','opened') then return; end if;
  if p_path is not null and p_path !~ '^/[a-z0-9/_-]{0,119}$' then p_path := null; end if;
  if (select count(*) from (select 1 from public.qr_variant_events where created_at > now() - interval '1 minute' limit 300) q) >= 300 then return; end if;
  delete from public.qr_variant_events where created_at < now() - interval '400 days';
  insert into public.qr_variant_events(variant, kind, path) values (p_variant, p_kind, p_path);
end;
$$;

create or replace function public.qr_variant_owner(p_from timestamptz, p_to timestamptz)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('variant', v.variant, 'printed', v.printed, 'scanned', v.scanned, 'opened', v.opened) order by v.variant)
    from (select variant, count(*) filter (where kind = 'printed') as printed, count(*) filter (where kind = 'scanned') as scanned,
        count(*) filter (where kind = 'opened') as opened
      from public.qr_variant_events where created_at >= p_from and created_at < p_to group by variant) v), '[]'::jsonb);
end;
$$;

revoke all on function public.record_qr_variant(text,text,text) from public, anon, authenticated;
revoke all on function public.qr_variant_owner(timestamptz,timestamptz) from public, anon, authenticated;
grant execute on function public.record_qr_variant(text,text,text) to anon, authenticated;
grant execute on function public.qr_variant_owner(timestamptz,timestamptz) to authenticated;
