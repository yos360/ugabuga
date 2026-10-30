-- The timetable planner in the cloud: a teacher signs in with a link sent to their email
-- (functions/api/planner.js), and their plan (classes, timetable, days off) is kept here so it shows on
-- every device. Keyed by the email; only the service role (the Pages function) reads or writes.
-- The emails are also how registered teachers hear about planner changes. Safe to run again.
create table if not exists public.planner_plans (
  email text primary key check (char_length(email) <= 120),
  plan jsonb not null default '{}'::jsonb check (pg_column_size(plan) < 200000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen timestamptz
);
alter table public.planner_plans enable row level security;
revoke all on table public.planner_plans from anon, authenticated;
grant select, insert, update on public.planner_plans to service_role;

create or replace function public.planner_action(p_action text, p jsonb default '{}') returns jsonb
language plpgsql security invoker set search_path = public as $$
declare v_email text := lower(btrim(coalesce(p ->> 'email', '')));
begin
  if v_email !~ '^[^@\s]+@[^@\s]+\.[a-z]{2,}$' then raise exception 'bad_email'; end if;
  if p_action = 'get' then
    update public.planner_plans set last_seen = now() where email = v_email;
    return coalesce((select jsonb_build_object('plan', plan, 'updated_at', updated_at) from public.planner_plans where email = v_email), 'null'::jsonb);
  elsif p_action = 'save' then
    insert into public.planner_plans (email, plan, updated_at, last_seen) values (v_email, coalesce(p -> 'plan', '{}'::jsonb), now(), now())
      on conflict (email) do update set plan = excluded.plan, updated_at = now(), last_seen = now();
    return jsonb_build_object('updated_at', now());
  elsif p_action = 'register' then
    insert into public.planner_plans (email) values (v_email) on conflict (email) do nothing;
    return 'true'::jsonb;
  end if;
  raise exception 'invalid_action';
end $$;
revoke all on function public.planner_action(text, jsonb) from public, anon, authenticated;
grant execute on function public.planner_action(text, jsonb) to service_role;

-- The owner sees how many teachers use the planner (owner report).
create or replace function public.planner_teachers_owner()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  return jsonb_build_object('teachers', (select count(*) from public.planner_plans),
    'active_week', (select count(*) from public.planner_plans where last_seen > now() - interval '7 days'),
    'with_timetable', (select count(*) from public.planner_plans where jsonb_typeof(plan -> 'slots') = 'object' and plan -> 'slots' <> '{}'::jsonb));
end $$;
revoke all on function public.planner_teachers_owner() from public, anon, authenticated;
grant execute on function public.planner_teachers_owner() to authenticated;
