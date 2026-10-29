-- Site-wide "signals": scroll reach, 404s, JS errors, on-site search, next-step link clicks, "האם זה עזר?".
-- Kept in their OWN table (not owner_site_activity) so they never inflate the existing event totals,
-- per-visitor counts or the print funnel, and so no existing function or constraint has to change.
-- Privacy: there is NO visitor id and no IP in these tables. Only a clean path, a fixed code and a device type.
-- Search words are stored ONLY for searches with zero results and only if they are 1-3 plain words
-- (Hebrew/English letters, 2-30 chars, no digits, no @) that also pass the content filter — in
-- site_search_misses, with nothing that identifies the visitor.
-- Writes happen only through the two RPCs below; the tables are closed to direct access; only the owner reads.
-- Safe to run again. Applied automatically by .github/workflows/apply-migrations.yml.

create table if not exists public.site_signal_events (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('scroll','notfound','jserror','search','nav','helpful')),
  path text not null check (path ~ '^/[a-z0-9/_-]{0,119}$'),
  target text check (target is null or target ~ '^/[a-z0-9/_-]{0,119}$'),
  value text check (value is null or value ~ '^[a-z0-9_]{1,12}$'),
  device text check (device is null or device in ('mobile','desktop')),
  created_at timestamptz not null default now()
);
create index if not exists site_signal_events_kind_time on public.site_signal_events(kind, created_at desc);
alter table public.site_signal_events enable row level security;
revoke all on table public.site_signal_events from anon, authenticated;
revoke all on sequence public.site_signal_events_id_seq from anon, authenticated;

-- kind / value:
--   scroll   '0' a person viewed a long page, '50' / '90' scrolled past that share of it
--   notfound (no value) path = the requested clean path ('/_invalid' when it had odd characters)
--   jserror  type / ref / syntax / range / chunk / other  (error class only, never the message)
--   search   r0 (no results) / r1_5 / r6p        path = '/search'
--   nav      (no value) path = page the click was on, target = internal page it led to
--   helpful  yes / no
create or replace function public.record_site_signal(
  p_kind text, p_path text, p_target text default null, p_value text default null, p_device text default null)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_kind is null or p_path is null or p_path !~ '^/[a-z0-9/_-]{0,119}$' then return; end if;
  if not (
       (p_kind = 'scroll'   and p_value in ('0','50','90'))
    or (p_kind = 'jserror'  and p_value in ('type','ref','syntax','range','chunk','other'))
    or (p_kind = 'search'   and p_value in ('r0','r1_5','r6p'))
    or (p_kind = 'helpful'  and p_value in ('yes','no'))
    or (p_kind in ('notfound','nav') and p_value is null)
  ) then return; end if;
  if p_kind = 'nav' then
    if p_target is null or p_target !~ '^/[a-z0-9/_-]{0,119}$' or p_target = p_path then return; end if;
  else
    p_target := null;
  end if;
  if p_device is not null and p_device not in ('mobile','desktop') then p_device := null; end if;
  -- Flood guard: 1500 a minute overall, and error loops / 404 scans are capped lower.
  if (select count(*) from (select 1 from public.site_signal_events where created_at > now() - interval '1 minute' limit 1500) q) >= 1500 then return; end if;
  if p_kind in ('jserror','notfound') and
     (select count(*) from (select 1 from public.site_signal_events where kind = p_kind and created_at > now() - interval '1 minute' limit 60) q) >= 60 then return; end if;
  if random() < 0.01 then delete from public.site_signal_events where created_at < now() - interval '180 days'; end if;
  insert into public.site_signal_events(kind, path, target, value, device) values (p_kind, p_path, p_target, p_value, p_device);
end;
$$;

