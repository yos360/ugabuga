-- Anonymous print-dialog events only. No names, IPs, URLs or custom text.
create table public.public_print_activity (
  id bigint generated always as identity primary key,
  category text not null check (category in ('mandalas','coloring','hebrew-letters','photo-props','mazes','sudoku','birthday-signs','abc-letters','numbers','certificates','symmetry','name-tags','thank-you','board-game')),
  created_at timestamptz not null default now()
);
create index public_print_activity_recent on public.public_print_activity(created_at desc);
alter table public.public_print_activity enable row level security;
revoke all on public.public_print_activity from anon, authenticated;
grant select (category, created_at) on public.public_print_activity to authenticated;
create policy recent_anonymous_print_activity on public.public_print_activity for select to anon using (created_at > now() - interval '1 hour');
create policy owner_activity_report on public.public_print_activity for select to authenticated using (lower(coalesce(auth.jwt() ->> 'email','')) = 'yos300@gmail.com');
create or replace function public.record_print_activity(activity_category text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  -- Serialise writes and globally coalesce identical events for five minutes.
  perform pg_advisory_xact_lock(20092026);
  if activity_category not in ('mandalas','coloring','hebrew-letters','photo-props','mazes','sudoku','birthday-signs','abc-letters','numbers','certificates','symmetry','name-tags','thank-you','board-game') then return; end if;
  delete from public.public_print_activity where created_at < now() - interval '1 day';
  if not exists(select 1 from public.public_print_activity where category=activity_category and created_at > now()-interval '5 minutes') then
    insert into public.public_print_activity(category) values(activity_category);
  end if;
end;
$$;
revoke all on function public.record_print_activity(text) from public;
grant execute on function public.record_print_activity(text) to anon, authenticated;
