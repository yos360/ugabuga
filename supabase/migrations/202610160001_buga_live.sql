-- Buga Live: a host-led realtime quiz for up to 100 players.
-- Private questions and correct answers stay behind SECURITY DEFINER RPCs.
-- The only realtime table contains the safe, public state shown on player screens.

create table if not exists public.live_quizzes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  owner_token text not null,
  title text not null,
  settings jsonb not null default '{"seconds":20}'::jsonb,
  questions jsonb not null,
  phase text not null default 'lobby' check (phase in ('lobby','question','reveal','finished')),
  question_index int not null default -1,
  question_started_at timestamptz,
  question_ends_at timestamptz,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days'
);

create table if not exists public.live_quiz_players (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.live_quizzes(id) on delete cascade,
  player_token text not null,
  nickname text not null,
  score int not null default 0,
  streak int not null default 0,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (quiz_id, player_token)
);
create unique index if not exists live_quiz_player_name_uq on public.live_quiz_players (quiz_id, lower(nickname));

create table if not exists public.live_quiz_answers (
  quiz_id uuid not null references public.live_quizzes(id) on delete cascade,
  question_index int not null,
  player_id uuid not null references public.live_quiz_players(id) on delete cascade,
  option_index int not null,
  is_correct boolean not null,
  points int not null,
  response_ms int not null,
  answered_at timestamptz not null default now(),
  primary key (quiz_id, question_index, player_id)
);
create index if not exists live_quiz_answers_player_idx on public.live_quiz_answers (player_id);

create table if not exists public.live_quiz_public_states (
  code text primary key references public.live_quizzes(code) on delete cascade,
  phase text not null,
  question_index int not null default -1,
  ends_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  revision bigint not null default 0,
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null
);

alter table public.live_quizzes enable row level security;
alter table public.live_quiz_players enable row level security;
alter table public.live_quiz_answers enable row level security;
alter table public.live_quiz_public_states enable row level security;
revoke all on public.live_quizzes, public.live_quiz_players, public.live_quiz_answers from anon, authenticated;
revoke all on public.live_quiz_public_states from anon, authenticated;
grant select on public.live_quiz_public_states to anon, authenticated;
drop policy if exists live_quiz_public_state_read on public.live_quiz_public_states;
create policy live_quiz_public_state_read on public.live_quiz_public_states for select to anon, authenticated
  using (expires_at > now());

do $$ begin
  if not exists (
    select 1 from pg_publication_tables where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'live_quiz_public_states'
  ) then alter publication supabase_realtime add table public.live_quiz_public_states; end if;
end $$;

create or replace function public.live_quiz_short_code()
returns text language plpgsql volatile set search_path = public as $$
declare alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; c text; tries int := 0;
begin
  loop
    c := '';
    for i in 1..6 loop c := c || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1); end loop;
    exit when not exists (select 1 from public.live_quizzes where code = c and expires_at > now());
    tries := tries + 1; if tries > 40 then raise exception 'code_space_exhausted'; end if;
  end loop;
  return c;
end; $$;