-- Searches that found nothing. No visitor id, no path, no device — just the words and when.
create table if not exists public.site_search_misses (
  id bigint generated always as identity primary key,
  term text not null check (char_length(term) between 2 and 30 and term ~ '^[A-Za-zא-ת]+( [A-Za-zא-ת]+){0,2}$'),
  created_at timestamptz not null default now()
);
create index if not exists site_search_misses_time on public.site_search_misses(created_at desc);
alter table public.site_search_misses enable row level security;
revoke all on table public.site_search_misses from anon, authenticated;
revoke all on sequence public.site_search_misses_id_seq from anon, authenticated;

create or replace function public.record_search_miss(p_term text)
returns void language plpgsql security definer set search_path = '' as $$
declare v text := lower(btrim(regexp_replace(coalesce(p_term, ''), '\s+', ' ', 'g')));
begin
  if char_length(v) not between 2 and 30 or v !~ '^[a-zא-ת]+( [a-zא-ת]+){0,2}$' then return; end if;
  begin
    -- the site's content filter (202610220001): no bad words, links or social handles
    if public.gt_bad_text(v) or public.gt_has_link(v) then return; end if;
  exception when others then return; -- filter unavailable: store nothing rather than something unfiltered
  end;
  if (select count(*) from (select 1 from public.site_search_misses where created_at > now() - interval '1 minute' limit 120) q) >= 120 then return; end if;
  if random() < 0.01 then delete from public.site_search_misses where created_at < now() - interval '90 days'; end if;
  insert into public.site_search_misses(term) values (v);
end;
$$;

-- Owner only. Aggregates for the report period; "views" for scroll = people who saw a long page.
create or replace function public.owner_site_signals(p_from timestamptz, p_to timestamptz)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  return (
    with s as (select * from public.site_signal_events where created_at >= p_from and created_at < p_to)
    select jsonb_build_object(
      'scroll', coalesce((select jsonb_agg(x order by x.views desc, x.path) from (
          select path, count(*) filter (where value = '0') views, count(*) filter (where value = '50') r50, count(*) filter (where value = '90') r90
          from s where kind = 'scroll' group by path having count(*) filter (where value = '0') > 0
          order by 2 desc, 1 limit 25) x), '[]'::jsonb),
      'notfound', coalesce((select jsonb_agg(x order by x.n desc, x.path) from (
          select path, count(*) n from s where kind = 'notfound' group by path order by 2 desc, 1 limit 25) x), '[]'::jsonb),
      'jserror', coalesce((select jsonb_agg(x order by x.n desc, x.path) from (
          select path, value, count(*) n from s where kind = 'jserror' group by path, value order by 3 desc, 1 limit 25) x), '[]'::jsonb),
      'search', coalesce((select jsonb_object_agg(value, n) from (select value, count(*) n from s where kind = 'search' group by value) x), '{}'::jsonb),
      'search_misses', coalesce((select jsonb_agg(x order by x.n desc, x.term) from (
          select term, count(*) n from public.site_search_misses where created_at >= p_from and created_at < p_to group by term order by 2 desc, 1 limit 40) x), '[]'::jsonb),
      'nav', coalesce((select jsonb_agg(x order by x.n desc, x.path, x.target) from (
          select path, target, count(*) n from s where kind = 'nav' group by path, target order by 3 desc, 1, 2 limit 30) x), '[]'::jsonb),
      'helpful', coalesce((select jsonb_agg(x order by x.yes + x.no desc, x.path) from (
          select path, count(*) filter (where value = 'yes') yes, count(*) filter (where value = 'no') no
          from s where kind = 'helpful' group by path order by count(*) desc, 1 limit 30) x), '[]'::jsonb)
    )
  );
end;
$$;

revoke all on function public.record_site_signal(text,text,text,text,text) from public, anon, authenticated;
revoke all on function public.record_search_miss(text) from public, anon, authenticated;
revoke all on function public.owner_site_signals(timestamptz,timestamptz) from public, anon, authenticated;
grant execute on function public.record_site_signal(text,text,text,text,text) to anon, authenticated;
grant execute on function public.record_search_miss(text) to anon, authenticated;
grant execute on function public.owner_site_signals(timestamptz,timestamptz) to authenticated;

notify pgrst, 'reload schema';
