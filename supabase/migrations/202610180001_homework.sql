-- שיעורי בית: a signed-in teacher builds homework from the site's activities (maths, reading,
-- dictation, her own questions), students open it by link with a first name only, and every task
-- they finish reports its score. Teachers see only their own homework (RLS on auth.uid());
-- students never read the tables directly, only through the functions below.

create table if not exists public.hw_assignments (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  class_name text,
  due_date date,
  tasks jsonb not null,
  names jsonb not null default '[]'::jsonb,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '180 days'
);
create index if not exists hw_assignments_teacher on public.hw_assignments(teacher_id, created_at desc);

create table if not exists public.hw_results (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.hw_assignments(id) on delete cascade,
  student_name text not null,
  device_id text not null,
  task_index int not null,
  score int not null,
  total int not null,
  seconds int not null default 0,
  attempts int not null default 1,
  details jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
create unique index if not exists hw_results_student_task on public.hw_results(assignment_id, lower(student_name), task_index);

alter table public.hw_assignments enable row level security;
alter table public.hw_results enable row level security;
revoke all on public.hw_assignments, public.hw_results from public, anon, authenticated;
grant select, delete on public.hw_assignments to authenticated;
grant select, delete on public.hw_results to authenticated;

drop policy if exists hw_assignments_teacher on public.hw_assignments;
create policy hw_assignments_teacher on public.hw_assignments for all to authenticated
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
drop policy if exists hw_results_teacher on public.hw_results;
create policy hw_results_teacher on public.hw_results for all to authenticated
  using (exists (select 1 from public.hw_assignments a where a.id = assignment_id and a.teacher_id = auth.uid()));

create or replace function public.hw_short_code()
returns text language plpgsql volatile set search_path = '' as $$
declare alphabet text := 'abcdefghjkmnpqrstuvwxyz23456789'; c text; n int := 0;
begin
  loop
    c := '';
    for i in 1..6 loop c := c || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1); end loop;
    exit when not exists (select 1 from public.hw_assignments where code = c);
    n := n + 1; if n > 30 then raise exception 'code_space_exhausted'; end if;
  end loop;
  return c;
end; $$;

-- Tasks: 1..12 objects with a known type; the site builds and checks their contents.
create or replace function public.hw_clean_tasks(p jsonb)
returns jsonb language plpgsql immutable set search_path = '' as $$
declare e jsonb;
begin
  if p is null or jsonb_typeof(p) <> 'array' or jsonb_array_length(p) < 1 or jsonb_array_length(p) > 12 then raise exception 'bad_tasks'; end if;
  if length(p::text) > 60000 then raise exception 'bad_tasks'; end if;
  for e in select * from jsonb_array_elements(p) loop
    if jsonb_typeof(e) <> 'object' or coalesce(e->>'type', '') not in ('math', 'reading', 'dictation', 'questions') then raise exception 'bad_tasks'; end if;
  end loop;
  return p;
end; $$;

-- Up to 60 distinct first names, 40 characters each.
create or replace function public.hw_clean_names(p jsonb)
returns jsonb language sql immutable set search_path = '' as $$
  with raw as (
    select left(btrim(regexp_replace(v, '\s+', ' ', 'g')), 40) as n, i
    from jsonb_array_elements_text(case when jsonb_typeof(p) = 'array' then p else '[]'::jsonb end) with ordinality as t(v, i)
  ), firsts as (
    select distinct on (lower(n)) n, i from raw where n <> '' order by lower(n), i
  )
  select coalesce(jsonb_agg(n order by i), '[]'::jsonb) from (select n, i from firsts order by i limit 60) kept
$$;

-- Creates (p_code null) or updates the signed-in teacher's homework; returns its code.
create or replace function public.hw_save(p_code text, p_title text, p_class text, p_due date, p_tasks jsonb, p_names jsonb)
returns text language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); v_title text := left(btrim(coalesce(p_title, '')), 120); v_code text;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  if v_title = '' then raise exception 'title_required'; end if;
  delete from public.hw_assignments where expires_at < now();
  if p_code is null or p_code = '' then
    if (select count(*) from public.hw_assignments where teacher_id = uid) >= 300 then raise exception 'too_many'; end if;
    v_code := public.hw_short_code();
    insert into public.hw_assignments(code, teacher_id, title, class_name, due_date, tasks, names)
    values (v_code, uid, v_title, nullif(left(btrim(coalesce(p_class, '')), 60), ''), p_due, public.hw_clean_tasks(p_tasks), public.hw_clean_names(p_names));
    return v_code;
  end if;
  update public.hw_assignments set title = v_title, class_name = nullif(left(btrim(coalesce(p_class, '')), 60), ''), due_date = p_due,
    tasks = public.hw_clean_tasks(p_tasks), names = public.hw_clean_names(p_names), updated_at = now(), expires_at = now() + interval '180 days'
  where code = p_code and teacher_id = uid returning code into v_code;
  if v_code is null then raise exception 'not_found'; end if;
  return v_code;
