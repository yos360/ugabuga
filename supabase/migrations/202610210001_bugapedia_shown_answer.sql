-- BugaPedia: keep what the visitor actually saw for each question — the written answer, or the
-- encyclopedia excerpt when the question got a ready article ("איך מחברים שברים" → "חיבור שברים").
-- The owner report shows it; older rows keep the answer matched from bugapedia_answers.
-- Safe to run twice. Applied automatically by .github/workflows/apply-migrations.yml.

alter table public.bugapedia_queries add column if not exists shown_text text;
alter table public.bugapedia_queries add column if not exists shown_url text;
alter table public.bugapedia_queries add column if not exists shown_written boolean;
alter table public.bugapedia_queries drop constraint if exists bugapedia_queries_shown_text_len;
alter table public.bugapedia_queries add constraint bugapedia_queries_shown_text_len check (shown_text is null or char_length(shown_text) <= 2000);
alter table public.bugapedia_queries drop constraint if exists bugapedia_queries_shown_url_len;
alter table public.bugapedia_queries add constraint bugapedia_queries_shown_url_len check (shown_url is null or char_length(shown_url) <= 300);

-- One function with the new optional arguments (an overload would make PostgREST calls ambiguous).
drop function if exists public.record_bugapedia_query(text, text, boolean, text);
create or replace function public.record_bugapedia_query(p_question text, p_subject text default null, p_found boolean default false, p_result_title text default null,
  p_shown_text text default null, p_shown_url text default null, p_shown_written boolean default null)
returns void language plpgsql security definer set search_path = '' as $$
declare v_question text := btrim(regexp_replace(coalesce(p_question, ''), '\s+', ' ', 'g'));
  v_url text := btrim(coalesce(p_shown_url, ''));
begin
  if char_length(v_question) not between 2 and 180 then return; end if;
  if (select count(*) from (select 1 from public.bugapedia_queries where created_at > now() - interval '1 minute' limit 300) q) >= 300 then return; end if;
  begin
    perform public.gt_rate_check('bugapedia_q', 60, 300, interval '1 minute');
  exception when others then
    if sqlerrm = 'rate_limited' then return; end if;
    raise;
  end;
  if v_url !~* '^https://[^\s<>"]+$' or char_length(v_url) > 300 then v_url := null; end if;
  delete from public.bugapedia_queries where created_at < now() - interval '400 days';
  insert into public.bugapedia_queries(question, subject, found, result_title, shown_text, shown_url, shown_written)
  values (v_question, nullif(left(btrim(coalesce(p_subject, '')), 60), ''), coalesce(p_found, false), nullif(left(btrim(coalesce(p_result_title, '')), 200), ''),
    nullif(left(btrim(coalesce(p_shown_text, '')), 2000), ''), v_url, p_shown_written);
end;
$$;

revoke all on function public.record_bugapedia_query(text,text,boolean,text,text,text,boolean) from public, anon, authenticated;
grant execute on function public.record_bugapedia_query(text,text,boolean,text,text,text,boolean) to anon, authenticated;

create or replace function public.bugapedia_owner_queries(p_from timestamptz, p_to timestamptz, p_limit int default 300)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id', q.id, 'question', q.question, 'subject', q.subject, 'found', q.found, 'result_title', q.result_title, 'created_at', q.created_at,
      'shown_text', q.shown_text, 'shown_url', q.shown_url, 'shown_written', q.shown_written,
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

notify pgrst, 'reload schema';
