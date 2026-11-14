-- "החנוכייה המשותפת" (/hanukkiah, shared link /hanukkiah/<code>), 2026-11-15. Safe to run more than once.
-- A family or a class opens one hanukkiah and shares the link in its WhatsApp group; every night of
-- Hanukkah each phone lights one candle with a first name (and an optional short wish).
--
-- Same model as the thank-you wall (202610110001_group_tools.sql): a short public code, a private
-- organizer token made on the organizer's device (never returned by any function), per-device tokens
-- so a visitor can remove only their own candle. RLS on, every grant revoked, everything goes through
-- the SECURITY DEFINER functions below. Text is checked by gt_no_links (links + words) and by the
-- content-filter trigger (202610220001_content_filter.sql; 'kid' = phone numbers blocked too).
--
-- Nights (Israel time): night n runs from 14:00 on its evening's date until 14:00 the next day.
-- 14:00 and not 16:00 because on Fridays (nights 1 and 8 in 2026) the candles are lit before the
-- Shabbat candles, as early as 15:54 in Jerusalem. Night 1 = the evening of Friday 4.12.2026
-- (src/data/hanukkah.js), night 8 = 11.12, so lighting closes at 14:00 on 12.12.2026.
-- The same rule lives in src/utils/sharedHanukkiah.js (tests/shared-hanukkiah.test.mjs).
-- Applied automatically by .github/workflows/apply-migrations.yml when pushed to main.

create extension if not exists pgcrypto;

