-- Real "visitors today" for the public live banner (replaces the invented 150–300 number).
-- Only one number leaves the database: how many different browsers opened a page since midnight
-- Israel time. 'open' events already skip bots and the owner; the anonymous visitor id lives for
-- one calendar day, so each browser counts once. Safe to run again.
create or replace function public.public_today_visitors()
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select count(distinct a.visitor)::bigint
  from public.owner_site_activity a
  where a.action = 'open'
    and a.visitor is not null
    and a.created_at >= (date_trunc('day', now() at time zone 'Asia/Jerusalem') at time zone 'Asia/Jerusalem');
$$;

revoke all on function public.public_today_visitors() from public;
grant execute on function public.public_today_visitors() to anon, authenticated;

notify pgrst, 'reload schema';
