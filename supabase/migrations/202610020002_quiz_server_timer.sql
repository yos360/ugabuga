-- Quiz time limit enforced on the server (2026-10-02). Safe to run more than once.
-- Before: the countdown lived only in the browser — clearing the tab's storage restarted it.
-- Now: the first time a device opens a timed quiz, the server records the start time; the page counts
-- down from it, and a submission after the limit is still saved but marked "late" for the teacher.

create table if not exists public.quiz_starts (
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  device_id text not null,
  started_at timestamptz not null default now(),
  primary key (quiz_id, device_id)
);
alter table public.quiz_starts enable row level security;
revoke all on public.quiz_starts from anon, authenticated;

alter table public.quiz_submissions add column if not exists late boolean not null default false;

-- Returns how many seconds this device has left (null = no time limit). Starting again returns the
-- original start, so a refresh or a new tab never resets the clock.
create or replace function public.quiz_start(p_code text, p_device_id text)
returns table(seconds_left int) language plpgsql security definer set search_path = public as $$
declare qz public.quizzes; started timestamptz; mins int;
begin
  select * into qz from public.quizzes where quizzes.code = p_code and expires_at > now();
  if not found then raise exception 'quiz_not_found'; end if;
  if length(coalesce(p_device_id,'')) < 8 then raise exception 'bad_device'; end if;
  mins := case when (qz.settings->>'minutes') ~ '^[0-9]+$' then (qz.settings->>'minutes')::int else 0 end;
  if mins <= 0 then return query select null::int; return; end if;
  insert into public.quiz_starts(quiz_id, device_id) values (qz.id, p_device_id) on conflict do nothing;
  select qs.started_at into started from public.quiz_starts qs where qs.quiz_id = qz.id and qs.device_id = p_device_id;
  return query select greatest(0, ceil(extract(epoch from (started + make_interval(mins => mins) - now()))))::int;
end; $$;
grant execute on function public.quiz_start(text, text) to anon, authenticated;

create or replace function public.quiz_submit(p_code text, p_device_id text, p_name text, p_answers jsonb)
returns table(score int, total int, shown boolean) language plpgsql security definer set search_path = public as $$
declare late boolean := false; started timestamptz; qz public.quizzes; s int := 0; t int; nm text := left(trim(coalesce(p_name,'')), 40); clean jsonb := '{}'::jsonb; e jsonb; a int;
begin
  select * into qz from public.quizzes where quizzes.code = p_code and expires_at > now();
  if not found then raise exception 'quiz_not_found'; end if;
  if qz.status <> 'open' then raise exception 'quiz_closed'; end if;
  if nm = '' then raise exception 'name_required'; end if;
  if length(coalesce(p_device_id,'')) < 8 then raise exception 'bad_device'; end if;
  if (select count(*) from public.quiz_submissions where quiz_id = qz.id) >= 300 then raise exception 'quiz_full'; end if;
  if exists (select 1 from public.quiz_submissions where quiz_id = qz.id and device_id = p_device_id) then raise exception 'already_submitted'; end if;
  if exists (select 1 from public.quiz_submissions where quiz_id = qz.id and lower(student_name) = lower(nm)) then raise exception 'name_taken'; end if;
  t := jsonb_array_length(qz.questions);
  for e in select * from jsonb_array_elements(qz.questions) loop
    a := case when jsonb_typeof(p_answers->(e->>'id')) = 'number' then (p_answers->>(e->>'id'))::int else null end;
    if a is not null then clean := clean || jsonb_build_object(e->>'id', a); end if;
    if a is not null and a = (e->>'correct')::int then s := s + 1; end if;
  end loop;
  -- Time limit is checked against the start time the server recorded (quiz_start), not the browser clock.
  -- One minute of grace covers a slow network on the automatic hand-in.
  if (qz.settings->>'minutes') ~ '^[0-9]+$' and (qz.settings->>'minutes')::int > 0 then
    select qs.started_at into started from public.quiz_starts qs where qs.quiz_id = qz.id and qs.device_id = p_device_id;
    late := started is not null and now() > started + make_interval(mins => (qz.settings->>'minutes')::int + 1);
  end if;
  insert into public.quiz_submissions(quiz_id, student_name, device_id, answers, score, total, late)
    values (qz.id, nm, p_device_id, clean, s, t, late);
  return query select case when (qz.settings->>'showScore')::boolean then s else null end, t, coalesce((qz.settings->>'showScore')::boolean, true);
end; $$;

create or replace function public.quiz_results(p_code text, p_owner_token text)
returns table(title text, settings jsonb, questions jsonb, names jsonb, status text, created_at timestamptz, expires_at timestamptz, submissions jsonb)
language sql security definer set search_path = public as $$
  select q.title, q.settings, q.questions, q.names, q.status, q.created_at, q.expires_at,
    (select coalesce(jsonb_agg(jsonb_build_object('id', s.id, 'name', s.student_name, 'answers', s.answers, 'score', s.score, 'total', s.total, 'at', s.created_at, 'late', s.late) order by s.created_at), '[]'::jsonb)
       from public.quiz_submissions s where s.quiz_id = q.id)
  from public.quizzes q where q.code = p_code and q.owner_token = p_owner_token
$$;