create table if not exists public.hk_groups (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  owner_token text not null,
  title text not null,
  kind text not null default 'family' check (kind in ('family', 'class', 'gan', 'friends', 'other')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '120 days'
);
create index if not exists hk_groups_expires on public.hk_groups (expires_at);

create table if not exists public.hk_candles (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.hk_groups(id) on delete cascade,
  night smallint not null check (night between 1 and 8),
  device_token text not null,
  name text not null,
  wish text,
  created_at timestamptz not null default now(),
  unique (group_id, night, device_token)
);
create index if not exists hk_candles_group_night on public.hk_candles (group_id, night, created_at);

alter table public.hk_groups enable row level security;
alter table public.hk_candles enable row level security;
revoke all on public.hk_groups from anon, authenticated;
revoke all on public.hk_candles from anon, authenticated;

-- Content filter on the tables themselves (same trigger as every other group tool).
drop trigger if exists gt_filter on public.hk_groups;
create trigger gt_filter before insert or update on public.hk_groups
  for each row execute function public.gt_filter_row('adult', 'title');
drop trigger if exists gt_filter on public.hk_candles;
create trigger gt_filter before insert or update on public.hk_candles
  for each row execute function public.gt_filter_row('kid', 'name', 'wish');

-- Tonight's night number (Israel time, 14:00 rule above). Below 1 = before Hanukkah, above 8 = after.
create or replace function public.hk_night(p_at timestamptz default now())
returns int language sql stable set search_path = public as $$
  select (((p_at at time zone 'Asia/Jerusalem') - interval '14 hours')::date - date '2026-12-04' + 1)::int;
$$;

create or replace function public.hk_kind(p text)
returns text language sql immutable set search_path = public as $$
  select case when p in ('family', 'class', 'gan', 'friends', 'other') then p else 'family' end;
$$;

create or replace function public.hk_find(p_code text)
returns public.hk_groups language plpgsql stable security definer set search_path = public as $$
declare g public.hk_groups;
begin
  select * into g from public.hk_groups where code = p_code and expires_at > now();
  if g.id is null then raise exception 'not_found'; end if;
  return g;
end; $$;

-- Never the owner token or device tokens.
create or replace function public.hk_candle_json(c public.hk_candles, p_device text)
returns jsonb language sql immutable set search_path = public as $$
  select jsonb_build_object('id', c.id, 'night', c.night, 'name', c.name, 'wish', c.wish, 'created_at', c.created_at,
    'mine', p_device is not null and c.device_token = p_device);
$$;

create or replace function public.hk_group_json(g public.hk_groups)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('code', g.code, 'title', g.title, 'kind', g.kind, 'created_at', g.created_at, 'expires_at', g.expires_at,
    'total', (select count(*) from public.hk_candles c where c.group_id = g.id),
    'people', (select count(distinct c.device_token) from public.hk_candles c where c.group_id = g.id),
    'nights', (select jsonb_agg(coalesce(x.n, 0) order by s.i) from generate_series(1, 8) s(i)
      left join (select c.night, count(*) n from public.hk_candles c where c.group_id = g.id group by c.night) x on x.night = s.i));
$$;

-- The group, tonight's number and the candles of one night (tonight by default; earlier nights on request).
create or replace function public.hk_view(g public.hk_groups, p_device text, p_night int)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_now int := hk_night(); v_max int := greatest(1, least(8, hk_night())); v_show int;
begin
  v_show := case when p_night between 1 and v_max then p_night else v_max end;
  return hk_group_json(g) || jsonb_build_object('night', v_now, 'shown', v_show,
    'lit_tonight', p_device is not null and v_now between 1 and 8 and exists (
      select 1 from public.hk_candles c where c.group_id = g.id and c.night = v_now and c.device_token = p_device),
    'candles', coalesce((select jsonb_agg(hk_candle_json(c, p_device) order by c.created_at)
      from public.hk_candles c where c.group_id = g.id and c.night = v_show), '[]'::jsonb));
end; $$;

create or replace function public.hk_create(p_owner_token text, p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare g public.hk_groups; c text; n int := 0; v_title text := gt_no_links(gt_txt(p->>'title', 60));
begin
  if not gt_token_ok(p_owner_token) then raise exception 'bad_token'; end if;
  if v_title is null then raise exception 'name_required'; end if;
  perform gt_rate_check('hk_create', 15, 600);
  if random() < 0.05 then delete from public.hk_groups where expires_at < now(); end if;
  loop
    c := gt_code(8);
    exit when not exists (select 1 from public.hk_groups where code = c);
    n := n + 1; if n > 20 then raise exception 'code_space_exhausted'; end if;
  end loop;
  insert into public.hk_groups (code, owner_token, title, kind)
  values (c, p_owner_token, v_title, hk_kind(p->>'kind'))
  returning * into g;
  return hk_view(g, null, null);
end; $$;

create or replace function public.hk_get(p_code text, p_device_token text default null, p_night int default null)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare g public.hk_groups := hk_find(p_code);
begin
  return hk_view(g, case when gt_token_ok(p_device_token) then p_device_token end, p_night);
end; $$;

-- Organizer view: the same data (marked 'owner'), after checking the organizer token.
create or replace function public.hk_owner(p_code text, p_owner_token text, p_device_token text default null, p_night int default null)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare g public.hk_groups := hk_find(p_code);
begin
  if p_owner_token is null or g.owner_token <> p_owner_token then raise exception 'not_owner'; end if;
  return hk_view(g, case when gt_token_ok(p_device_token) then p_device_token end, p_night) || jsonb_build_object('owner', true);
end; $$;

-- One candle per device per night; the night is decided here, never by the client.
create or replace function public.hk_light(p_code text, p_device_token text, p_name text, p_wish text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare g public.hk_groups := hk_find(p_code); c public.hk_candles; v_night int := hk_night();
        v_name text := gt_no_links(gt_txt(p_name, 20)); v_wish text := gt_no_links(gt_txt(p_wish, 80));
begin
  if not gt_token_ok(p_device_token) then raise exception 'bad_token'; end if;
  if v_name is null then raise exception 'name_required'; end if;
  if v_night not between 1 and 8 then raise exception 'not_tonight'; end if;
  -- 60 per network: a whole class lighting from one school Wi-Fi in the same 10 minutes.
  perform gt_rate_check('hk_light', 60, 3000);
  if (select count(*) from public.hk_candles where group_id = g.id and night = v_night) >= 300 then raise exception 'hk_full'; end if;
  insert into public.hk_candles (group_id, night, device_token, name, wish)
  values (g.id, v_night, p_device_token, v_name, v_wish)
  on conflict (group_id, night, device_token) do nothing
  returning * into c;
  if c.id is null then raise exception 'already_lit'; end if;
  return hk_candle_json(c, p_device_token);
end; $$;

-- A visitor takes back their own candle (e.g. a typo in the name).
create or replace function public.hk_unlight(p_code text, p_device_token text, p_candle_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare g public.hk_groups := hk_find(p_code);
begin
  delete from public.hk_candles where id = p_candle_id and group_id = g.id and device_token = p_device_token;
  if not found then raise exception 'not_yours'; end if;
  return true;
end; $$;

-- Moderation: the organizer removes any name or wish.
create or replace function public.hk_owner_remove(p_code text, p_owner_token text, p_candle_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare g public.hk_groups := hk_find(p_code);
begin
  if p_owner_token is null or g.owner_token <> p_owner_token then raise exception 'not_owner'; end if;
  delete from public.hk_candles where id = p_candle_id and group_id = g.id;
  return found;
end; $$;

create or replace function public.hk_update(p_code text, p_owner_token text, p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare g public.hk_groups := hk_find(p_code); v_title text := gt_no_links(gt_txt(p->>'title', 60));
begin
  if p_owner_token is null or g.owner_token <> p_owner_token then raise exception 'not_owner'; end if;
  perform gt_rate_check('hk_update', 30, 3000);
  update public.hk_groups set
    title = coalesce(v_title, title),
    kind = case when p ? 'kind' then hk_kind(p->>'kind') else kind end,
    updated_at = now()
  where id = g.id returning * into g;
  return hk_group_json(g);
end; $$;

create or replace function public.hk_delete(p_code text, p_owner_token text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  delete from public.hk_groups where code = p_code and owner_token = p_owner_token;
  if not found then raise exception 'not_owner'; end if;
  return true;
end; $$;

-- ───────────────────────── access ─────────────────────────
revoke execute on function public.hk_night(timestamptz) from public, anon, authenticated;
revoke execute on function public.hk_kind(text) from public, anon, authenticated;
revoke execute on function public.hk_find(text) from public, anon, authenticated;
revoke execute on function public.hk_candle_json(public.hk_candles, text) from public, anon, authenticated;
revoke execute on function public.hk_group_json(public.hk_groups) from public, anon, authenticated;
revoke execute on function public.hk_view(public.hk_groups, text, int) from public, anon, authenticated;

revoke execute on function public.hk_create(text, jsonb) from public;
revoke execute on function public.hk_get(text, text, int) from public;
revoke execute on function public.hk_owner(text, text, text, int) from public;
revoke execute on function public.hk_light(text, text, text, text) from public;
revoke execute on function public.hk_unlight(text, text, uuid) from public;
revoke execute on function public.hk_owner_remove(text, text, uuid) from public;
revoke execute on function public.hk_update(text, text, jsonb) from public;
revoke execute on function public.hk_delete(text, text) from public;
grant execute on function public.hk_create(text, jsonb) to anon, authenticated;
grant execute on function public.hk_get(text, text, int) to anon, authenticated;
grant execute on function public.hk_owner(text, text, text, int) to anon, authenticated;
grant execute on function public.hk_light(text, text, text, text) to anon, authenticated;
grant execute on function public.hk_unlight(text, text, uuid) to anon, authenticated;
grant execute on function public.hk_owner_remove(text, text, uuid) to anon, authenticated;
grant execute on function public.hk_update(text, text, jsonb) to anon, authenticated;
grant execute on function public.hk_delete(text, text) to anon, authenticated;

-- ───────────────────────── owner takedown ─────────────────────────
-- Same function as 202610220002_owner_takedown.sql, plus /hanukkiah/<code>.
create or replace function public.owner_takedown(p_link text)
returns text language plpgsql security definer set search_path = public as $f$
declare m text[]; kind text; c text; n int := 0;
begin
  if not sup_is_owner() then raise exception 'not_owner'; end if;
  m := regexp_match(coalesce(p_link, ''), '(?:^|/)(w|r|l|g|q|t|hw|play|live|hanukkiah)/([A-Za-z0-9_-]+)');
  if m is null then raise exception 'bad_link'; end if;
  kind := m[1]; c := m[2];
  if kind = 'w' and to_regclass('public.wall_boards') is not null then delete from public.wall_boards where code = c; get diagnostics n = row_count;
  elsif kind = 'r' and to_regclass('public.rsvp_events') is not null then delete from public.rsvp_events where code = c; get diagnostics n = row_count;
  elsif kind = 'l' and to_regclass('public.party_lists') is not null then delete from public.party_lists where share_code = c; get diagnostics n = row_count;
  elsif kind = 'g' and to_regclass('public.secret_draws') is not null then delete from public.secret_draws where code = c; get diagnostics n = row_count;
  elsif kind = 'q' and to_regclass('public.quizzes') is not null then delete from public.quizzes where code = c; get diagnostics n = row_count;
  elsif kind in ('play', 'live') and to_regclass('public.live_quizzes') is not null then delete from public.live_quizzes where code = upper(c); get diagnostics n = row_count;
  elsif kind = 'hw' and to_regclass('public.hw_assignments') is not null then delete from public.hw_assignments where code = c; get diagnostics n = row_count;
  elsif kind = 't' and to_regclass('public.sg_spaces') is not null then delete from public.sg_spaces where code = c; get diagnostics n = row_count;
  elsif kind = 'hanukkiah' and to_regclass('public.hk_groups') is not null then delete from public.hk_groups where code = lower(c); get diagnostics n = row_count;
  end if;
  return case when n > 0 then 'removed' else 'not_found' end;
end; $f$;

revoke all on function public.owner_takedown(text) from public, anon;
grant execute on function public.owner_takedown(text) to authenticated;

-- ───────────────────────── owner report ─────────────────────────
-- Same function as the latest version (202610240004_rsvp_english.sql), plus shared hanukkiahs.
-- Counts only: no names or wishes leave the database.
create or replace function public.owner_created_things(p_from timestamptz, p_to timestamptz)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  return coalesce((select jsonb_agg(x order by x->>'last' desc) from (select x from (
    -- RSVP events: guests' page /r/<code> (or /en/r/<code>)
    select jsonb_build_object('kind', 'rsvp', 'title', e.title, 'created', e.created_at, 'date', e.event_date,
      'opens', (select count(*) from public.owner_site_activity a where a.action = 'open' and a.path in ('/r/' || e.code, '/en/r/' || e.code)),
      'yes', count(r.id) filter (where r.status = 'yes'), 'maybe', count(r.id) filter (where r.status = 'maybe'),
      'no', count(r.id) filter (where r.status = 'no'),
      'people', coalesce(sum(r.kids + r.adults) filter (where r.status = 'yes'), 0),
      'last', greatest(e.created_at, max(r.updated_at))) x
    from public.rsvp_events e left join public.rsvp_responses r on r.event_id = e.id
    group by e.id having greatest(e.created_at, max(r.updated_at)) >= p_from and e.created_at < p_to
    union all
    -- Thank-you walls: /w/<code>
    select jsonb_build_object('kind', 'wall', 'title', 'קיר ברכות ל' || w.teacher || coalesce(' · ' || w.place, ''), 'created', w.created_at,
      'opens', (select count(*) from public.owner_site_activity a where a.action = 'open' and a.path = '/w/' || w.code),
      'answers', count(n.id), 'last', greatest(w.created_at, max(n.updated_at)))
    from public.wall_boards w left join public.wall_notes n on n.board_id = w.id
    group by w.id having greatest(w.created_at, max(n.updated_at)) >= p_from and w.created_at < p_to
    union all
    -- Secret-friend draws: each participant gets a personal link
    select jsonb_build_object('kind', 'secret', 'title', d.title, 'created', d.created_at,
      'opens', coalesce(sum(p.opens), 0), 'people', count(p.id), 'answers', count(p.id) filter (where p.opened_at is not null),
      'last', greatest(d.created_at, max(p.opened_at)))
    from public.secret_draws d left join public.secret_people p on p.draw_id = d.id
    group by d.id having greatest(d.created_at, max(p.opened_at)) >= p_from and d.created_at < p_to
    union all
    -- Online quizzes: /q/<code>
    select jsonb_build_object('kind', 'quiz', 'title', q.title, 'created', q.created_at,
      'opens', (select count(*) from public.quiz_starts s where s.quiz_id = q.id),
      'answers', count(s.id), 'avg', round(avg(100.0 * s.score / nullif(s.total, 0))),
      'last', greatest(q.created_at, max(s.created_at)))
    from public.quizzes q left join public.quiz_submissions s on s.quiz_id = q.id
    group by q.id having greatest(q.created_at, max(s.created_at)) >= p_from and q.created_at < p_to
    union all
    -- Live class quizzes
    select jsonb_build_object('kind', 'live', 'title', l.title, 'created', l.created_at,
      'answers', count(p.id), 'last', greatest(l.created_at, max(p.joined_at)))
    from public.live_quizzes l left join public.live_quiz_players p on p.quiz_id = l.id
    group by l.id having greatest(l.created_at, max(p.joined_at)) >= p_from and l.created_at < p_to
    union all
    -- Homework: /hw/<code>
    select jsonb_build_object('kind', 'homework', 'title', h.title || coalesce(' · ' || h.class_name, ''), 'created', h.created_at,
      'opens', (select count(*) from public.owner_site_activity a where a.action = 'open' and a.path = '/hw/' || h.code),
      'people', count(distinct lower(r.student_name)), 'answers', count(r.id),
      'last', greatest(h.created_at, max(r.updated_at)))
    from public.hw_assignments h left join public.hw_results r on r.assignment_id = h.id
    group by h.id having greatest(h.created_at, max(r.updated_at)) >= p_from and h.created_at < p_to
    union all
    -- Shared hanukkiahs: /hanukkiah/<code> (answers = candles lit, people = phones that lit)
    select jsonb_build_object('kind', 'hanukkiah', 'title', 'חנוכייה: ' || k.title, 'created', k.created_at,
      'opens', (select count(*) from public.owner_site_activity a where a.action = 'open' and a.path = '/hanukkiah/' || k.code),
      'people', count(distinct c.device_token), 'answers', count(c.id),
      'last', greatest(k.created_at, max(c.created_at)))
    from public.hk_groups k left join public.hk_candles c on c.group_id = k.id
    group by k.id having greatest(k.created_at, max(c.created_at)) >= p_from and k.created_at < p_to
  ) u(x) order by x->>'last' desc limit 150) items), '[]'::jsonb);
end; $$;
revoke all on function public.owner_created_things(timestamptz, timestamptz) from public, anon;
grant execute on function public.owner_created_things(timestamptz, timestamptz) to authenticated;

notify pgrst, 'reload schema';
