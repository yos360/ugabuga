-- Holiday calendar reminders (owner report): how many visitors subscribed, by lead (week/month),
-- calendar app and the page or spot they came from. Clicks are logged by the site as
-- category 'invite-cta:calendar-<lead>-<app>[-<spot>]' (src/components/holidays/*Reminder*.jsx).
-- Counts only; each visitor once per day. Safe to run again.
create or replace function public.owner_calendar_reminders(p_from timestamptz, p_to timestamptz)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object('code', code, 'path', path, 'n', n) order by n desc) from (
      select substr(category, 21) code, path,
        count(distinct coalesce(visitor::text, id::text) || '|' || (created_at at time zone 'Asia/Jerusalem')::date::text) n
      from public.owner_site_activity
      where category like 'invite-cta:calendar-%' and created_at >= p_from and created_at < p_to
      group by 1, 2
    ) s
  ), '[]'::jsonb);
end;
$$;
revoke all on function public.owner_calendar_reminders(timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.owner_calendar_reminders(timestamptz, timestamptz) to authenticated;

notify pgrst, 'reload schema';
