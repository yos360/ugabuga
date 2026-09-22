-- Restrict the historical activity report to the owner account.
drop policy if exists recent_anonymous_print_activity on public.public_print_activity;
drop policy if exists owner_activity_report on public.public_print_activity;
revoke select on public.public_print_activity from anon;
grant select (category, created_at) on public.public_print_activity to authenticated;
create policy owner_activity_report on public.public_print_activity
  for select to authenticated
  using (lower(coalesce(auth.jwt() ->> 'email','')) = 'yos300@gmail.com');
