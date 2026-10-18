-- RSVP organizer code: the organizer picks 4 digits when creating the event, and can manage it from
-- any phone by opening the guests' link and tapping "אני המארגן/ת". The code is stored hashed (with
-- the event code as salt). Guessing is limited per event: after every 5 wrong tries the code rests
-- for an hour, and after 20 wrong tries it stops working until the organizer sets it again.
alter table public.rsvp_events
  add column if not exists pin_hash text,
  add column if not exists pin_fails int not null default 0,
  add column if not exists pin_fail_at timestamptz;

create or replace function public.rsvp_pin_hash(p_code text, p_pin text)
returns text language sql immutable set search_path = public as $$
  select encode(sha256(convert_to(p_code || ':' || p_pin, 'UTF8')), 'hex');
$$;

-- Organizer only: set or change the code.
create or replace function public.rsvp_set_pin(p_code text, p_host_token text, p_pin text)
returns void language plpgsql security definer set search_path = public as $$
declare e public.rsvp_events := rsvp_find(p_code);
begin
  if p_host_token is null or e.host_token <> p_host_token then raise exception 'not_owner'; end if;
  if coalesce(p_pin, '') !~ '^[0-9]{4}$' then raise exception 'bad_pin'; end if;
  update public.rsvp_events set pin_hash = rsvp_pin_hash(e.code, p_pin), pin_fails = 0, pin_fail_at = null where id = e.id;
end; $$;

-- Organizer only: whether a code is set (the host view offers to set one when it is not).
create or replace function public.rsvp_has_pin(p_code text, p_host_token text)
returns boolean language plpgsql stable security definer set search_path = public as $$
declare e public.rsvp_events := rsvp_find(p_code);
begin
  if p_host_token is null or e.host_token <> p_host_token then raise exception 'not_owner'; end if;
  return e.pin_hash is not null and e.pin_fails < 20;
end; $$;

-- "I'm the organizer": the right code returns the organizer token, a wrong one returns null.
-- (A wrong try returns instead of raising, so the failed-try count is kept.)
create or replace function public.rsvp_pin_login(p_code text, p_pin text)
returns text language plpgsql security definer set search_path = public as $$
declare e public.rsvp_events := rsvp_find(p_code);
begin
  perform gt_rate_check('rsvp_pin', 30, 3000, interval '1 hour');
  if e.pin_hash is null then raise exception 'no_pin'; end if;
  if e.pin_fails >= 20 then raise exception 'pin_locked'; end if;
  if e.pin_fails > 0 and e.pin_fails % 5 = 0 and e.pin_fail_at > now() - interval '1 hour' then raise exception 'rate_limited'; end if;
  if coalesce(p_pin, '') ~ '^[0-9]{4}$' and rsvp_pin_hash(e.code, p_pin) = e.pin_hash then
    update public.rsvp_events set pin_fails = 0, pin_fail_at = null where id = e.id;
    return e.host_token;
  end if;
  update public.rsvp_events set pin_fails = pin_fails + 1, pin_fail_at = now() where id = e.id;
  return null;
end; $$;

revoke all on function public.rsvp_pin_hash(text, text) from public, anon, authenticated;
revoke all on function public.rsvp_set_pin(text, text, text), public.rsvp_has_pin(text, text), public.rsvp_pin_login(text, text) from public;
grant execute on function public.rsvp_set_pin(text, text, text), public.rsvp_has_pin(text, text), public.rsvp_pin_login(text, text) to anon, authenticated;
