-- מבחן אמריקאי אונליין: the teacher builds a multiple-choice quiz, students answer
-- from any device, the server grades. Correct answers never leave the server
-- before submission. Students are first names only; everything expires in 30 days.

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  owner_token text not null,
  title text not null,
  settings jsonb not null default '{}'::jsonb,
  questions jsonb not null,
  names jsonb not null default '[]'::jsonb,
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '30 days'
);

create table if not exists public.quiz_submissions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  student_name text not null,
  device_id text not null,
  answers jsonb not null,
  score int not null,
  total int not null,
  created_at timestamptz not null default now(),
  unique (quiz_id, device_id)
);
create unique index if not exists quiz_submissions_name_uq on public.quiz_submissions (quiz_id, lower(student_name));

-- No direct table access: everything goes through the functions below.
alter table public.quizzes enable row level security;
alter table public.quiz_submissions enable row level security;
revoke all on public.quizzes from anon, authenticated;
revoke all on public.quiz_submissions from anon, authenticated;

create or replace function public.quiz_short_code()
returns text language plpgsql volatile as $$
declare alphabet text := 'abcdefghjkmnpqrstuvwxyz23456789'; c text; n int := 0;
begin
  loop
    c := '';
    for i in 1..6 loop c := c || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1); end loop;
    exit when not exists (select 1 from public.quizzes where code = c);
    n := n + 1; if n > 30 then raise exception 'code_space_exhausted'; end if;
  end loop;
  return c;
end; $$;

