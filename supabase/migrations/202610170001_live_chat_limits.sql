-- Abuse limits for Buga Live, the site chat and BugaPedia analytics, plus host "kick player".
-- Run manually in Supabase AFTER 202610160001..202610160006 (and 202610110001_group_tools.sql,
-- which provides gt_rate_check / gt_no_links). Safe to run more than once: every function is
-- `create or replace` with its original signature, and grants/revokes match the originals.
--
-- * live_quiz_create: per-client + global creation limit (bucket live_create).
-- * live_quiz_join: per-client + global join limit (bucket live_join); nicknames may not carry links.
-- * live_quiz_kick (new): the host removes a player (and their answers) with the host token.
-- * site_chat_start: per-client hourly limit (bucket chat_start), keeping the global per-minute cap.
-- * record_bugapedia_query: per-client per-minute limit (bucket bugapedia_q); over the limit the
--   question is silently dropped, as with the existing global cap.

create or replace function public.live_quiz_create(p_owner_token text, p_title text, p_questions jsonb, p_seconds int default 20)
returns table(code text) language plpgsql security definer set search_path = public as $$
declare c text; qid uuid; clean jsonb; secs int := greatest(5, least(coalesce(p_seconds,20),60)); title_clean text;
begin
  if length(coalesce(p_owner_token,'')) < 16 then raise exception 'bad_token'; end if;
  perform gt_rate_check('live_create', 15, 600);
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
  -- A whole class often shares one school IP, so the per-client cap is generous.
  perform gt_rate_check('live_join', 200, 3000);
  nm := gt_no_links(nm);
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

-- The host removes one player. Their answers go with them (on delete cascade); the public
-- player count is refreshed so every screen updates, and the removed phone falls back to the join form.
create or replace function public.live_quiz_kick(p_code text, p_host_token text, p_player_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare qz public.live_quizzes; player_count int;
begin
  select * into qz from public.live_quizzes where code=upper(trim(p_code)) and owner_token=p_host_token and expires_at>now() for update;
  if not found then raise exception 'not_owner'; end if;
  delete from public.live_quiz_answers where quiz_id=qz.id and player_id=p_player_id;
  delete from public.live_quiz_players where quiz_id=qz.id and id=p_player_id;
  if not found then raise exception 'player_not_found'; end if;
  select count(*) into player_count from public.live_quiz_players where quiz_id=qz.id;
  update public.live_quiz_public_states set payload=jsonb_set(payload,'{player_count}',to_jsonb(player_count)),revision=revision+1,updated_at=now() where code=qz.code;
  return jsonb_build_object('player_count',player_count);
end; $$;

revoke all on function public.live_quiz_create(text,text,jsonb,int) from public, anon, authenticated;
revoke all on function public.live_quiz_join(text,text,text) from public, anon, authenticated;
revoke all on function public.live_quiz_kick(text,text,uuid) from public, anon, authenticated;
grant execute on function public.live_quiz_create(text,text,jsonb,int) to anon, authenticated;
grant execute on function public.live_quiz_join(text,text,text) to anon, authenticated;
grant execute on function public.live_quiz_kick(text,text,uuid) to anon, authenticated;

create or replace function public.site_chat_start(
  p_token uuid, p_name text, p_contact text, p_topic text, p_body text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
  v_body text := btrim(coalesce(p_body, ''));
  v_topic text := btrim(coalesce(p_topic, ''));
begin
  if p_token is null or char_length(v_body) < 2 then raise exception 'message_required'; end if;
  if char_length(v_body) > 1500 or char_length(v_topic) not between 2 and 80 then raise exception 'message_required'; end if;
  if (select count(*) from (select 1 from public.site_chat_threads where created_at > now() - interval '1 minute' limit 80) q) >= 80 then
    raise exception 'rate_limited';
  end if;
  perform public.gt_rate_check('chat_start', 5, 80, interval '1 hour');
  insert into public.site_chat_threads(public_token, name, contact, topic)
  values (p_token, nullif(left(btrim(coalesce(p_name, '')), 60), ''), nullif(left(btrim(coalesce(p_contact, '')), 160), ''), v_topic)
  on conflict (public_token) do nothing returning id into v_id;
  if v_id is null then raise exception 'rate_limited'; end if;
  insert into public.site_chat_messages(thread_id, sender, body) values (v_id, 'visitor', v_body);
  return public.site_chat_payload(v_id);
end;
$$;

revoke all on function public.site_chat_start(uuid, text, text, text, text) from public;
grant execute on function public.site_chat_start(uuid, text, text, text, text) to anon, authenticated;

create or replace function public.record_bugapedia_query(p_question text, p_subject text default null, p_found boolean default false, p_result_title text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare v_question text := btrim(regexp_replace(coalesce(p_question, ''), '\s+', ' ', 'g'));
begin
  if char_length(v_question) not between 2 and 180 then return; end if;
  if (select count(*) from (select 1 from public.bugapedia_queries where created_at > now() - interval '1 minute' limit 300) q) >= 300 then return; end if;
  begin
    perform public.gt_rate_check('bugapedia_q', 60, 300, interval '1 minute');
  exception when others then
    if sqlerrm = 'rate_limited' then return; end if;
    raise;
  end;
  delete from public.bugapedia_queries where created_at < now() - interval '400 days';
  insert into public.bugapedia_queries(question, subject, found, result_title)
  values (v_question, nullif(left(btrim(coalesce(p_subject, '')), 60), ''), coalesce(p_found, false), nullif(left(btrim(coalesce(p_result_title, '')), 200), ''));
end;
$$;

revoke all on function public.record_bugapedia_query(text,text,boolean,text) from public, anon, authenticated;
grant execute on function public.record_bugapedia_query(text,text,boolean,text) to anon, authenticated;
