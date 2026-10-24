-- RSVP funnel for the owner report's headline cards (/admin/activity), for the report's period:
-- invitations created, guests who opened an invitation link (/r/<code>), answers received, and
-- guests who went on from the invitation to the two "before you go" cards (who was born on your
-- day, trick questions). Counts only — no names, answers or codes. Owner-only. Safe to run twice.
-- Applied automatically by .github/workflows/apply-migrations.yml.

create or replace function public.owner_rsvp_funnel(p_from timestamptz, p_to timestamptz)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  return (
    with a as (
      select visitor, path, action, created_at, (created_at at time zone 'Asia/Jerusalem')::date d
      from public.owner_site_activity
      where created_at >= p_from and created_at < p_to + interval '6 hours' and visitor is not null and action = 'open'
    ), r as (
      -- A guest: opened an invitation that day without having browsed the site before it.
      select r0.visitor, r0.d, r0.first_r from (
        select visitor, d, min(created_at) first_r from a
        where path like '/r/%' and created_at < p_to group by 1, 2
      ) r0
      where r0.first_r >= p_from
        and not exists (select 1 from a x where x.visitor = r0.visitor and x.d = r0.d and x.path not like '/r/%' and x.created_at < r0.first_r)
    )
    select jsonb_build_object(
      'events_created', (select count(*) from public.rsvp_events e where e.created_at >= p_from and e.created_at < p_to),
      'guests_opened', (select count(*) from r),
      'responses', (select count(*) from public.rsvp_responses x where x.created_at >= p_from and x.created_at < p_to),
      'to_birthday_famous', (select count(*) from r where exists (select 1 from a x where x.visitor = r.visitor and x.d = r.d and x.path = '/tools/birthday-famous' and x.created_at > r.first_r)),
      'to_trick_questions', (select count(*) from r where exists (select 1 from a x where x.visitor = r.visitor and x.d = r.d and x.path = '/trick-questions' and x.created_at > r.first_r)),
      'to_any_page', (select count(*) from r where exists (select 1 from a x where x.visitor = r.visitor and x.d = r.d and x.path not like '/r/%' and x.created_at > r.first_r))
    )
  );
end;
$$;
revoke all on function public.owner_rsvp_funnel(timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.owner_rsvp_funnel(timestamptz, timestamptz) to authenticated;

notify pgrst, 'reload schema';
