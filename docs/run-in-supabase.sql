-- כל קבצי ה-SQL שעוד צריך להריץ, בקובץ אחד. בטוח להריץ גם אם חלק כבר רץ (כל שלב בודק אם כבר קיים).

-- ===== 202610070001_owner_activity_realtime =====
-- Live owner report: send new rows of owner_site_activity over Supabase Realtime.
-- Realtime applies the table's RLS, so only the owner (policy owner_full_activity_report)
-- receives anything; anonymous visitors still can't read the table.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'owner_site_activity'
  ) then
    alter publication supabase_realtime add table public.owner_site_activity;
  end if;
end $$;

-- ===== 202610070002_owner_visitors_active_only =====
-- Owner report: "visitors" counts only people who opened a page or did something in the range.
-- Before, a visitor whose only row in the range was a time-on-page report (e.g. a tab opened
-- before midnight, closed after it) was counted as a visitor of the new day too.
-- Same function as 202610040001_owner_by_visitor.sql except for the 'visitors' line.
create or replace function public.owner_activity_summary(p_from timestamptz, p_to timestamptz)
returns jsonb language sql stable security invoker set search_path = '' as $$
  with a as (
    select *, (created_at at time zone 'Asia/Jerusalem') as local_at
    from public.owner_site_activity
    where created_at >= p_from and created_at < p_to
  ), e as (select * from a where action <> 'time'),
     t as (select * from a where action = 'time')
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
    'time_total', coalesce((select sum(seconds) from t), 0),
    'time_visitors', (select count(distinct visitor) from t where visitor is not null),
    'time_by_path', coalesce((select jsonb_agg(jsonb_build_object('path', path, 'category', category, 'visits', n, 'visitors', v, 'total', s, 'avg', av) order by s desc) from (
        select coalesce(path,'') path, category, count(*) n, count(distinct visitor) v, sum(seconds) s, round(avg(seconds))::int av
        from t group by 1, 2 order by 5 desc limit 60) x), '[]'::jsonb),
    'print_funnel', coalesce((select jsonb_agg(jsonb_build_object('path', path, 'category', category, 'opens', o, 'previews', pv, 'prints', pr) order by pr desc, pv desc) from (
        select coalesce(path,'') path, category,
               count(*) filter (where action = 'open') o,
               count(*) filter (where action = 'preview') pv,
               count(*) filter (where action = 'print') pr
        from e group by 1, 2
        having count(*) filter (where action in ('preview','print')) > 0
        order by 5 desc, 4 desc limit 60) x), '[]'::jsonb),
    'qr_landing', coalesce((select jsonb_agg(jsonb_build_object('path', path, 'category', category, 'scans', n) order by n desc) from (
        select path, category, count(*) n from (
          select distinct on (coalesce(visitor::text, id::text)) coalesce(path,'') path, category
          from e where source = 'qr' and action = 'open'
          order by coalesce(visitor::text, id::text), created_at) f
        group by 1, 2 order by 3 desc limit 40) x), '[]'::jsonb),
    'by_visitor', coalesce((select jsonb_agg(x order by x.events desc, x.last desc) from (
        select left(visitor::text, 6) v,
               count(*) filter (where action <> 'time') events,
               count(*) filter (where action = 'open') opens,
               count(*) filter (where action not in ('open', 'time')) acts,
               count(distinct path) filter (where action <> 'time') pages,
               coalesce(sum(seconds), 0) secs,
               (array_agg(source order by created_at))[1] source,
               (array_agg(device order by created_at))[1] device,
               min(created_at) first, max(created_at) last,
               (array_agg(jsonb_build_object('p', coalesce(path, ''), 'c', category, 'a', action, 'at', created_at) order by created_at)
                  filter (where action <> 'time'))[1:30] steps
        from a where visitor is not null group by visitor
        order by 2 desc, 10 desc limit 80) x), '[]'::jsonb),
    'recent', coalesce((select jsonb_agg(jsonb_build_object('at', created_at, 'path', path, 'category', category, 'action', action, 'device', device, 'source', source, 'seconds', seconds, 'visitor', left(visitor::text, 6)) order by created_at desc) from (
        select * from a order by created_at desc limit 100) x), '[]'::jsonb)
  );
$$;
revoke all on function public.owner_activity_summary(timestamptz, timestamptz) from public, anon;
grant execute on function public.owner_activity_summary(timestamptz, timestamptz) to authenticated;

-- ===== 202610100001_public_traffic_and_supplier_searches =====
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

