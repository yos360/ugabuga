-- BugaPedia AI answers: the bugapedia-answer Edge Function writes each answer here, so a question
-- asked again is served from the table instead of paying for a new model call, and the owner can
-- review what children were told. Only the server role reads or writes it.
create table if not exists public.bugapedia_answers (
  key text primary key,
  question text not null,
  subject text,
  answer text not null,
  confident boolean not null default true,
  sources jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists bugapedia_answers_created_at on public.bugapedia_answers(created_at desc);
alter table public.bugapedia_answers enable row level security;
revoke all on public.bugapedia_answers from public, anon, authenticated;
grant all on public.bugapedia_answers to service_role;

-- The Edge Function rate-limits with public.sg_limit (created by supabase/manual/shared_spaces.sql).
create table if not exists public.sg_limits (
  key text primary key,
  used bigint not null default 0,
  expires_at timestamptz not null
);
alter table public.sg_limits enable row level security;
revoke all on public.sg_limits from public, anon, authenticated;
grant all on public.sg_limits to service_role;
create or replace function public.sg_limit(p_key text, p_max bigint, p_amount bigint default 1, p_hours integer default 1)
returns void language plpgsql security invoker set search_path = '' as $$
declare n bigint;
begin
  insert into public.sg_limits(key, used, expires_at) values (p_key, p_amount, now() + make_interval(hours => p_hours))
  on conflict (key) do update set
    used = case when public.sg_limits.expires_at < now() then p_amount else public.sg_limits.used + p_amount end,
    expires_at = case when public.sg_limits.expires_at < now() then now() + make_interval(hours => p_hours) else public.sg_limits.expires_at end
  returning used into n;
  if n > p_max then raise exception 'rate_limited'; end if;
end; $$;
revoke all on function public.sg_limit(text, bigint, bigint, integer) from public, anon, authenticated;
grant execute on function public.sg_limit(text, bigint, bigint, integer) to service_role;

-- Owner view of the latest AI answers (same owner check as bugapedia_owner_queries).
create or replace function public.bugapedia_owner_answers(p_limit int default 200)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('question', a.question, 'subject', a.subject, 'answer', a.answer, 'confident', a.confident, 'created_at', a.created_at) order by a.created_at desc)
    from (select * from public.bugapedia_answers order by created_at desc limit least(greatest(coalesce(p_limit, 200), 1), 1000)) a), '[]'::jsonb);
end;
$$;
revoke all on function public.bugapedia_owner_answers(int) from public, anon, authenticated;
grant execute on function public.bugapedia_owner_answers(int) to authenticated;