create or replace function public.live_quiz_clean_questions(p jsonb)
returns jsonb language plpgsql immutable set search_path = public as $$
declare out jsonb := '[]'::jsonb; e jsonb; o jsonb; opts jsonb; clean_opts jsonb; correct_index int; n int := 0;
begin
  if p is null or jsonb_typeof(p) <> 'array' or jsonb_array_length(p) < 1 or jsonb_array_length(p) > 50 then raise exception 'bad_questions'; end if;
  for e in select * from jsonb_array_elements(p) loop
    n := n + 1;
    if trim(coalesce(e->>'q','')) = '' then raise exception 'empty_question'; end if;
    opts := e->'options';
    if opts is null or jsonb_typeof(opts) <> 'array' or jsonb_array_length(opts) < 2 or jsonb_array_length(opts) > 4 then raise exception 'bad_options'; end if;
    clean_opts := '[]'::jsonb;
    for o in select * from jsonb_array_elements(opts) loop
      if trim(coalesce(o #>> '{}','')) = '' then raise exception 'empty_option'; end if;
      clean_opts := clean_opts || to_jsonb(left(trim(o #>> '{}'), 120));
    end loop;
    correct_index := coalesce((e->>'correct')::int, -1);
    if correct_index < 0 or correct_index >= jsonb_array_length(clean_opts) then raise exception 'bad_correct'; end if;
    out := out || jsonb_build_object('id', left(coalesce(nullif(e->>'id',''),'q'||n),24), 'q', left(trim(e->>'q'),240), 'options', clean_opts, 'correct', correct_index);
  end loop;
  return out;
end; $$;

create or replace function public.live_quiz_leaderboard(p_quiz_id uuid, p_limit int default 10)
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('name', nickname, 'score', score, 'rank', rank) order by rank, joined_at), '[]'::jsonb)
  from (select nickname, score, joined_at, rank() over (order by score desc, joined_at) rank
        from public.live_quiz_players where quiz_id = p_quiz_id order by score desc, joined_at limit greatest(1, least(p_limit,100))) s
$$;

create or replace function public.live_quiz_create(p_owner_token text, p_title text, p_questions jsonb, p_seconds int default 20)
returns table(code text) language plpgsql security definer set search_path = public as $$
declare c text; qid uuid; clean jsonb; secs int := greatest(5, least(coalesce(p_seconds,20),60)); title_clean text;
begin
  if length(coalesce(p_owner_token,'')) < 16 then raise exception 'bad_token'; end if;
  clean := public.live_quiz_clean_questions(p_questions);
  title_clean := left(coalesce(nullif(trim(p_title),''),'החידון הגדול'),80);
  delete from public.live_quizzes where expires_at < now();
  c := public.live_quiz_short_code();
  insert into public.live_quizzes(code, owner_token, title, settings, questions)
    values(c, p_owner_token, title_clean, jsonb_build_object('seconds',secs), clean) returning id into qid;
  insert into public.live_quiz_public_states(code, phase, payload, expires_at)
    values(c, 'lobby', jsonb_build_object('title',title_clean,'player_count',0,'total',jsonb_array_length(clean)), now()+interval '7 days');
  return query select c;
end; $$;

create or replace function public.live_quiz_join(p_code text, p_player_token text, p_nickname text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare qz public.live_quizzes; player public.live_quiz_players; nm text := left(trim(coalesce(p_nickname,'')),24); player_count int;
begin
  select * into qz from public.live_quizzes where code = upper(trim(p_code)) and expires_at > now() for update;
  if not found then raise exception 'game_not_found'; end if;
  if qz.phase = 'finished' then raise exception 'game_finished'; end if;
  if length(coalesce(p_player_token,'')) < 16 then raise exception 'bad_token'; end if;
  if nm = '' then raise exception 'name_required'; end if;
  select * into player from public.live_quiz_players where quiz_id=qz.id and player_token=p_player_token;
  if found then
    update public.live_quiz_players set last_seen_at=now() where id=player.id returning * into player;
  else
    if qz.phase <> 'lobby' then raise exception 'game_started'; end if;
    if (select count(*) from public.live_quiz_players where quiz_id=qz.id) >= 100 then raise exception 'game_full'; end if;
    if exists(select 1 from public.live_quiz_players where quiz_id=qz.id and lower(nickname)=lower(nm)) then raise exception 'name_taken'; end if;
    insert into public.live_quiz_players(quiz_id,player_token,nickname) values(qz.id,p_player_token,nm) returning * into player;
    select count(*) into player_count from public.live_quiz_players where quiz_id=qz.id;
    update public.live_quiz_public_states set payload=jsonb_set(payload,'{player_count}',to_jsonb(player_count)),revision=revision+1,updated_at=now() where code=qz.code;
  end if;
  return jsonb_build_object('name',player.nickname,'score',player.score,'phase',qz.phase);
exception when unique_violation then raise exception 'name_taken';
end; $$;

create or replace function public.live_quiz_host_state(p_code text, p_owner_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare qz public.live_quizzes; players jsonb; answer_count int; counts jsonb := '[]'::jsonb; q jsonb;
begin
  select * into qz from public.live_quizzes where code=upper(trim(p_code)) and owner_token=p_owner_token and expires_at>now();
  if not found then raise exception 'not_owner'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('id',id,'name',nickname,'score',score,'streak',streak,'answered',exists(
    select 1 from public.live_quiz_answers a where a.player_id=p.id and a.question_index=qz.question_index)) order by joined_at),'[]'::jsonb)
    into players from public.live_quiz_players p where quiz_id=qz.id;
  select count(*) into answer_count from public.live_quiz_answers where quiz_id=qz.id and question_index=qz.question_index;
  if qz.question_index >= 0 then
    q := qz.questions->qz.question_index;
    select coalesce(jsonb_agg((select count(*) from public.live_quiz_answers a where a.quiz_id=qz.id and a.question_index=qz.question_index and a.option_index=i) order by i),'[]'::jsonb)
      into counts from generate_series(0,jsonb_array_length(q->'options')-1) i;
  end if;
  return jsonb_build_object('code',qz.code,'title',qz.title,'settings',qz.settings,'questions',qz.questions,'phase',qz.phase,
    'question_index',qz.question_index,'started_at',qz.question_started_at,'ends_at',qz.question_ends_at,'players',players,
    'answer_count',answer_count,'counts',counts,'leaderboard',public.live_quiz_leaderboard(qz.id,100),'expires_at',qz.expires_at);
end; $$;

create or replace function public.live_quiz_player_state(p_code text, p_player_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare qz public.live_quizzes; p public.live_quiz_players; a public.live_quiz_answers; r int;
begin
  select * into qz from public.live_quizzes where code=upper(trim(p_code)) and expires_at>now();
  if not found then raise exception 'game_not_found'; end if;
  select * into p from public.live_quiz_players where quiz_id=qz.id and player_token=p_player_token;
  if not found then return null; end if;
  select * into a from public.live_quiz_answers where quiz_id=qz.id and player_id=p.id and question_index=qz.question_index;
  select count(*)+1 into r from public.live_quiz_players where quiz_id=qz.id and (score>p.score or (score=p.score and joined_at<p.joined_at));
  update public.live_quiz_players set last_seen_at=now() where id=p.id;
  return jsonb_build_object('name',p.nickname,'score',p.score,'streak',p.streak,'rank',r,'answered',a.player_id is not null,
    'option',case when a.player_id is null then null else a.option_index end,'correct',case when a.player_id is null then null else a.is_correct end,
    'points',case when a.player_id is null then null else a.points end);
end; $$;

create or replace function public.live_quiz_answer(p_code text, p_player_token text, p_question_index int, p_option_index int)
returns jsonb language plpgsql security definer set search_path = public as $$
declare qz public.live_quizzes; p public.live_quiz_players; q jsonb; correct boolean; earned int; elapsed int; seconds int;
begin
  select * into qz from public.live_quizzes where code=upper(trim(p_code)) and expires_at>now() for update;
  if not found then raise exception 'game_not_found'; end if;
  if qz.phase <> 'question' or qz.question_index <> p_question_index then raise exception 'question_closed'; end if;
  if now() > qz.question_ends_at + interval '2 seconds' then raise exception 'question_closed'; end if;
  select * into p from public.live_quiz_players where quiz_id=qz.id and player_token=p_player_token for update;
  if not found then raise exception 'player_not_found'; end if;
  q := qz.questions->qz.question_index;
  if p_option_index < 0 or p_option_index >= jsonb_array_length(q->'options') then raise exception 'bad_option'; end if;
  if exists(select 1 from public.live_quiz_answers where quiz_id=qz.id and question_index=qz.question_index and player_id=p.id) then raise exception 'already_answered'; end if;
  correct := p_option_index=(q->>'correct')::int;
  seconds := greatest(1,(qz.settings->>'seconds')::int);
  elapsed := greatest(0,least(seconds*1000,extract(epoch from (now()-qz.question_started_at))*1000))::int;
  earned := case when correct then round(500+500*(1-elapsed::numeric/(seconds*1000)))::int else 0 end;
  insert into public.live_quiz_answers(quiz_id,question_index,player_id,option_index,is_correct,points,response_ms)
    values(qz.id,qz.question_index,p.id,p_option_index,correct,earned,elapsed);
  update public.live_quiz_players set score=score+earned,streak=case when correct then streak+1 else 0 end,last_seen_at=now() where id=p.id;
  return jsonb_build_object('accepted',true);
end; $$;

create or replace function public.live_quiz_host_action(p_code text, p_owner_token text, p_action text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare qz public.live_quizzes; idx int; q jsonb; secs int; counts jsonb; out_payload jsonb; player_count int;
begin
  select * into qz from public.live_quizzes where code=upper(trim(p_code)) and owner_token=p_owner_token and expires_at>now() for update;
  if not found then raise exception 'not_owner'; end if;
  select count(*) into player_count from public.live_quiz_players where quiz_id=qz.id;
  if p_action in ('start','next') then
    if not ((p_action='start' and qz.phase='lobby') or (p_action='next' and qz.phase='reveal')) then raise exception 'bad_phase'; end if;
    idx := case when qz.phase='lobby' then 0 else qz.question_index+1 end;
    if idx >= jsonb_array_length(qz.questions) then p_action := 'finish';
    else
      q := qz.questions->idx; secs := greatest(5,least((qz.settings->>'seconds')::int,60));
      update public.live_quizzes set phase='question',question_index=idx,question_started_at=now(),question_ends_at=now()+make_interval(secs=>secs) where id=qz.id;
      out_payload := jsonb_build_object('title',qz.title,'question',q-'correct','index',idx+1,'total',jsonb_array_length(qz.questions),'seconds',secs,'player_count',player_count);
      update public.live_quiz_public_states set phase='question',question_index=idx,ends_at=now()+make_interval(secs=>secs),payload=out_payload,revision=revision+1,updated_at=now() where code=qz.code;
      return out_payload;
    end if;
  end if;
  if p_action='reveal' then
    if qz.phase<>'question' then raise exception 'bad_phase'; end if;
    q := qz.questions->qz.question_index;
    select coalesce(jsonb_agg((select count(*) from public.live_quiz_answers a where a.quiz_id=qz.id and a.question_index=qz.question_index and a.option_index=i) order by i),'[]'::jsonb)
      into counts from generate_series(0,jsonb_array_length(q->'options')-1) i;
    out_payload := jsonb_build_object('title',qz.title,'question',q-'correct','correct',(q->>'correct')::int,'counts',counts,'index',qz.question_index+1,
      'total',jsonb_array_length(qz.questions),'leaderboard',public.live_quiz_leaderboard(qz.id,10),'player_count',player_count);
    update public.live_quizzes set phase='reveal',question_ends_at=null where id=qz.id;
    update public.live_quiz_public_states set phase='reveal',ends_at=null,payload=out_payload,revision=revision+1,updated_at=now() where code=qz.code;
    return out_payload;
  end if;
  if p_action='finish' then
    if qz.phase not in ('reveal','question') then raise exception 'bad_phase'; end if;
    out_payload := jsonb_build_object('title',qz.title,'leaderboard',public.live_quiz_leaderboard(qz.id,100),'player_count',player_count);
    update public.live_quizzes set phase='finished',question_ends_at=null where id=qz.id;
    update public.live_quiz_public_states set phase='finished',ends_at=null,payload=out_payload,revision=revision+1,updated_at=now() where code=qz.code;
    return out_payload;
  end if;
  if p_action='reset' then
    if qz.phase<>'finished' then raise exception 'bad_phase'; end if;
    delete from public.live_quiz_answers where quiz_id=qz.id;
    update public.live_quiz_players set score=0,streak=0 where quiz_id=qz.id;
    update public.live_quizzes set phase='lobby',question_index=-1,question_started_at=null,question_ends_at=null where id=qz.id;
    out_payload := jsonb_build_object('title',qz.title,'player_count',player_count,'total',jsonb_array_length(qz.questions));
    update public.live_quiz_public_states set phase='lobby',question_index=-1,ends_at=null,payload=out_payload,revision=revision+1,updated_at=now() where code=qz.code;
    return out_payload;
  end if;
  raise exception 'bad_action';
end; $$;

revoke all on function public.live_quiz_short_code() from public, anon, authenticated;
revoke all on function public.live_quiz_clean_questions(jsonb) from public, anon, authenticated;
revoke all on function public.live_quiz_leaderboard(uuid,int) from public, anon, authenticated;
revoke all on function public.live_quiz_create(text,text,jsonb,int) from public, anon, authenticated;
revoke all on function public.live_quiz_join(text,text,text) from public, anon, authenticated;
revoke all on function public.live_quiz_host_state(text,text) from public, anon, authenticated;
revoke all on function public.live_quiz_player_state(text,text) from public, anon, authenticated;
revoke all on function public.live_quiz_answer(text,text,int,int) from public, anon, authenticated;
revoke all on function public.live_quiz_host_action(text,text,text) from public, anon, authenticated;
grant execute on function public.live_quiz_create(text,text,jsonb,int) to anon, authenticated;
grant execute on function public.live_quiz_join(text,text,text) to anon, authenticated;
grant execute on function public.live_quiz_host_state(text,text) to anon, authenticated;
grant execute on function public.live_quiz_player_state(text,text) to anon, authenticated;
grant execute on function public.live_quiz_answer(text,text,int,int) to anon, authenticated;
grant execute on function public.live_quiz_host_action(text,text,text) to anon, authenticated;
