-- "הודפס X פעמים" on printable pages: how many times each page was printed or saved as PDF.
-- Only per-page totals leave the database (no visitors, no times), and only for pages printed at
-- least 10 times. Counts come from the owner analytics log (print + download events, which already
-- skip bots and the owner). Cached for 30 minutes so page views don't re-count the table.

create table if not exists public.public_print_counts_cache (
  id smallint primary key check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.public_print_counts_cache enable row level security;
revoke all on public.public_print_counts_cache from anon, authenticated;

create index if not exists owner_site_activity_print_path
  on public.owner_site_activity(path) where action in ('print', 'download');

create or replace function public.public_print_counts()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  cached jsonb;
  fresh jsonb;
begin
  select data into cached from public.public_print_counts_cache where id = 1 and updated_at > now() - interval '30 minutes';
  if cached is not null then return cached; end if;
  select coalesce(jsonb_object_agg(path, n), '{}'::jsonb) into fresh from (
    select path, count(*) n from public.owner_site_activity
    where action in ('print', 'download') and path is not null
    group by path having count(*) >= 10
  ) x;
  insert into public.public_print_counts_cache(id, data, updated_at) values (1, fresh, now())
    on conflict (id) do update set data = excluded.data, updated_at = excluded.updated_at;
  return fresh;
end;
$$;
revoke all on function public.public_print_counts() from public;
grant execute on function public.public_print_counts() to anon, authenticated;