-- ===== 202610110001_group_tools =====
-- Group tools shared through WhatsApp (2026-10-11). Safe to run more than once.
--   1) אישור הגעה אונליין  (/rsvp, guest link /r/<code>)
--   2) גמד וענק / הגרלת שמות (/secret-friend, links /g/<code>)
--   3) קיר ברכות לגננת / למורה (/thank-you-wall, link /w/<code>)
--
-- Same model as "מי מביא מה" (party_lists): a short public share code, a private organizer token
-- created on the organizer's device (never returned by any public function), and per-device tokens
-- so a guest can edit only their own answer. No direct table access at all: RLS on, every grant
-- revoked, everything goes through the SECURITY DEFINER functions below.
--
-- Privacy: first names only, short length limits, no links in free text, no photos.
-- Abuse: per-client (hashed IP, kept for a day) and global rate limits on every insert, and
-- per-event caps. Old events expire (expires_at) and are purged by public.group_tools_purge(),
-- which the create functions also call now and then. Optional: schedule it daily with pg_cron:
--   select cron.schedule('group-tools-purge', '17 3 * * *', 'select public.group_tools_purge()');

create extension if not exists pgcrypto;

-- ───────────────────────── shared helpers ─────────────────────────

create table if not exists public.gt_rate (
  bucket text not null,
  who text not null,
  at timestamptz not null default now()
);
create index if not exists gt_rate_bucket_who on public.gt_rate (bucket, who, at desc);
create index if not exists gt_rate_at on public.gt_rate (at);
alter table public.gt_rate enable row level security;
revoke all on public.gt_rate from anon, authenticated;

-- A hash of the caller's IP (from the API gateway headers); 'unknown' when there is none.
create or replace function public.gt_client()
returns text language plpgsql stable set search_path = public as $$
declare h json; ip text;
begin
  begin
    h := nullif(current_setting('request.headers', true), '')::json;
    ip := coalesce(h->>'cf-connecting-ip', split_part(coalesce(h->>'x-forwarded-for', ''), ',', 1));
  exception when others then ip := null;
  end;
  ip := nullif(trim(coalesce(ip, '')), '');
  return case when ip is null then 'unknown' else md5('gt:' || ip) end;
end; $$;

-- Raises 'rate_limited' when this client (or everyone together) did too much of p_bucket lately.
create or replace function public.gt_rate_check(p_bucket text, p_per_client int, p_global int, p_window interval default interval '10 minutes')
returns void language plpgsql volatile security definer set search_path = public as $$
declare v_who text := gt_client(); n int;
begin
  if random() < 0.02 then delete from public.gt_rate where at < now() - interval '1 day'; end if;
  select count(*) into n from (select 1 from public.gt_rate r
    where r.bucket = p_bucket and r.at > now() - p_window limit p_global) x;
  if n >= p_global then raise exception 'rate_limited'; end if;
  if v_who <> 'unknown' then
    select count(*) into n from (select 1 from public.gt_rate r
      where r.bucket = p_bucket and r.who = v_who and r.at > now() - p_window limit p_per_client) x;
    if n >= p_per_client then raise exception 'rate_limited'; end if;
  end if;
  insert into public.gt_rate(bucket, who) values (p_bucket, v_who);
end; $$;

-- n (≤ 16) characters from a 31-letter alphabet without look-alikes, from a CSPRNG (gen_random_uuid).
create or replace function public.gt_code(n int)
returns text language plpgsql volatile set search_path = public as $$
declare alphabet text := 'abcdefghjkmnpqrstuvwxyz23456789';
        b bytea := decode(md5(gen_random_uuid()::text || gen_random_uuid()::text), 'hex'); c text := '';
begin
  for i in 0 .. least(n, 16) - 1 loop c := c || substr(alphabet, 1 + (get_byte(b, i) % 31), 1); end loop;
  return c;
end; $$;

-- Organizer / device tokens are random UUID-like strings made on the device.
create or replace function public.gt_token_ok(t text)
returns boolean language sql immutable set search_path = public as $$
  select coalesce(t ~ '^[A-Za-z0-9_-]{20,64}$', false);
$$;

-- Trimmed, control characters removed, at most n characters, NULL when empty.
create or replace function public.gt_txt(p text, n int, multiline boolean default false)
returns text language sql immutable set search_path = public as $$
  select nullif(left(trim(
    case when multiline
      then regexp_replace(regexp_replace(coalesce(p, ''), '[\x01-\x09\x0b-\x1f\x7f]', '', 'g'), '\n{3,}', E'\n\n', 'g')
      else regexp_replace(coalesce(p, ''), '[\x01-\x1f\x7f]', ' ', 'g') end), n), '');
$$;

-- Free text must not carry links (spam on a public wall / event page).
create or replace function public.gt_no_links(p text)
returns text language plpgsql immutable set search_path = public as $$
begin
  if p ~* '(https?://|www\.|\.(com|co\.il|net|org|ly|me)(/|\s|$))' then raise exception 'no_links'; end if;
  return p;
end; $$;

create or replace function public.gt_date(p text)
returns date language plpgsql immutable set search_path = public as $$
begin
  if p is null or p !~ '^\d{4}-\d{2}-\d{2}$' then return null; end if;
  return p::date;
