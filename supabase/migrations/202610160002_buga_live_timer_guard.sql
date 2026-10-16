-- Keep automatic timeout separate from the host's explicit reveal action.
-- A client may only trigger `timeout` after the authoritative database clock expires.
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
  if p_action in ('reveal','timeout') then
    if qz.phase<>'question' then raise exception 'bad_phase'; end if;
    if p_action='timeout' and (qz.question_ends_at is null or qz.question_ends_at>now()) then raise exception 'question_open'; end if;
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

