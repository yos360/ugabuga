-- Supplier searches: crawlers opened every category page (no visitor id) and filled the owner
-- report with ~175 fake "no supplier found" rows. Remove them, and from now on keep only rows
-- that come with a visitor id (the site now sends them only after a real human sign).
delete from public.supplier_searches where visitor is null;

create or replace function public.record_supplier_search(
  p_query text, p_type text default null, p_area text default null,
  p_results int default null, p_path text default null, p_visitor uuid default null)
returns void language plpgsql security definer set search_path = '' as $$
declare q text;
begin
  if p_visitor is null then return; end if;
  q := nullif(btrim(regexp_replace(left(coalesce(p_query, ''), 60), '[0-9][0-9 -]{4,}[0-9]', '…', 'g')), '');
  if p_type is not null and p_type !~ '^[a-z0-9-]{1,40}$' then p_type := null; end if;
  if p_area is not null and char_length(p_area) > 40 then p_area := null; end if;
  if p_path is not null and p_path !~ '^/[a-z0-9/_-]{0,119}$' then p_path := null; end if;
  if p_results is not null and (p_results < 0 or p_results > 10000) then p_results := null; end if;
  if q is null and p_type is null and p_area is null then return; end if;
  -- Rate limits: 40 searches an hour per browser, 300 a minute for the whole site.
  if (select count(*) from (select 1 from public.supplier_searches
      where visitor = p_visitor and created_at > now() - interval '1 hour' limit 40) x) >= 40 then return; end if;
  if (select count(*) from (select 1 from public.supplier_searches
      where created_at > now() - interval '1 minute' limit 300) x) >= 300 then return; end if;
  delete from public.supplier_searches where created_at < now() - interval '400 days';
  insert into public.supplier_searches(query, supplier_type, area, results, path, visitor)
    values (q, p_type, p_area, p_results, p_path, p_visitor);
end;
$$;
revoke all on function public.record_supplier_search(text,text,text,int,text,uuid) from public;
grant execute on function public.record_supplier_search(text,text,text,int,text,uuid) to anon, authenticated;
