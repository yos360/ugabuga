-- Owner-only removal of visitor content: paste the link that was reported (wall, RSVP, list, draw,
-- quiz, live game, homework or shared page) and everything behind it is deleted. Safe to run again.
create or replace function public.owner_takedown(p_link text)
returns text language plpgsql security definer set search_path = public as $f$
declare m text[]; kind text; c text; n int := 0;
begin
  if not sup_is_owner() then raise exception 'not_owner'; end if;
  m := regexp_match(coalesce(p_link, ''), '(?:^|/)(w|r|l|g|q|t|hw|play|live)/([A-Za-z0-9_-]+)');
  if m is null then raise exception 'bad_link'; end if;
  kind := m[1]; c := m[2];
  if kind = 'w' and to_regclass('public.wall_boards') is not null then delete from public.wall_boards where code = c; get diagnostics n = row_count;
  elsif kind = 'r' and to_regclass('public.rsvp_events') is not null then delete from public.rsvp_events where code = c; get diagnostics n = row_count;
  elsif kind = 'l' and to_regclass('public.party_lists') is not null then delete from public.party_lists where share_code = c; get diagnostics n = row_count;
  elsif kind = 'g' and to_regclass('public.secret_draws') is not null then delete from public.secret_draws where code = c; get diagnostics n = row_count;
  elsif kind = 'q' and to_regclass('public.quizzes') is not null then delete from public.quizzes where code = c; get diagnostics n = row_count;
  elsif kind in ('play', 'live') and to_regclass('public.live_quizzes') is not null then delete from public.live_quizzes where code = upper(c); get diagnostics n = row_count;
  elsif kind = 'hw' and to_regclass('public.hw_assignments') is not null then delete from public.hw_assignments where code = c; get diagnostics n = row_count;
  elsif kind = 't' and to_regclass('public.sg_spaces') is not null then delete from public.sg_spaces where code = c; get diagnostics n = row_count;
  end if;
  return case when n > 0 then 'removed' else 'not_found' end;
end; $f$;

revoke all on function public.owner_takedown(text) from public, anon;
grant execute on function public.owner_takedown(text) to authenticated;