exception when others then return null;
end; $$;

-- ───────────────────────── 1) RSVP ─────────────────────────

create table if not exists public.rsvp_events (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  host_token text not null,
  kind text not null default 'kids' check (kind in ('kids', 'general')),
  title text not null,
  event_date date,
  event_time text,
  place text,
  deadline date,
  note text,
  invitees jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '180 days'
);
create index if not exists rsvp_events_expires on public.rsvp_events (expires_at);

create table if not exists public.rsvp_responses (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.rsvp_events(id) on delete cascade,
  device_token text not null,
  name text not null,
  status text not null check (status in ('yes', 'no', 'maybe')),
  kids smallint not null default 0 check (kids between 0 and 20),
  adults smallint not null default 0 check (adults between 0 and 20),
  allergies text,
  pickup text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, device_token)
);
create index if not exists rsvp_responses_event on public.rsvp_responses (event_id, updated_at);

alter table public.rsvp_events enable row level security;
alter table public.rsvp_responses enable row level security;
revoke all on public.rsvp_events from anon, authenticated;
revoke all on public.rsvp_responses from anon, authenticated;

-- Up to 80 invitee first names (for "who hasn't answered yet").
create or replace function public.rsvp_clean_invitees(p jsonb)
returns jsonb language sql immutable set search_path = public as $$
  select coalesce(jsonb_agg(to_jsonb(n) order by ord), '[]'::jsonb) from (
    select (array_agg(n order by ord))[1] n, min(ord) ord
    from (select gt_txt(e, 30) n, ord
          from jsonb_array_elements_text(case when jsonb_typeof(p) = 'array' then p else '[]'::jsonb end) with ordinality t(e, ord)
          where ord <= 200) a
    where n is not null
    group by lower(n) order by min(ord) limit 80
  ) b;
$$;

-- What anyone with the guest link sees: the event details and how many said yes. Never the host token.
create or replace function public.rsvp_public(e public.rsvp_events)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'code', e.code, 'kind', e.kind, 'title', e.title, 'date', e.event_date, 'time', e.event_time,
    'place', e.place, 'deadline', e.deadline, 'note', e.note, 'invitees', e.invitees,
    'expires_at', e.expires_at,
    'yes_count', (select count(*) from public.rsvp_responses r where r.event_id = e.id and r.status = 'yes'));
$$;

create or replace function public.rsvp_response_json(r public.rsvp_responses)
returns jsonb language sql immutable set search_path = public as $$
  select jsonb_build_object('id', r.id, 'name', r.name, 'status', r.status, 'kids', r.kids, 'adults', r.adults,
    'allergies', r.allergies, 'pickup', r.pickup, 'note', r.note, 'updated_at', r.updated_at);
$$;

create or replace function public.rsvp_find(p_code text)
returns public.rsvp_events language plpgsql stable security definer set search_path = public as $$
declare e public.rsvp_events;
begin
  select * into e from public.rsvp_events where code = p_code and expires_at > now();
  if e.id is null then raise exception 'not_found'; end if;
  return e;
end; $$;

create or replace function public.rsvp_apply(e public.rsvp_events, p jsonb)
returns public.rsvp_events language plpgsql stable set search_path = public as $$
begin
  e.kind := case when p->>'kind' = 'general' then 'general' else 'kids' end;
  e.title := coalesce(gt_no_links(gt_txt(p->>'title', 80)), 'האירוע שלנו');
  e.event_date := gt_date(p->>'date');
  e.event_time := gt_txt(p->>'time', 20);
  e.place := gt_no_links(gt_txt(p->>'place', 100));
  e.deadline := gt_date(p->>'deadline');
  e.note := gt_no_links(gt_txt(p->>'note', 300, true));
  e.invitees := rsvp_clean_invitees(p->'invitees');
  -- Kept 60 days after the event (or 180 days from creation when there is no date), at most a year.
  e.expires_at := least(coalesce(e.event_date + 60, current_date + 180)::timestamptz, now() + interval '400 days');
  if e.expires_at < now() + interval '7 days' then e.expires_at := now() + interval '7 days'; end if;
  return e;
end; $$;

