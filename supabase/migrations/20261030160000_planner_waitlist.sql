-- Waiting list for the teachers' timetable planner ("מערכת השעות שלך"): a teacher leaves an email (and
-- optionally what and whom they teach) to hear once, when the planner opens. Visitors write only through
-- the narrow RPC; the table is closed to direct access; the owner reads it. Safe to run again.
create table if not exists public.planner_waitlist (
  id bigint generated always as identity primary key,
  email text not null unique check (char_length(email) <= 120),
  teaches text check (teaches is null or char_length(teaches) <= 120),
  from_path text check (from_path is null or char_length(from_path) <= 120),
  created_at timestamptz not null default now()
);
alter table public.planner_waitlist enable row level security;
revoke all on table public.planner_waitlist from anon, authenticated;
revoke all on sequence public.planner_waitlist_id_seq from anon, authenticated;

-- Returns true when the email is on the list (already being there counts).
create or replace function public.join_planner_waitlist(p_email text, p_teaches text default null, p_from_path text default null)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_email text := lower(btrim(coalesce(p_email, '')));
begin
  if v_email !~ '^[^@\s]+@[^@\s]+\.[a-z]{2,}$' or char_length(v_email) > 120 then return false; end if;
  if p_from_path is not null and p_from_path !~ '^/[a-z0-9/_-]{0,119}$' then p_from_path := null; end if;
  insert into public.planner_waitlist (email, teaches, from_path)
    values (v_email, nullif(left(btrim(coalesce(p_teaches, '')), 120), ''), p_from_path)
    on conflict (email) do update set teaches = coalesce(excluded.teaches, public.planner_waitlist.teaches);
  return true;
end $$;
revoke all on function public.join_planner_waitlist(text, text, text) from public;
grant execute on function public.join_planner_waitlist(text, text, text) to anon, authenticated;

-- The owner sees how many teachers are waiting (owner report).
create or replace function public.planner_waitlist_owner()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('email', w.email, 'teaches', w.teaches, 'from_path', w.from_path, 'created_at', w.created_at) order by w.created_at desc)
    from public.planner_waitlist w), '[]'::jsonb);
end $$;
revoke all on function public.planner_waitlist_owner() from public, anon, authenticated;
grant execute on function public.planner_waitlist_owner() to authenticated;
