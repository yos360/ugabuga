-- Owner activity report: show the real RSVP event title (for example, "הברית של אופק")
-- next to actions on its shared /r/<code> link. This returns only a code and title,
-- and is explicitly restricted to the owner account.
create or replace function public.owner_rsvp_event_titles(p_codes text[])
returns table (code text, title text)
language plpgsql stable security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then
    raise exception 'not_owner';
  end if;

  return query
  select e.code, e.title
  from public.rsvp_events e
  where e.code = any(coalesce(p_codes, array[]::text[]));
end;
$$;

revoke all on function public.owner_rsvp_event_titles(text[]) from public, anon;
grant execute on function public.owner_rsvp_event_titles(text[]) to authenticated;
