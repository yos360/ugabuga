-- Smart seating for RSVP events: seats per table, a group tag on each answer (organizer only, never
-- shown to guests), and one call that seats many answers at once. Safe to run twice.
-- Applied automatically by .github/workflows/apply-migrations.yml.

alter table public.rsvp_marks add column if not exists grp text;

-- Extras: the same known keys as in 202610240004_rsvp_english.sql, plus `seats`.
create or replace function public.rsvp_clean_extras(p jsonb)
returns jsonb language plpgsql immutable set search_path = '' as $$
declare o jsonb := '{}'::jsonb; v text; n numeric;
begin
  if p is null or jsonb_typeof(p) <> 'object' then return o; end if;
  v := p->>'type'; if v ~ '^[a-z0-9-]{1,40}$' then o := o || jsonb_build_object('type', v); end if;
  v := p->>'lang'; if v in ('he', 'ar', 'ru', 'en') then o := o || jsonb_build_object('lang', v); end if;
  v := btrim(coalesce(p->>'parking', '')); if v <> '' then o := o || jsonb_build_object('parking', left(v, 300)); end if;
  if jsonb_typeof(p->'price') = 'number' then n := (p->>'price')::numeric; if n > 0 and n <= 10000 then o := o || jsonb_build_object('price', round(n, 2)); end if; end if;
  v := p->>'currency'; if v in ('ILS', 'USD', 'GBP', 'EUR', 'CAD', 'AUD') then o := o || jsonb_build_object('currency', v); end if;
  v := btrim(coalesce(p->>'pay_link', '')); if v ~* '^https://[^\s<>"]{3,}$' and length(v) <= 300 then o := o || jsonb_build_object('pay_link', v); end if;
  if jsonb_typeof(p->'tables') = 'number' then n := (p->>'tables')::numeric; if n >= 1 and n <= 200 then o := o || jsonb_build_object('tables', n::int); end if; end if;
  if jsonb_typeof(p->'seats') = 'number' then n := (p->>'seats')::numeric; if n >= 2 and n <= 30 then o := o || jsonb_build_object('seats', n::int); end if; end if;
  if (p->>'show_table') = 'true' then o := o || jsonb_build_object('show_table', true); end if;
  return o;
end; $$;
revoke all on function public.rsvp_clean_extras(jsonb) from public, anon, authenticated;

-- Same as 202610200002_rsvp_extras.sql, with the group in the organizer's marks.
create or replace function public.rsvp_extras_get(p_code text, p_device_token text default null, p_host_token text default null)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare e public.rsvp_events := rsvp_find(p_code); x jsonb; host boolean; my_table smallint;
begin
  select data into x from public.rsvp_extras where event_id = e.id;
  x := coalesce(x, '{}'::jsonb);
  host := p_host_token is not null and p_host_token = e.host_token;
  if host then
    return jsonb_build_object('extras', x, 'marks', coalesce((select jsonb_object_agg(m.response_id, jsonb_build_object('paid', m.paid, 'table', m.table_no, 'group', m.grp))
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
declare e public.rsvp_events := rsvp_host_find(p_code, p_host_token); t int; g text; m public.rsvp_marks;
begin
  if not exists (select 1 from public.rsvp_responses where id = p_response_id and event_id = e.id) then raise exception 'not_found'; end if;
  t := case when jsonb_typeof(p->'table') = 'number' then (p->>'table')::int end;
  if t is not null and (t < 1 or t > 200) then raise exception 'bad_number'; end if;
  g := left(nullif(btrim(coalesce(p->>'group', '')), ''), 30);
  insert into public.rsvp_marks(response_id, paid, table_no, grp) values (p_response_id, coalesce((p->>'paid')::boolean, false), t, g)
  on conflict (response_id) do update set
    paid = case when p ? 'paid' then coalesce((p->>'paid')::boolean, false) else public.rsvp_marks.paid end,
    table_no = case when p ? 'table' then t else public.rsvp_marks.table_no end,
    grp = case when p ? 'group' then g else public.rsvp_marks.grp end,
    updated_at = now()
  returning * into m;
  return jsonb_build_object('paid', m.paid, 'table', m.table_no, 'group', m.grp);
end; $$;

-- Automatic seating and its undo: { response id: table number, or null to clear }, all or nothing.
create or replace function public.rsvp_seat_many(p_code text, p_host_token text, p jsonb)
returns int language plpgsql security definer set search_path = public as $$
declare e public.rsvp_events := rsvp_host_find(p_code, p_host_token); n int;
begin
  if p is null or jsonb_typeof(p) <> 'object' then raise exception 'bad_number'; end if;
  if exists (select 1 from jsonb_each_text(p) s where s.value is not null and (s.value !~ '^[0-9]{1,3}$' or s.value::int not between 1 and 200)) then raise exception 'bad_number'; end if;
  insert into public.rsvp_marks(response_id, table_no)
    select r.id, s.value::smallint from jsonb_each_text(p) s join public.rsvp_responses r on r.id::text = s.key and r.event_id = e.id
  on conflict (response_id) do update set table_no = excluded.table_no, updated_at = now();
  get diagnostics n = row_count;
  return n;
end; $$;

revoke all on function public.rsvp_extras_get(text, text, text), public.rsvp_mark(text, text, uuid, jsonb), public.rsvp_seat_many(text, text, jsonb) from public;
grant execute on function public.rsvp_extras_get(text, text, text), public.rsvp_mark(text, text, uuid, jsonb), public.rsvp_seat_many(text, text, jsonb) to anon, authenticated;

notify pgrst, 'reload schema';