create or replace function public.rsvp_create(p_host_token text, p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare e public.rsvp_events; c text; n int := 0;
begin
  if not gt_token_ok(p_host_token) then raise exception 'bad_token'; end if;
  perform gt_rate_check('rsvp_create', 15, 600);
  if random() < 0.05 then perform group_tools_purge(); end if;
  loop
    c := gt_code(8);
    exit when not exists (select 1 from public.rsvp_events where code = c);
    n := n + 1; if n > 20 then raise exception 'code_space_exhausted'; end if;
  end loop;
  e := rsvp_apply(e, coalesce(p, '{}'::jsonb));
  insert into public.rsvp_events (code, host_token, kind, title, event_date, event_time, place, deadline, note, invitees, expires_at)
  values (c, p_host_token, e.kind, e.title, e.event_date, e.event_time, e.place, e.deadline, e.note, e.invitees, e.expires_at)
  returning * into e;
  return rsvp_public(e);
end; $$;

create or replace function public.rsvp_get(p_code text, p_device_token text default null)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare e public.rsvp_events := rsvp_find(p_code); r public.rsvp_responses;
begin
  if gt_token_ok(p_device_token) then
    select * into r from public.rsvp_responses where event_id = e.id and device_token = p_device_token;
  end if;
  return rsvp_public(e) || jsonb_build_object('mine', case when r.id is null then null else rsvp_response_json(r) end);
end; $$;

create or replace function public.rsvp_answer(p_code text, p_device_token text, p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare e public.rsvp_events := rsvp_find(p_code); r public.rsvp_responses; v_status text := p->>'status'; v_name text;
        v_kids int; v_adults int;
begin
  if not gt_token_ok(p_device_token) then raise exception 'bad_token'; end if;
  v_name := gt_no_links(gt_txt(p->>'name', 40));
  if v_name is null then raise exception 'name_required'; end if;
  if v_status is null or v_status not in ('yes', 'no', 'maybe') then raise exception 'bad_status'; end if;
  v_kids := case when v_status = 'no' then 0 else greatest(0, least(20, coalesce((p->>'kids')::numeric::int, 0))) end;
  v_adults := case when v_status = 'no' then 0 else greatest(0, least(20, coalesce((p->>'adults')::numeric::int, 0))) end;
  perform gt_rate_check('rsvp_answer', 40, 3000);
  if not exists (select 1 from public.rsvp_responses where event_id = e.id and device_token = p_device_token)
     and (select count(*) from public.rsvp_responses where event_id = e.id) >= 300 then
    raise exception 'event_full';
  end if;
  insert into public.rsvp_responses as x (event_id, device_token, name, status, kids, adults, allergies, pickup, note)
  values (e.id, p_device_token, v_name, v_status, v_kids, v_adults,
          gt_no_links(gt_txt(p->>'allergies', 200)), gt_no_links(gt_txt(p->>'pickup', 60)), gt_no_links(gt_txt(p->>'note', 200)))
  on conflict (event_id, device_token) do update set
    name = excluded.name, status = excluded.status, kids = excluded.kids, adults = excluded.adults,
    allergies = excluded.allergies, pickup = excluded.pickup, note = excluded.note, updated_at = now()
  returning * into r;
  return rsvp_response_json(r);
exception when invalid_text_representation or numeric_value_out_of_range then raise exception 'bad_number';
end; $$;

create or replace function public.rsvp_withdraw(p_code text, p_device_token text)
returns boolean language plpgsql security definer set search_path = public as $$
declare e public.rsvp_events := rsvp_find(p_code);
begin
  delete from public.rsvp_responses where event_id = e.id and device_token = p_device_token;
  return found;
end; $$;

create or replace function public.rsvp_host_find(p_code text, p_host_token text)
returns public.rsvp_events language plpgsql stable security definer set search_path = public as $$
declare e public.rsvp_events := rsvp_find(p_code);
begin
  if p_host_token is null or e.host_token <> p_host_token then raise exception 'not_owner'; end if;
  return e;
end; $$;

create or replace function public.rsvp_host(p_code text, p_host_token text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare e public.rsvp_events := rsvp_host_find(p_code, p_host_token);
begin
  return rsvp_public(e) || jsonb_build_object('responses',
    coalesce((select jsonb_agg(rsvp_response_json(r) order by r.created_at) from public.rsvp_responses r where r.event_id = e.id), '[]'::jsonb));
end; $$;

create or replace function public.rsvp_update(p_code text, p_host_token text, p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare e public.rsvp_events := rsvp_host_find(p_code, p_host_token);
begin
  perform gt_rate_check('rsvp_update', 120, 6000);
  e := rsvp_apply(e, coalesce(p, '{}'::jsonb));
  update public.rsvp_events set kind = e.kind, title = e.title, event_date = e.event_date, event_time = e.event_time,
    place = e.place, deadline = e.deadline, note = e.note, invitees = e.invitees, expires_at = e.expires_at, updated_at = now()
  where id = e.id returning * into e;
  return rsvp_public(e);
end; $$;

create or replace function public.rsvp_remove_response(p_code text, p_host_token text, p_response_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare e public.rsvp_events := rsvp_host_find(p_code, p_host_token);
begin
  delete from public.rsvp_responses where event_id = e.id and id = p_response_id;
  return found;
end; $$;

create or replace function public.rsvp_delete(p_code text, p_host_token text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  delete from public.rsvp_events where code = p_code and host_token = p_host_token;
  if not found then raise exception 'not_owner'; end if;
  return true;
end; $$;

-- ───────────────────────── 2) Secret friend draw ─────────────────────────

create table if not exists public.secret_draws (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  owner_token text not null,
  mode text not null default 'gamad' check (mode in ('gamad', 'purim', 'hanukkah')),
  title text not null,
  note text,
  budget text,
  shown_all boolean not null default false,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '120 days'
);
create index if not exists secret_draws_expires on public.secret_draws (expires_at);

create table if not exists public.secret_people (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid not null references public.secret_draws(id) on delete cascade,
  idx smallint not null,
  name text not null,
  token text not null unique,
  target smallint not null,
  opened_at timestamptz,
  opens int not null default 0,
  unique (draw_id, idx)
);

alter table public.secret_draws enable row level security;
alter table public.secret_people enable row level security;
revoke all on public.secret_draws from anon, authenticated;
revoke all on public.secret_people from anon, authenticated;

-- Draws a random assignment (person i gives to target[i]) where nobody gets themselves and no
-- excluded pair (both directions) meets. Prefers one big circle (no A↔B swaps); with many
-- exclusions falls back to any valid permutation. Raises 'draw_impossible' if none is found.
create or replace function public.secret_assign(n int, ex text[])
returns int[] language plpgsql volatile set search_path = public as $$
declare ord int[]; tgt int[]; ok boolean; tries int := 0;
begin
  loop
    tries := tries + 1;
    select array_agg(i order by gen_random_uuid()) into ord from generate_series(0, n - 1) i;
    tgt := array_fill(-1, array[n]);
    if tries <= 400 then
      for k in 1 .. n loop tgt[ord[k] + 1] := ord[(k % n) + 1]; end loop;
    else
      tgt := ord;
    end if;
    ok := true;
    for k in 1 .. n loop
      if tgt[k] = k - 1 or ((k - 1) || ':' || tgt[k]) = any(ex) then ok := false; exit; end if;
    end loop;
    exit when ok;
    if tries >= 1200 then raise exception 'draw_impossible'; end if;
  end loop;
  return tgt;
end; $$;

create or replace function public.secret_create(p_owner_token text, p_title text, p_mode text, p_note text, p_budget text, p_names jsonb, p_exclusions jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare d public.secret_draws; names text[]; n int; ex text[] := '{}'; pair jsonb; a int; b int; tgt int[]; c text; tries int := 0;
begin
  if not gt_token_ok(p_owner_token) then raise exception 'bad_token'; end if;
  if jsonb_typeof(p_names) <> 'array' or jsonb_array_length(p_names) > 60 then raise exception 'too_many'; end if;
  select array_agg(gt_txt(e, 30) order by ord) into names
    from jsonb_array_elements_text(p_names) with ordinality t(e, ord) where gt_txt(e, 30) is not null;
  n := coalesce(array_length(names, 1), 0);
  if n < 3 then raise exception 'too_few'; end if;
  if (select count(distinct lower(x)) from unnest(names) x) <> n then raise exception 'duplicate_names'; end if;
  if exists (select 1 from unnest(names) x where gt_no_links(x) is null) then raise exception 'bad_names'; end if;
  if jsonb_typeof(coalesce(p_exclusions, '[]'::jsonb)) = 'array' then
    for pair in select * from jsonb_array_elements(coalesce(p_exclusions, '[]'::jsonb)) limit 300 loop
      begin
        a := (pair->>0)::int; b := (pair->>1)::int;
      exception when others then continue;
      end;
      if a is null or b is null or a = b or a < 0 or b < 0 or a >= n or b >= n then continue; end if;
      ex := ex || (a || ':' || b) || (b || ':' || a);
    end loop;
  end if;
  perform gt_rate_check('secret_create', 20, 600);
  if random() < 0.05 then perform group_tools_purge(); end if;
  tgt := secret_assign(n, ex);
  loop
    c := gt_code(8);
    exit when not exists (select 1 from public.secret_draws where code = c);
    tries := tries + 1; if tries > 20 then raise exception 'code_space_exhausted'; end if;
  end loop;
  insert into public.secret_draws (code, owner_token, mode, title, note, budget)
  values (c, p_owner_token, case when p_mode in ('gamad', 'purim', 'hanukkah') then p_mode else 'gamad' end,
          coalesce(gt_no_links(gt_txt(p_title, 60)), 'ההגרלה שלנו'), gt_no_links(gt_txt(p_note, 300, true)), gt_no_links(gt_txt(p_budget, 30)))
  returning * into d;
  -- Personal tokens: 16 characters each (≈ 79 bits), unguessable.
  insert into public.secret_people (draw_id, idx, name, token, target)
  select d.id, i - 1, names[i], gt_code(16), tgt[i] from generate_series(1, n) i;
  return secret_organizer(d.code, p_owner_token);
end; $$;

-- The organizer's view: names, personal links and who opened theirs. Never who got whom.
create or replace function public.secret_organizer(p_code text, p_owner_token text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare d public.secret_draws;
begin
  select * into d from public.secret_draws where code = p_code and expires_at > now();
  if d.id is null then raise exception 'not_found'; end if;
  if p_owner_token is null or d.owner_token <> p_owner_token then raise exception 'not_owner'; end if;
  return jsonb_build_object('code', d.code, 'mode', d.mode, 'title', d.title, 'note', d.note, 'budget', d.budget,
    'shown_all', d.shown_all, 'expires_at', d.expires_at,
    'people', (select jsonb_agg(jsonb_build_object('idx', p.idx, 'name', p.name, 'token', p.token, 'opened', p.opened_at is not null) order by p.idx)
               from public.secret_people p where p.draw_id = d.id));
end; $$;

-- A participant's personal link: their own name first (nothing is revealed until they tap).
create or replace function public.secret_whoami(p_code text, p_token text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare d public.secret_draws; me public.secret_people;
begin
  select * into d from public.secret_draws where code = p_code and expires_at > now();
  if d.id is null then raise exception 'not_found'; end if;
  select * into me from public.secret_people where draw_id = d.id and token = p_token;
  if me.id is null then raise exception 'not_found'; end if;
  return jsonb_build_object('mode', d.mode, 'title', d.title, 'note', d.note, 'budget', d.budget, 'name', me.name,
    'opened', me.opened_at is not null, 'shown_all', d.shown_all);
end; $$;

create or replace function public.secret_reveal(p_code text, p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare d public.secret_draws; me public.secret_people; t text;
begin
  select * into d from public.secret_draws where code = p_code and expires_at > now();
  if d.id is null then raise exception 'not_found'; end if;
  select * into me from public.secret_people where draw_id = d.id and token = p_token;
  if me.id is null then raise exception 'not_found'; end if;
  select name into t from public.secret_people where draw_id = d.id and idx = me.target;
  update public.secret_people set opened_at = coalesce(opened_at, now()), opens = opens + 1 where id = me.id;
  return jsonb_build_object('name', me.name, 'target', t);
end; $$;

-- "Show all": the organizer explicitly asks for the full list. Recorded, and participants are told.
create or replace function public.secret_show_all(p_code text, p_owner_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare d public.secret_draws;
begin
  update public.secret_draws set shown_all = true where code = p_code and owner_token = p_owner_token and expires_at > now() returning * into d;
  if d.id is null then raise exception 'not_owner'; end if;
  return (select jsonb_agg(jsonb_build_object('name', p.name, 'target', t.name) order by p.idx)
          from public.secret_people p join public.secret_people t on t.draw_id = p.draw_id and t.idx = p.target
          where p.draw_id = d.id);
end; $$;

create or replace function public.secret_delete(p_code text, p_owner_token text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  delete from public.secret_draws where code = p_code and owner_token = p_owner_token;
  if not found then raise exception 'not_owner'; end if;
  return true;
end; $$;

-- ───────────────────────── 3) Thank-you wall ─────────────────────────

create table if not exists public.wall_boards (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  owner_token text not null,
  teacher text not null,
  place text,
  occasion text not null default 'end-of-year' check (occasion in ('end-of-year', 'hanukkah', 'rosh-hashana', 'birthday', 'other')),
  hide_notes boolean not null default false,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '180 days'
);
create index if not exists wall_boards_expires on public.wall_boards (expires_at);

create table if not exists public.wall_notes (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.wall_boards(id) on delete cascade,
  device_token text not null,
  child text not null,
  message text not null,
  sticker text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists wall_notes_board on public.wall_notes (board_id, created_at);

alter table public.wall_boards enable row level security;
alter table public.wall_notes enable row level security;
revoke all on public.wall_boards from anon, authenticated;
revoke all on public.wall_notes from anon, authenticated;

create or replace function public.wall_sticker(p text)
returns text language sql immutable set search_path = public as $$
  select case when p = any(array['🌸','🌻','🌈','⭐','💖','🦋','🎈','🍎','📚','🎨','🧸','🌟','🕎','🍯','🎂','🙏']) then p end;
$$;

create or replace function public.wall_note_json(w public.wall_notes, p_device text)
returns jsonb language sql immutable set search_path = public as $$
  select jsonb_build_object('id', w.id, 'child', w.child, 'message', w.message, 'sticker', w.sticker,
    'created_at', w.created_at, 'mine', p_device is not null and w.device_token = p_device);
$$;

create or replace function public.wall_board_json(b public.wall_boards)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('code', b.code, 'teacher', b.teacher, 'place', b.place, 'occasion', b.occasion,
    'hide_notes', b.hide_notes, 'expires_at', b.expires_at,
    'count', (select count(*) from public.wall_notes w where w.board_id = b.id));
$$;

create or replace function public.wall_find(p_code text)
returns public.wall_boards language plpgsql stable security definer set search_path = public as $$
declare b public.wall_boards;
begin
  select * into b from public.wall_boards where code = p_code and expires_at > now();
  if b.id is null then raise exception 'not_found'; end if;
  return b;
end; $$;

create or replace function public.wall_create(p_owner_token text, p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare b public.wall_boards; c text; n int := 0; v_teacher text := gt_no_links(gt_txt(p->>'teacher', 40));
begin
  if not gt_token_ok(p_owner_token) then raise exception 'bad_token'; end if;
  if v_teacher is null then raise exception 'name_required'; end if;
  perform gt_rate_check('wall_create', 15, 600);
  if random() < 0.05 then perform group_tools_purge(); end if;
  loop
    c := gt_code(8);
    exit when not exists (select 1 from public.wall_boards where code = c);
    n := n + 1; if n > 20 then raise exception 'code_space_exhausted'; end if;
  end loop;
  insert into public.wall_boards (code, owner_token, teacher, place, occasion, hide_notes)
  values (c, p_owner_token, v_teacher, gt_no_links(gt_txt(p->>'place', 60)),
          case when p->>'occasion' in ('end-of-year', 'hanukkah', 'rosh-hashana', 'birthday', 'other') then p->>'occasion' else 'end-of-year' end,
          coalesce((p->>'hide_notes')::boolean, false))
  returning * into b;
  return wall_board_json(b);
end; $$;

-- Parents' view: the board and the blessings (or, on a "surprise" wall, only their own).
create or replace function public.wall_get(p_code text, p_device_token text default null)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare b public.wall_boards := wall_find(p_code); dev text := case when gt_token_ok(p_device_token) then p_device_token end;
begin
  return wall_board_json(b) || jsonb_build_object('notes', coalesce((
    select jsonb_agg(wall_note_json(w, dev) order by w.created_at) from public.wall_notes w
    where w.board_id = b.id and (not b.hide_notes or w.device_token = dev)), '[]'::jsonb));
end; $$;

create or replace function public.wall_owner(p_code text, p_owner_token text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare b public.wall_boards := wall_find(p_code);
begin
  if p_owner_token is null or b.owner_token <> p_owner_token then raise exception 'not_owner'; end if;
  return wall_board_json(b) || jsonb_build_object('notes', coalesce((
    select jsonb_agg(wall_note_json(w, null) order by w.created_at) from public.wall_notes w where w.board_id = b.id), '[]'::jsonb));
end; $$;

create or replace function public.wall_add(p_code text, p_device_token text, p_child text, p_message text, p_sticker text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare b public.wall_boards := wall_find(p_code); w public.wall_notes;
        v_child text := gt_no_links(gt_txt(p_child, 30)); v_msg text := gt_no_links(gt_txt(p_message, 400, true));
begin
  if not gt_token_ok(p_device_token) then raise exception 'bad_token'; end if;
  if v_child is null then raise exception 'name_required'; end if;
  if v_msg is null then raise exception 'message_required'; end if;
  perform gt_rate_check('wall_add', 20, 3000);
  if (select count(*) from public.wall_notes where board_id = b.id) >= 150 then raise exception 'wall_full'; end if;
  if (select count(*) from public.wall_notes where board_id = b.id and device_token = p_device_token) >= 6 then raise exception 'too_many_notes'; end if;
  insert into public.wall_notes (board_id, device_token, child, message, sticker)
  values (b.id, p_device_token, v_child, v_msg, wall_sticker(p_sticker)) returning * into w;
  return wall_note_json(w, p_device_token);
end; $$;

create or replace function public.wall_edit(p_code text, p_device_token text, p_note_id uuid, p_child text, p_message text, p_sticker text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare b public.wall_boards := wall_find(p_code); w public.wall_notes;
        v_child text := gt_no_links(gt_txt(p_child, 30)); v_msg text := gt_no_links(gt_txt(p_message, 400, true));
begin
  if v_child is null then raise exception 'name_required'; end if;
  if v_msg is null then raise exception 'message_required'; end if;
  perform gt_rate_check('wall_edit', 60, 6000);
  update public.wall_notes set child = v_child, message = v_msg, sticker = wall_sticker(p_sticker), updated_at = now()
   where id = p_note_id and board_id = b.id and device_token = p_device_token returning * into w;
  if w.id is null then raise exception 'not_yours'; end if;
  return wall_note_json(w, p_device_token);
end; $$;

create or replace function public.wall_remove(p_code text, p_device_token text, p_note_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare b public.wall_boards := wall_find(p_code);
begin
  delete from public.wall_notes where id = p_note_id and board_id = b.id and device_token = p_device_token;
  if not found then raise exception 'not_yours'; end if;
  return true;
end; $$;

create or replace function public.wall_owner_remove(p_code text, p_owner_token text, p_note_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare b public.wall_boards := wall_find(p_code);
begin
  if p_owner_token is null or b.owner_token <> p_owner_token then raise exception 'not_owner'; end if;
  delete from public.wall_notes where id = p_note_id and board_id = b.id;
  return found;
end; $$;

create or replace function public.wall_update(p_code text, p_owner_token text, p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare b public.wall_boards := wall_find(p_code); v_teacher text := gt_no_links(gt_txt(p->>'teacher', 40));
begin
  if p_owner_token is null or b.owner_token <> p_owner_token then raise exception 'not_owner'; end if;
  update public.wall_boards set
    teacher = coalesce(v_teacher, teacher),
    place = case when p ? 'place' then gt_no_links(gt_txt(p->>'place', 60)) else place end,
    occasion = case when p->>'occasion' in ('end-of-year', 'hanukkah', 'rosh-hashana', 'birthday', 'other') then p->>'occasion' else occasion end,
    hide_notes = coalesce((p->>'hide_notes')::boolean, hide_notes)
  where id = b.id returning * into b;
  return wall_board_json(b);
end; $$;

create or replace function public.wall_delete(p_code text, p_owner_token text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  delete from public.wall_boards where code = p_code and owner_token = p_owner_token;
  if not found then raise exception 'not_owner'; end if;
  return true;
end; $$;

-- ───────────────────────── expiry ─────────────────────────

create or replace function public.group_tools_purge()
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.rsvp_events where expires_at < now();
  delete from public.secret_draws where expires_at < now();
  delete from public.wall_boards where expires_at < now();
  delete from public.gt_rate where at < now() - interval '1 day';
end; $$;

-- ───────────────────────── access ─────────────────────────
-- Helpers: nobody calls them directly. Public RPCs: anon + authenticated only.
do $$
declare f regprocedure;
begin
  for f in
    select p.oid::regprocedure from pg_proc p
    where p.pronamespace = 'public'::regnamespace and p.proname in (
      'gt_client', 'gt_rate_check', 'gt_code', 'gt_token_ok', 'gt_txt', 'gt_no_links', 'gt_date',
      'rsvp_clean_invitees', 'rsvp_public', 'rsvp_response_json', 'rsvp_find', 'rsvp_apply', 'rsvp_host_find',
      'secret_assign', 'wall_sticker', 'wall_note_json', 'wall_board_json', 'wall_find', 'group_tools_purge')
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', f);
  end loop;
  for f in
    select p.oid::regprocedure from pg_proc p
    where p.pronamespace = 'public'::regnamespace and p.proname in (
      'rsvp_create', 'rsvp_get', 'rsvp_answer', 'rsvp_withdraw', 'rsvp_host', 'rsvp_update', 'rsvp_remove_response', 'rsvp_delete',
      'secret_create', 'secret_organizer', 'secret_whoami', 'secret_reveal', 'secret_show_all', 'secret_delete',
      'wall_create', 'wall_get', 'wall_owner', 'wall_add', 'wall_edit', 'wall_remove', 'wall_owner_remove', 'wall_update', 'wall_delete')
  loop
    execute format('revoke execute on function %s from public', f);
    execute format('grant execute on function %s to anon, authenticated', f);
  end loop;
end $$;

-- ===== 202610120001_public_print_counts =====
-- "הודפס X פעמים" on printable pages: how many times each page was printed or saved as PDF.
-- Only per-page totals leave the database (no visitors, no times), and only for pages printed at
-- least 10 times. Counts come from the owner analytics log (print + download events, which already
-- skip bots and the owner). Cached for 30 minutes so page views don't re-count the table.

create table if not exists public.public_print_counts_cache (
  id smallint primary key check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.public_print_counts_cache enable row level security;
revoke all on public.public_print_counts_cache from anon, authenticated;

create index if not exists owner_site_activity_print_path
  on public.owner_site_activity(path) where action in ('print', 'download');

create or replace function public.public_print_counts()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  cached jsonb;
  fresh jsonb;
begin
  select data into cached from public.public_print_counts_cache where id = 1 and updated_at > now() - interval '30 minutes';
  if cached is not null then return cached; end if;
  select coalesce(jsonb_object_agg(path, n), '{}'::jsonb) into fresh from (
    select path, count(*) n from public.owner_site_activity
    where action in ('print', 'download') and path is not null
    group by path having count(*) >= 10
  ) x;
  insert into public.public_print_counts_cache(id, data, updated_at) values (1, fresh, now())
    on conflict (id) do update set data = excluded.data, updated_at = excluded.updated_at;
  return fresh;
end;
$$;
revoke all on function public.public_print_counts() from public;
grant execute on function public.public_print_counts() to anon, authenticated;


-- ===== 202610120002_supplier_searches_humans_only.sql =====
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
