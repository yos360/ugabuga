-- Owner tools: delete a site-chat conversation or one message from it, and see the written answer a
-- BugaPedia question received. Owner only (same e-mail check as the rest of the owner report).
-- Safe to run twice. Applied automatically by .github/workflows/apply-migrations.yml.

create or replace function public.site_chat_owner_delete(p_thread_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  delete from public.site_chat_threads where id = p_thread_id; -- messages go with it (on delete cascade)
  if not found then raise exception 'chat_not_found'; end if;
end; $$;

create or replace function public.site_chat_owner_delete_message(p_message_id bigint)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_thread uuid;
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  delete from public.site_chat_messages where id = p_message_id returning thread_id into v_thread;
  if v_thread is null then raise exception 'chat_not_found'; end if;
  return public.site_chat_payload(v_thread);
end; $$;

revoke all on function public.site_chat_owner_delete(uuid) from public, anon, authenticated;
revoke all on function public.site_chat_owner_delete_message(bigint) from public, anon, authenticated;
grant execute on function public.site_chat_owner_delete(uuid) to authenticated;
grant execute on function public.site_chat_owner_delete_message(bigint) to authenticated;

-- Each question now carries the written answer that was shown for it (when there was one): the
-- bugapedia-answer function stores answers by question and subject, so they are matched the same way.
create or replace function public.bugapedia_owner_queries(p_from timestamptz, p_to timestamptz, p_limit int default 300)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id', q.id, 'question', q.question, 'subject', q.subject, 'found', q.found, 'result_title', q.result_title, 'created_at', q.created_at,
      'answer', a.answer, 'confident', a.confident, 'sources', a.sources) order by q.created_at desc)
    from (select * from public.bugapedia_queries where created_at >= p_from and created_at < p_to order by created_at desc limit least(greatest(coalesce(p_limit, 300), 1), 1000)) q
    left join lateral (
      select b.answer, b.confident, b.sources from public.bugapedia_answers b
      where coalesce(b.subject, '') = coalesce(q.subject, '')
        and regexp_replace(lower(b.question), '[?!.,״"׳''\s]', '', 'g') = regexp_replace(lower(q.question), '[?!.,״"׳''\s]', '', 'g')
      order by b.created_at desc limit 1
    ) a on true), '[]'::jsonb);
end;
$$;
revoke all on function public.bugapedia_owner_queries(timestamptz,timestamptz,int) from public, anon, authenticated;
grant execute on function public.bugapedia_owner_queries(timestamptz,timestamptz,int) to authenticated;
