-- Today's printed sheets (Israel day) + the paths of the latest prints, for the home page counter
-- and the live banner. Same counting as public_total_printed_sheets: print dialogs + PDF exports.
create or replace function public.public_today_prints()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with day as (
    select (date_trunc('day', now() at time zone 'Asia/Jerusalem') at time zone 'Asia/Jerusalem') as start
  )
  select jsonb_build_object(
    'today', (
      select coalesce(sum(coalesce(a.pages, 1)), 0)::bigint
      from public.owner_site_activity a, day
      where a.action in ('print', 'download') and a.created_at >= day.start
    ),
    'recent', coalesce((
      select jsonb_agg(r.path)
      from (
        select a.path
        from public.owner_site_activity a
        where a.action in ('print', 'download') and a.created_at >= now() - interval '2 days' and a.path like '/%'
        order by a.created_at desc
        limit 40
      ) r
    ), '[]'::jsonb)
  );
$$;

revoke all on function public.public_today_prints() from public;
grant execute on function public.public_today_prints() to anon, authenticated;

notify pgrst, 'reload schema';
