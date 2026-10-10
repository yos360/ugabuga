-- 1) Public traffic numbers for the suppliers area ("proof" of real traffic for suppliers).
--    Only totals leave the database: visitors today, visits and page views in the last 30 days,
--    and views of the suppliers pages. Same counting rules as the owner report (time-on-page rows
--    are not visits). Cached for 10 minutes so busy pages don't re-count the whole table.
-- 2) Every search in the suppliers area (free text, supplier type, area, number of results) is
--    logged for the owner only. Long digit runs (phone numbers) are blanked before storing.

create table if not exists public.public_traffic_cache (
  id smallint primary key check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.public_traffic_cache enable row level security;
revoke all on public.public_traffic_cache from anon, authenticated;

create or replace function public.public_site_traffic()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  cached jsonb;
  fresh jsonb;
  day_start timestamptz := date_trunc('day', now() at time zone 'Asia/Jerusalem') at time zone 'Asia/Jerusalem';
begin
  select data into cached from public.public_traffic_cache where id = 1 and updated_at > now() - interval '10 minutes';
  if cached is not null then return cached; end if;
  with e as (
    select visitor, action, path, created_at, (created_at at time zone 'Asia/Jerusalem')::date d
    from public.owner_site_activity
    where created_at >= now() - interval '30 days' and action <> 'time'
  )
  select jsonb_build_object(
    'today_visitors', (select count(distinct visitor) from e where visitor is not null and created_at >= day_start),
    'visits_30d', (select count(*) from (select distinct visitor, d from e where visitor is not null) x),
    'pageviews_30d', (select count(*) from e where action = 'open'),
    'supplier_views_30d', (select count(*) from e where action = 'open' and path like '/suppliers%'),
    'updated_at', now()
  ) into fresh;
  insert into public.public_traffic_cache(id, data, updated_at) values (1, fresh, now())
    on conflict (id) do update set data = excluded.data, updated_at = excluded.updated_at;
  return fresh;
end;
$$;
revoke all on function public.public_site_traffic() from public;
grant execute on function public.public_site_traffic() to anon, authenticated;

create table if not exists public.supplier_searches (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  query text check (query is null or char_length(query) <= 60),
  supplier_type text check (supplier_type is null or supplier_type ~ '^[a-z0-9-]{1,40}$'),
  area text check (area is null or char_length(area) <= 40),
  results int check (results is null or results between 0 and 10000),
  path text check (path is null or path ~ '^/[a-z0-9/_-]{0,119}$'),
  visitor uuid
);
create index if not exists supplier_searches_created on public.supplier_searches(created_at desc);
create index if not exists supplier_searches_visitor on public.supplier_searches(visitor, created_at desc) where visitor is not null;
alter table public.supplier_searches enable row level security;
revoke all on public.supplier_searches from anon, authenticated;
grant select on public.supplier_searches to authenticated;
drop policy if exists owner_reads_supplier_searches on public.supplier_searches;
create policy owner_reads_supplier_searches on public.supplier_searches
  for select to authenticated
  using (lower(coalesce(auth.jwt() ->> 'email','')) = 'yos300@gmail.com');

create or replace function public.record_supplier_search(
  p_query text, p_type text default null, p_area text default null,
  p_results int default null, p_path text default null, p_visitor uuid default null)
returns void language plpgsql security definer set search_path = '' as $$
declare q text;
begin
  q := nullif(btrim(regexp_replace(left(coalesce(p_query, ''), 60), '[0-9][0-9 -]{4,}[0-9]', '…', 'g')), '');
  if p_type is not null and p_type !~ '^[a-z0-9-]{1,40}$' then p_type := null; end if;
  if p_area is not null and char_length(p_area) > 40 then p_area := null; end if;
  if p_path is not null and p_path !~ '^/[a-z0-9/_-]{0,119}$' then p_path := null; end if;
  if p_results is not null and (p_results < 0 or p_results > 10000) then p_results := null; end if;
  if q is null and p_type is null and p_area is null then return; end if;
  -- Rate limits: 40 searches an hour per browser, 300 a minute for the whole site.
  if p_visitor is not null and (select count(*) from (select 1 from public.supplier_searches
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

-- Owner-only report (SECURITY INVOKER: reads through the owner-only policy; anyone else gets zeros).
create or replace function public.owner_supplier_searches(p_from timestamptz, p_to timestamptz)
returns jsonb language sql stable security invoker set search_path = '' as $$
  with s as (select * from public.supplier_searches where created_at >= p_from and created_at < p_to)
  select jsonb_build_object(
    'total', (select count(*) from s),
    'searchers', (select count(distinct visitor) from s where visitor is not null),
    'top_queries', coalesce((select jsonb_agg(jsonb_build_object('query', query, 'n', n, 'zero', z) order by n desc) from (
        select lower(query) query, count(*) n, count(*) filter (where results = 0) z from s where query is not null group by 1 order by 2 desc limit 100) x), '[]'::jsonb),
    'by_type', coalesce((select jsonb_object_agg(supplier_type, n) from (select supplier_type, count(*) n from s where supplier_type is not null group by 1) x), '{}'::jsonb),
    'by_area', coalesce((select jsonb_object_agg(area, n) from (select area, count(*) n from s where area is not null group by 1) x), '{}'::jsonb),
    'recent', coalesce((select jsonb_agg(jsonb_build_object('at', created_at, 'query', query, 'type', supplier_type, 'area', area, 'results', results, 'path', path) order by created_at desc) from (
        select * from s order by created_at desc limit 200) x), '[]'::jsonb)
  );
$$;
revoke all on function public.owner_supplier_searches(timestamptz, timestamptz) from public, anon;
grant execute on function public.owner_supplier_searches(timestamptz, timestamptz) to authenticated;
