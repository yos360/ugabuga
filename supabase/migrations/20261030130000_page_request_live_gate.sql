-- Nothing about a request goes public before its page is on the live site. A request can be marked done
-- (by the requests task) while Cloudflare is still building, and the site answers 200 for every path, so the
-- mail scheduler (functions/api/mail.js, every 10 minutes) sets live_at only once the deployed sitemap lists
-- the page. "הכנו לפי בקשה", the "page ready" mail and the Facebook post all wait for live_at.
-- announced_at: one Facebook post per request, at most one every 30 minutes. Safe to run again.
alter table public.page_requests add column if not exists live_at timestamptz;
alter table public.page_requests add column if not exists announced_at timestamptz;
-- Requests finished before this gate were checked by hand; they are live and not posted again.
update public.page_requests set live_at = done_at
  where status = 'done' and live_at is null and done_at < timestamptz '2026-10-30 12:00+00';
update public.page_requests set announced_at = done_at
  where status = 'done' and announced_at is null and done_at < timestamptz '2026-10-30 12:00+00';

create or replace function public.page_request_mail(p_action text, p jsonb default '{}') returns jsonb
language plpgsql security invoker set search_path = public as $$
begin
  if p_action = 'unverified' then
    return coalesce((select jsonb_agg(jsonb_build_object('id', r.id, 'result_path', r.result_path) order by r.id)
      from (select id, result_path from public.page_requests
        where status = 'done' and result_path is not null and live_at is null and done_at > now() - interval '14 days'
        order by id limit 50) r), '[]'::jsonb);
  elsif p_action = 'live' then
    update public.page_requests set live_at = now() where id = (p ->> 'id')::bigint and live_at is null;
    return to_jsonb(found);
  elsif p_action = 'due' then
    return coalesce((select jsonb_agg(jsonb_build_object('id', r.id, 'email', r.email, 'public_title', r.public_title,
        'result_path', r.result_path) order by r.id)
      from (select id, email, public_title, result_path from public.page_requests
        where status = 'done' and email is not null and mailed_at is null and public_title is not null
          and result_path is not null and live_at is not null and mail_attempts < 3 and done_at > now() - interval '14 days'
        order by id limit 5) r), '[]'::jsonb);
  elsif p_action = 'claim' then
    update public.page_requests set mailed_at = now(), mail_attempts = mail_attempts + 1
      where id = (p ->> 'id')::bigint and mailed_at is null and mail_attempts < 3;
    return to_jsonb(found);
  elsif p_action = 'release' then
    update public.page_requests set mailed_at = null where id = (p ->> 'id')::bigint;
    return 'true'::jsonb;
  elsif p_action = 'announce_next' then
    -- One post every 30 minutes, oldest live page first.
    if exists (select 1 from public.page_requests where announced_at > now() - interval '29 minutes') then return 'null'::jsonb; end if;
    return (select jsonb_build_object('id', id, 'public_title', public_title, 'result_path', result_path, 'audience', audience)
      from public.page_requests
      where status = 'done' and live_at is not null and announced_at is null and public_title is not null
        and done_at > now() - interval '7 days'
      order by live_at, id limit 1);
  elsif p_action = 'announce_claim' then
    update public.page_requests set announced_at = now() where id = (p ->> 'id')::bigint and announced_at is null;
    return to_jsonb(found);
  elsif p_action = 'announce_release' then
    update public.page_requests set announced_at = null where id = (p ->> 'id')::bigint;
    return 'true'::jsonb;
  end if;
  raise exception 'invalid_action';
end $$;

revoke all on function public.page_request_mail(text, jsonb) from public, anon, authenticated;
grant execute on function public.page_request_mail(text, jsonb) to service_role;

create or replace function public.page_requests_done_public(p_limit int default 6)
returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('title', d.public_title, 'path', d.result_path, 'audience', d.audience, 'done_at', d.done_at) order by d.done_at desc), '[]'::jsonb)
  from (select public_title, result_path, audience, done_at from public.page_requests
    where status = 'done' and public_title is not null and result_path is not null and live_at is not null
    order by done_at desc nulls last limit least(greatest(coalesce(p_limit, 6), 1), 24)) d;
$$;
-- The owner report shows whether each done request is live, mailed and posted.
create or replace function public.page_requests_owner(p_from timestamptz, p_to timestamptz, p_limit int default 300)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id', r.id, 'request', r.request, 'audience', r.audience, 'email', r.email,
      'from_path', r.from_path, 'source', r.source, 'status', r.status, 'created_at', r.created_at,
      'public_title', r.public_title, 'result_path', r.result_path, 'done_at', r.done_at,
      'live_at', r.live_at, 'mailed_at', r.mailed_at, 'announced_at', r.announced_at) order by r.created_at desc)
    from (select * from public.page_requests where created_at >= p_from and created_at < p_to order by created_at desc
      limit least(greatest(coalesce(p_limit, 300), 1), 1000)) r), '[]'::jsonb);
end;
$$;
revoke all on function public.page_requests_owner(timestamptz,timestamptz,int) from public, anon, authenticated;
grant execute on function public.page_requests_owner(timestamptz,timestamptz,int) to authenticated;

revoke all on function public.page_requests_done_public(int) from public, anon, authenticated;
grant execute on function public.page_requests_done_public(int) to anon, authenticated;
