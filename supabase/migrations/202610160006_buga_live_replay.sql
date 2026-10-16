-- Start a fresh round in an existing room. Player identities stay in the room,
-- while answers and scores are cleared and a validated question set replaces the old one.
create or replace function public.live_quiz_host_replay(
  p_code text,
  p_owner_token text,
  p_title text,
  p_questions jsonb,
  p_seconds int default 20
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  qz public.live_quizzes;
  clean jsonb;
  title_clean text;
  secs int := greatest(5, least(coalesce(p_seconds, 20), 60));
  player_count int;
  out_payload jsonb;
begin
  select * into qz
    from public.live_quizzes
    where code = upper(trim(p_code))
      and owner_token = p_owner_token
      and expires_at > now()
    for update;
  if not found then raise exception 'not_owner'; end if;
  if qz.phase <> 'finished' then raise exception 'bad_phase'; end if;

  clean := public.live_quiz_clean_questions(p_questions);
  title_clean := left(coalesce(nullif(trim(p_title), ''), 'Buga Live'), 80);
  select count(*) into player_count from public.live_quiz_players where quiz_id = qz.id;

  delete from public.live_quiz_answers where quiz_id = qz.id;
  update public.live_quiz_players set score = 0, streak = 0 where quiz_id = qz.id;
  update public.live_quizzes
    set title = title_clean,
        settings = jsonb_build_object('seconds', secs),
        questions = clean,
        phase = 'lobby',
        question_index = -1,
        question_started_at = null,
        question_ends_at = null,
        expires_at = now() + interval '7 days'
    where id = qz.id;

  out_payload := jsonb_build_object(
    'title', title_clean,
    'player_count', player_count,
    'total', jsonb_array_length(clean)
  );
  update public.live_quiz_public_states
    set phase = 'lobby',
        question_index = -1,
        ends_at = null,
        payload = out_payload,
        revision = revision + 1,
        updated_at = now(),
        expires_at = now() + interval '7 days'
    where code = qz.code;
  return out_payload;
end; $$;

revoke all on function public.live_quiz_host_replay(text,text,text,jsonb,int) from public, anon, authenticated;
grant execute on function public.live_quiz_host_replay(text,text,text,jsonb,int) to anon, authenticated;
