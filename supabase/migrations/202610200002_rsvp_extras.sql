-- RSVP extras, all optional and off unless the organizer sets them:
--   per event  — the event type, the guests' language, parking/arrival note, a participation fee with a
--                payment link (class committees), and seating tables (optionally shown to guests);
--   per answer — the organizer's "paid" mark and table number.
-- The existing RSVP functions are untouched; guests and organizers read the extras with one more call.
-- Safe to run twice. Applied automatically by .github/workflows/apply-migrations.yml.

create table if not exists public.rsvp_extras (
  event_id uuid primary key references public.rsvp_events(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists public.rsvp_marks (
  response_id uuid primary key references public.rsvp_responses(id) on delete cascade,
  paid boolean not null default false,
  table_no smallint check (table_no between 1 and 200),
  updated_at timestamptz not null default now()
);
alter table public.rsvp_extras enable row level security;
alter table public.rsvp_marks enable row level security;
revoke all on public.rsvp_extras, public.rsvp_marks from public, anon, authenticated;

-- Keeps only known keys with sane values.
create or replace function public.rsvp_clean_extras(p jsonb)
returns jsonb language plpgsql immutable set search_path = '' as $$
declare o jsonb := '{}'::jsonb; v text; n numeric;
begin
  if p is null or jsonb_typeof(p) <> 'object' then return o; end if;
  v := p->>'type'; if v ~ '^[a-z0-9-]{1,40}$' then o := o || jsonb_build_object('type', v); end if;
  v := p->>'lang'; if v in ('he', 'ar', 'ru', 'en') then o := o || jsonb_build_object('lang', v); end if;
  v := btrim(coalesce(p->>'parking', '')); if v <> '' then o := o || jsonb_build_object('parking', left(v, 300)); end if;
  if jsonb_typeof(p->'price') = 'number' then n := (p->>'price')::numeric; if n > 0 and n <= 10000 then o := o || jsonb_build_object('price', round(n, 2)); end if; end if;
  v := btrim(coalesce(p->>'pay_link', '')); if v ~* '^https://[^\s<>"]{3,}$' and length(v) <= 300 then o := o || jsonb_build_object('pay_link', v); end if;
  if jsonb_typeof(p->'tables') = 'number' then n := (p->>'tables')::numeric; if n >= 1 and n <= 200 then o := o || jsonb_build_object('tables', n::int); end if; end if;
  if (p->>'show_table') = 'true' then o := o || jsonb_build_object('show_table', true); end if;
  return o;
end; $$;

create or replace function public.rsvp_extras_set(p_code text, p_host_token text, p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare e public.rsvp_events := rsvp_host_find(p_code, p_host_token); v jsonb := public.rsvp_clean_extras(p);
begin
  insert into public.rsvp_extras(event_id, data) values (e.id, v)
  on conflict (event_id) do update set data = excluded.data, updated_at = now();
  -- fewer tables than before: clear seats that no longer exist
  update public.rsvp_marks m set table_no = null from public.rsvp_responses r
    where m.response_id = r.id and r.event_id = e.id and m.table_no > coalesce((v->>'tables')::int, 0);
  return v;
end; $$;

-- Guests get the event's extras and their own table (when the organizer shows tables); the organizer
-- (valid host token) also gets every answer's marks.
create or replace function public.rsvp_extras_get(p_code text, p_device_token text default null, p_host_token text default null)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare e public.rsvp_events := rsvp_find(p_code); x jsonb; host boolean; my_table smallint;
begin
  select data into x from public.rsvp_extras where event_id = e.id;
  x := coalesce(x, '{}'::jsonb);
  host := p_host_token is not null and p_host_token = e.host_token;
  if host then
    return jsonb_build_object('extras', x, 'marks', coalesce((select jsonb_object_agg(m.response_id, jsonb_build_object('paid', m.paid, 'table', m.table_no))
      from public.rsvp_marks m join public.rsvp_responses r on r.id = m.response_id where r.event_id = e.id), '{}'::jsonb));
  end if;
  if (x->>'show_table') = 'true' and p_device_token is not null then
    select m.table_no into my_table from public.rsvp_marks m join public.rsvp_responses r on r.id = m.response_id
      where r.event_id = e.id and r.device_token = p_device_token;
  end if;
  return jsonb_build_object('extras', x, 'my_table', my_table);
end; $$;

create or replace function public.rsvp_mark(p_code text, p_host_token text, p_response_id uuid, p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare e public.rsvp_events := rsvp_host_find(p_code, p_host_token); t int; m public.rsvp_marks;
begin
  if not exists (select 1 from public.rsvp_responses where id = p_response_id and event_id = e.id) then raise exception 'not_found'; end if;
  t := case when jsonb_typeof(p->'table') = 'number' then (p->>'table')::int end;
  if t is not null and (t < 1 or t > 200) then raise exception 'bad_number'; end if;
  insert into public.rsvp_marks(response_id, paid, table_no) values (p_response_id, coalesce((p->>'paid')::boolean, false), t)
  on conflict (response_id) do update set
    paid = case when p ? 'paid' then coalesce((p->>'paid')::boolean, false) else public.rsvp_marks.paid end,
    table_no = case when p ? 'table' then t else public.rsvp_marks.table_no end,
    updated_at = now()
  returning * into m;
  return jsonb_build_object('paid', m.paid, 'table', m.table_no);
end; $$;

revoke all on function public.rsvp_clean_extras(jsonb) from public, anon, authenticated;
revoke all on function public.rsvp_extras_set(text, text, jsonb), public.rsvp_extras_get(text, text, text), public.rsvp_mark(text, text, uuid, jsonb) from public;
grant execute on function public.rsvp_extras_set(text, text, jsonb), public.rsvp_extras_get(text, text, text), public.rsvp_mark(text, text, uuid, jsonb) to anon, authenticated;
