-- /request/done lists everything made on request in one place, so the public list may return up to 300
-- rows (it was capped at 24). Same rules as before: only live pages, title + path + audience + date.
-- Safe to run again.
create or replace function public.page_requests_done_public(p_limit int default 6)
returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('title', d.public_title, 'path', d.result_path, 'audience', d.audience, 'done_at', d.done_at) order by d.done_at desc), '[]'::jsonb)
  from (select public_title, result_path, audience, done_at from public.page_requests
    where status = 'done' and public_title is not null and result_path is not null and live_at is not null
    order by done_at desc nulls last limit least(greatest(coalesce(p_limit, 6), 1), 300)) d;
$$;
revoke all on function public.page_requests_done_public(int) from public, anon, authenticated;
grant execute on function public.page_requests_done_public(int) to anon, authenticated;
