-- RSVP funnel steps for the owner report (/admin/activity): counts per step (distinct anonymous
-- visitor per day) for the period, from the fixed codes 'rsvp-step:<step>' that the site logs
-- (visit, created, guests_<bucket>, shared, first_answer, panel_shown, upgrade_click).
-- Counts only: no names, phones, emails or event titles. Owner-only. Safe to run twice.
create or replace function public.owner_rsvp_steps(p_from timestamptz, p_to timestamptz)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  return coalesce((
    select jsonb_object_agg(step, n) from (
      select substr(category, 11) step,
        count(distinct coalesce(visitor::text, id::text) || '|' || (created_at at time zone 'Asia/Jerusalem')::date::text) n
      from public.owner_site_activity
      where category like 'rsvp-step:%' and created_at >= p_from and created_at < p_to
      group by 1
    ) s
  ), '{}'::jsonb);
end;
$$;
revoke all on function public.owner_rsvp_steps(timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.owner_rsvp_steps(timestamptz, timestamptz) to authenticated;

notify pgrst, 'reload schema';
