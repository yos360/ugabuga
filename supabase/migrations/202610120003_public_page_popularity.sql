-- Site search orders its suggestions by what people actually open most.
-- Only per-page totals leave the database: how many different visitors opened each page in the
-- last 30 days (pages with at least 3). Counts come from the owner analytics log ('open' events,
-- which already skip bots and the owner). Cached for 30 minutes so searches don't re-count the table.

create table if not exists public.public_page_popularity_cache (
  id smallint primary key check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.public_page_popularity_cache enable row level security;
revoke all on public.public_page_popularity_cache from anon, authenticated;

create or replace function public.public_page_popularity()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  cached jsonb;
  fresh jsonb;
begin
  select data into cached from public.public_page_popularity_cache where id = 1 and updated_at > now() - interval '30 minutes';
  if cached is not null then return cached; end if;
  select coalesce(jsonb_object_agg(path, n), '{}'::jsonb) into fresh from (
    select path, count(distinct visitor) n from public.owner_site_activity
    where action = 'open' and path is not null and visitor is not null
      and created_at >= now() - interval '30 days'
    group by path having count(distinct visitor) >= 3
    order by n desc limit 1500
  ) x;
  insert into public.public_page_popularity_cache(id, data, updated_at) values (1, fresh, now())
    on conflict (id) do update set data = excluded.data, updated_at = excluded.updated_at;
  return fresh;
end;
$$;
revoke all on function public.public_page_popularity() from public;
grant execute on function public.public_page_popularity() to anon, authenticated;