end; $$;

create or replace function public.hw_set_status(p_code text, p_status text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'not_signed_in'; end if;
  if p_status not in ('open', 'closed') then raise exception 'bad_input'; end if;
  update public.hw_assignments set status = p_status, updated_at = now() where code = p_code and teacher_id = auth.uid();
  if not found then raise exception 'not_found'; end if;
end; $$;

-- What a student sees: the homework without anything about the teacher.
create or replace function public.hw_open(p_code text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare a public.hw_assignments;
begin
  select * into a from public.hw_assignments where code = lower(btrim(coalesce(p_code, ''))) and expires_at > now();
  if not found then raise exception 'not_found'; end if;
  return jsonb_build_object('title', a.title, 'class_name', a.class_name, 'due_date', a.due_date, 'tasks', a.tasks, 'names', a.names, 'status', a.status);
end; $$;

-- A student's finished tasks, so the checklist shows them on any device.
create or replace function public.hw_progress(p_code text, p_name text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_id uuid;
begin
  select id into v_id from public.hw_assignments where code = lower(btrim(coalesce(p_code, ''))) and expires_at > now();
  if v_id is null then raise exception 'not_found'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('task', task_index, 'score', score, 'total', total, 'attempts', attempts))
    from public.hw_results where assignment_id = v_id and lower(student_name) = lower(btrim(coalesce(p_name, '')))), '[]'::jsonb);
end; $$;

-- One finished task. A repeat keeps the latest result and counts the attempt.
create or replace function public.hw_submit(p_code text, p_device text, p_name text, p_task int, p_score int, p_total int, p_seconds int, p_details jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare a public.hw_assignments; v_name text := left(btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g')), 40);
begin
  select * into a from public.hw_assignments where code = lower(btrim(coalesce(p_code, ''))) and expires_at > now();
  if not found then raise exception 'not_found'; end if;
  if a.status <> 'open' then raise exception 'closed'; end if;
  if v_name = '' then raise exception 'name_required'; end if;
  if jsonb_array_length(a.names) > 0 and not exists (select 1 from jsonb_array_elements_text(a.names) n where lower(n) = lower(v_name)) then raise exception 'unknown_name'; end if;
  if p_task is null or p_task < 0 or p_task >= jsonb_array_length(a.tasks) then raise exception 'bad_input'; end if;
  if p_total is null or p_total < 1 or p_total > 200 or p_score is null or p_score < 0 or p_score > p_total then raise exception 'bad_input'; end if;
  if length(coalesce(p_details, '[]'::jsonb)::text) > 8000 then raise exception 'bad_input'; end if;
  if (select count(*) from public.hw_results where assignment_id = a.id) >= 3000 then raise exception 'too_many'; end if;
  insert into public.hw_results(assignment_id, student_name, device_id, task_index, score, total, seconds, details)
  values (a.id, v_name, left(coalesce(p_device, ''), 64), p_task, p_score, p_total, least(greatest(coalesce(p_seconds, 0), 0), 86400), coalesce(p_details, '[]'::jsonb))
  on conflict (assignment_id, lower(student_name), task_index) do update set
    score = excluded.score, total = excluded.total, seconds = excluded.seconds, details = excluded.details,
    device_id = excluded.device_id, attempts = public.hw_results.attempts + 1, updated_at = now();
end; $$;

revoke all on function public.hw_short_code(), public.hw_clean_tasks(jsonb), public.hw_clean_names(jsonb) from public, anon, authenticated;
revoke all on function public.hw_save(text, text, text, date, jsonb, jsonb), public.hw_set_status(text, text) from public, anon, authenticated;
revoke all on function public.hw_open(text), public.hw_progress(text, text), public.hw_submit(text, text, text, int, int, int, int, jsonb) from public, anon, authenticated;
grant execute on function public.hw_save(text, text, text, date, jsonb, jsonb), public.hw_set_status(text, text) to authenticated;
grant execute on function public.hw_open(text), public.hw_progress(text, text), public.hw_submit(text, text, text, int, int, int, int, jsonb) to anon, authenticated;