-- Validates and normalises questions: [{id, q, options:[2..4 strings], correct:int}] (1..50).
create or replace function public.quiz_clean_questions(p jsonb)
returns jsonb language plpgsql immutable as $$
declare out jsonb := '[]'::jsonb; e jsonb; opts jsonb; o jsonb; clean_opts jsonb; c int; i int := 0; qid text; qtext text;
begin
  if p is null or jsonb_typeof(p) <> 'array' then raise exception 'bad_questions'; end if;
  if jsonb_array_length(p) < 1 or jsonb_array_length(p) > 50 then raise exception 'bad_questions'; end if;
  for e in select * from jsonb_array_elements(p) loop
    i := i + 1;
    qtext := left(trim(coalesce(e->>'q','')), 300);
    if qtext = '' then raise exception 'empty_question'; end if;
    opts := e->'options';
    if opts is null or jsonb_typeof(opts) <> 'array' or jsonb_array_length(opts) < 2 or jsonb_array_length(opts) > 4 then raise exception 'bad_options'; end if;
    clean_opts := '[]'::jsonb;
    for o in select * from jsonb_array_elements(opts) loop
      if trim(coalesce(o #>> '{}','')) = '' then raise exception 'empty_option'; end if;
      clean_opts := clean_opts || to_jsonb(left(trim(o #>> '{}'), 150));
    end loop;
    c := coalesce((e->>'correct')::int, -1);
    if c < 0 or c >= jsonb_array_length(clean_opts) then raise exception 'bad_correct'; end if;
    qid := left(coalesce(nullif(e->>'id',''), 'q' || i), 24);
    out := out || jsonb_build_object('id', qid, 'q', qtext, 'options', clean_opts, 'correct', c);
  end loop;
  return out;
end; $$;

create or replace function public.quiz_clean_settings(p jsonb)
returns jsonb language sql immutable as $$
  select jsonb_build_object(
    'showScore', coalesce((p->>'showScore')::boolean, true),
    'shuffle', coalesce((p->>'shuffle')::boolean, true),
    'minutes', greatest(0, least(180, coalesce((p->>'minutes')::int, 0))),
    'dir', case when p->>'dir' = 'ltr' then 'ltr' else 'rtl' end)
$$;

create or replace function public.quiz_clean_names(p jsonb)
returns jsonb language sql immutable as $$
  select coalesce(jsonb_agg(to_jsonb(left(trim(n), 40))), '[]'::jsonb)
  from (select n from jsonb_array_elements_text(case when jsonb_typeof(p) = 'array' then p else '[]'::jsonb end) n
        where trim(n) <> '' limit 60) s
$$;

create or replace function public.quiz_create(p_owner_token text, p_title text, p_questions jsonb, p_settings jsonb, p_names jsonb)
returns table(code text) language plpgsql security definer set search_path = public as $$
begin
  if length(coalesce(p_owner_token,'')) < 16 then raise exception 'bad_token'; end if;
  delete from public.quizzes where expires_at < now();  -- housekeeping: expired quizzes and their answers
  return query insert into public.quizzes(code, owner_token, title, settings, questions, names)
    values (quiz_short_code(), p_owner_token, left(coalesce(nullif(trim(p_title),''),'מבחן'), 80),
            quiz_clean_settings(p_settings), quiz_clean_questions(p_questions), quiz_clean_names(p_names))
    returning quizzes.code;
end; $$;

-- Editing questions is only allowed before anyone submitted (scores would stop matching).
create or replace function public.quiz_update(p_code text, p_owner_token text, p_title text, p_questions jsonb, p_settings jsonb, p_names jsonb)
returns boolean language plpgsql security definer set search_path = public as $$
declare qz public.quizzes;
begin
  select * into qz from public.quizzes where quizzes.code = p_code and owner_token = p_owner_token and expires_at > now() for update;
  if not found then raise exception 'not_owner'; end if;
  if p_questions is not null and exists (select 1 from public.quiz_submissions where quiz_id = qz.id) then raise exception 'has_submissions'; end if;
  update public.quizzes set
    title = left(coalesce(nullif(trim(p_title),''), qz.title), 80),
    questions = case when p_questions is null then qz.questions else quiz_clean_questions(p_questions) end,
    settings = case when p_settings is null then qz.settings else quiz_clean_settings(p_settings) end,
    names = case when p_names is null then qz.names else quiz_clean_names(p_names) end
  where id = qz.id;
  return true;
end; $$;

create or replace function public.quiz_set_status(p_code text, p_owner_token text, p_status text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if p_status not in ('open','closed') then raise exception 'bad_status'; end if;
  update public.quizzes set status = p_status where code = p_code and owner_token = p_owner_token;
  if not found then raise exception 'not_owner'; end if;
  return true;
end; $$;

-- What a student sees: no correct answers.
create or replace function public.quiz_get_public(p_code text)
returns table(title text, settings jsonb, questions jsonb, names jsonb, status text) language sql security definer set search_path = public as $$
  select q.title, q.settings,
    (select coalesce(jsonb_agg(jsonb_build_object('id', e->>'id', 'q', e->>'q', 'options', e->'options') order by ord), '[]'::jsonb)
       from jsonb_array_elements(q.questions) with ordinality t(e, ord)),
    q.names, q.status
  from public.quizzes q where q.code = p_code and q.expires_at > now()
$$;

-- answers: { "<question id>": <option index> }. Graded here; returns the score only if the teacher allows it.
create or replace function public.quiz_submit(p_code text, p_device_id text, p_name text, p_answers jsonb)
returns table(score int, total int, shown boolean) language plpgsql security definer set search_path = public as $$
declare qz public.quizzes; s int := 0; t int; nm text := left(trim(coalesce(p_name,'')), 40); clean jsonb := '{}'::jsonb; e jsonb; a int;
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
  insert into public.quiz_submissions(quiz_id, student_name, device_id, answers, score, total)
    values (qz.id, nm, p_device_id, clean, s, t);
  return query select case when (qz.settings->>'showScore')::boolean then s else null end, t, coalesce((qz.settings->>'showScore')::boolean, true);
end; $$;

create or replace function public.quiz_results(p_code text, p_owner_token text)
returns table(title text, settings jsonb, questions jsonb, names jsonb, status text, created_at timestamptz, expires_at timestamptz, submissions jsonb)
language sql security definer set search_path = public as $$
  select q.title, q.settings, q.questions, q.names, q.status, q.created_at, q.expires_at,
    (select coalesce(jsonb_agg(jsonb_build_object('id', s.id, 'name', s.student_name, 'answers', s.answers, 'score', s.score, 'total', s.total, 'at', s.created_at) order by s.created_at), '[]'::jsonb)
       from public.quiz_submissions s where s.quiz_id = q.id)
  from public.quizzes q where q.code = p_code and q.owner_token = p_owner_token
$$;

create or replace function public.quiz_delete_submission(p_code text, p_owner_token text, p_submission_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  delete from public.quiz_submissions s using public.quizzes q
   where s.id = p_submission_id and s.quiz_id = q.id and q.code = p_code and q.owner_token = p_owner_token;
  if not found then raise exception 'not_owner'; end if;
  return true;
end; $$;

create or replace function public.quiz_delete(p_code text, p_owner_token text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  delete from public.quizzes where code = p_code and owner_token = p_owner_token;
  if not found then raise exception 'not_owner'; end if;
  return true;
end; $$;

revoke all on function public.quiz_short_code() from public, anon, authenticated;
grant execute on function public.quiz_create(text,text,jsonb,jsonb,jsonb) to anon, authenticated;
grant execute on function public.quiz_update(text,text,text,jsonb,jsonb,jsonb) to anon, authenticated;
grant execute on function public.quiz_set_status(text,text,text) to anon, authenticated;
grant execute on function public.quiz_get_public(text) to anon, authenticated;
grant execute on function public.quiz_submit(text,text,text,jsonb) to anon, authenticated;
grant execute on function public.quiz_results(text,text) to anon, authenticated;
grant execute on function public.quiz_delete_submission(text,text,uuid) to anon, authenticated;
grant execute on function public.quiz_delete(text,text) to anon, authenticated;
