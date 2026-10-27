-- "הכנו לפי בקשה": when the owner marks a request done, they add a public title and the page's path.
-- Visitors may read only those two fields (plus the age group and date) of done requests — never the
-- request text or email. Safe to run again.

alter table public.page_requests add column if not exists public_title text check (public_title is null or char_length(public_title) <= 120);
alter table public.page_requests add column if not exists result_path text check (result_path is null or result_path ~ '^/[a-z0-9/_-]{0,119}$');
alter table public.page_requests add column if not exists done_at timestamptz;

create or replace function public.page_requests_owner(p_from timestamptz, p_to timestamptz, p_limit int default 300)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id', r.id, 'request', r.request, 'audience', r.audience, 'email', r.email,
      'from_path', r.from_path, 'source', r.source, 'status', r.status, 'created_at', r.created_at,
      'public_title', r.public_title, 'result_path', r.result_path, 'done_at', r.done_at) order by r.created_at desc)
    from (select * from public.page_requests where created_at >= p_from and created_at < p_to order by created_at desc
      limit least(greatest(coalesce(p_limit, 300), 1), 1000)) r), '[]'::jsonb);
end;
$$;

create or replace function public.page_request_done(p_id bigint, p_title text, p_path text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_title text := nullif(left(btrim(coalesce(p_title, '')), 120), '');
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  if p_path is null or p_path !~ '^/[a-z0-9/_-]{0,119}$' then raise exception 'bad_path'; end if;
  if v_title is null then raise exception 'missing_title'; end if;
  update public.page_requests set status = 'done', public_title = v_title, result_path = p_path, done_at = coalesce(done_at, now()) where id = p_id;
end;
$$;

create or replace function public.page_requests_done_public(p_limit int default 6)
returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('title', d.public_title, 'path', d.result_path, 'audience', d.audience, 'done_at', d.done_at) order by d.done_at desc), '[]'::jsonb)
  from (select public_title, result_path, audience, done_at from public.page_requests
    where status = 'done' and public_title is not null and result_path is not null
    order by done_at desc nulls last limit least(greatest(coalesce(p_limit, 6), 1), 24)) d;
$$;

revoke all on function public.page_requests_owner(timestamptz,timestamptz,int) from public, anon, authenticated;
revoke all on function public.page_request_done(bigint,text,text) from public, anon, authenticated;
revoke all on function public.page_requests_done_public(int) from public, anon, authenticated;
grant execute on function public.page_requests_owner(timestamptz,timestamptz,int) to authenticated;
grant execute on function public.page_request_done(bigint,text,text) to authenticated;
grant execute on function public.page_requests_done_public(int) to anon, authenticated;
