-- Hourly page-requests task: a cheap "anything new?" check before it opens the encrypted inbox.
-- Returns only a number (no request text, no emails). Safe to run again.
create or replace function public.page_requests_new_count()
returns int language sql stable security definer set search_path = '' as $$
  select count(*)::int from public.page_requests where status = 'new'
$$;

grant execute on function public.page_requests_new_count() to anon, authenticated;
