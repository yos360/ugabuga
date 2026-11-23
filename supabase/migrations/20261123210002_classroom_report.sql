-- Google Classroom share channel, step 3 of 3: owner-only report of Classroom shares and visits. Safe to run twice.
-- (Re-applied 23.11.2026 after the combined file failed.)
-- Owner only: shares to Classroom and visits that came from Classroom, with the top pages.
create or replace function public.owner_classroom_report(p_from timestamptz, p_to timestamptz)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  return (
    select jsonb_build_object(
      'shares', (select count(*) from public.owner_site_activity
                 where created_at >= p_from and created_at < p_to and action = 'share' and channel = 'classroom'),
      'visits', (select count(distinct coalesce(visitor::text, id::text)) from public.owner_site_activity
                 where created_at >= p_from and created_at < p_to and action = 'open' and source = 'classroom'),
      'top', coalesce((select jsonb_agg(jsonb_build_object('path', t.path, 'shares', t.shares, 'visits', t.visits) order by t.shares + t.visits desc, t.path)
        from (select coalesce(path, '') as path,
                     count(*) filter (where action = 'share') as shares,
                     count(*) filter (where action = 'open') as visits
              from public.owner_site_activity
              where created_at >= p_from and created_at < p_to
                and ((action = 'share' and channel = 'classroom') or (action = 'open' and source = 'classroom'))
              group by coalesce(path, '')
              order by count(*) desc
              limit 15) t), '[]'::jsonb));
end;
$$;
revoke all on function public.owner_classroom_report(timestamptz, timestamptz) from public, anon;
grant execute on function public.owner_classroom_report(timestamptz, timestamptz) to authenticated;
notify pgrst, 'reload schema';
