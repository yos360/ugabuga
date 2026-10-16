-- Private BugaPedia question analytics. Visitors may insert only through the narrow RPC;
-- direct table access is blocked. Only the authenticated site owner may read the list.
create table if not exists public.bugapedia_queries (
  id bigint generated always as identity primary key,
  question text not null check (char_length(question) between 2 and 180),
  subject text check (subject is null or char_length(subject) <= 60),
  found boolean not null,
  result_title text check (result_title is null or char_length(result_title) <= 200),
  created_at timestamptz not null default now()
);
create index if not exists bugapedia_queries_created_at on public.bugapedia_queries(created_at desc);
alter table public.bugapedia_queries enable row level security;
revoke all on table public.bugapedia_queries from anon, authenticated;
revoke all on sequence public.bugapedia_queries_id_seq from anon, authenticated;

create or replace function public.record_bugapedia_query(p_question text, p_subject text default null, p_found boolean default false, p_result_title text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare v_question text := btrim(regexp_replace(coalesce(p_question, ''), '\s+', ' ', 'g'));
begin
  if char_length(v_question) not between 2 and 180 then return; end if;
  if (select count(*) from (select 1 from public.bugapedia_queries where created_at > now() - interval '1 minute' limit 300) q) >= 300 then return; end if;
  delete from public.bugapedia_queries where created_at < now() - interval '400 days';
  insert into public.bugapedia_queries(question, subject, found, result_title)
  values (v_question, nullif(left(btrim(coalesce(p_subject, '')), 60), ''), coalesce(p_found, false), nullif(left(btrim(coalesce(p_result_title, '')), 200), ''));
end;
$$;

create or replace function public.bugapedia_owner_queries(p_from timestamptz, p_to timestamptz, p_limit int default 300)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id', q.id, 'question', q.question, 'subject', q.subject, 'found', q.found, 'result_title', q.result_title, 'created_at', q.created_at) order by q.created_at desc)
    from (select * from public.bugapedia_queries where created_at >= p_from and created_at < p_to order by created_at desc limit least(greatest(coalesce(p_limit, 300), 1), 1000)) q), '[]'::jsonb);
end;
$$;
revoke all on function public.record_bugapedia_query(text,text,boolean,text) from public, anon, authenticated;
revoke all on function public.bugapedia_owner_queries(timestamptz,timestamptz,int) from public, anon, authenticated;
grant execute on function public.record_bugapedia_query(text,text,boolean,text) to anon, authenticated;
grant execute on function public.bugapedia_owner_queries(timestamptz,timestamptz,int) to authenticated;
