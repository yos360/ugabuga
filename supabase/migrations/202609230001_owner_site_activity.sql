-- Generalizes owner activity tracking from "print only" to every
-- meaningful click/page-open, so the private /admin/activity report shows
-- real activity. Same privacy stance as public_print_activity: only fixed
-- category/action codes leave the browser — never names, IPs, form values
-- or full URLs. Owner-only read access (yos300@gmail.com), anonymous
-- visitors can only INSERT through the guarded RPC below.
create table public.owner_site_activity (
  id bigint generated always as identity primary key,
  category text not null check (char_length(category) <= 60),
  action text not null check (action in ('open','print','play','check','download','refresh','create','use')),
  created_at timestamptz not null default now()
);
create index owner_site_activity_recent on public.owner_site_activity(created_at desc);
alter table public.owner_site_activity enable row level security;
revoke all on public.owner_site_activity from anon, authenticated;
grant select on public.owner_site_activity to authenticated;
create policy owner_full_activity_report on public.owner_site_activity
  for select to authenticated
  using (lower(coalesce(auth.jwt() ->> 'email','')) = 'yos300@gmail.com');

create or replace function public.record_site_event(p_category text, p_action text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_category is null or p_action is null then return; end if;
  if char_length(p_category) = 0 or char_length(p_category) > 60 then return; end if;
  if p_action not in ('open','print','play','check','download','refresh','create','use') then return; end if;
  delete from public.owner_site_activity where created_at < now() - interval '90 days';
  insert into public.owner_site_activity(category, action) values (left(p_category,60), p_action);
end;
$$;
revoke all on function public.record_site_event(text,text) from public;
grant execute on function public.record_site_event(text,text) to anon, authenticated;
