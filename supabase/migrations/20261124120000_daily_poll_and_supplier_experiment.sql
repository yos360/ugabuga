-- 1) "מה אתם אומרים?" — the daily poll on the home page (src/components/home/DailyPoll.jsx).
--    One vote per poll per anonymous browser id (the same daily-rotating uuid as site events). Nothing
--    personal: poll id, option index, the anonymous id and the time. Results are public aggregates only.
-- 2) Owner report section "ניסוי ספקים באישורי הגעה": visits to /advertise and new supplier sign-ups.
-- Safe to run twice. Applied automatically by .github/workflows/apply-migrations.yml.

create table if not exists public.daily_poll_votes (
  poll_id text not null check (poll_id ~ '^[a-z0-9-]{2,40}$'),
  choice smallint not null check (choice between 0 and 5),
  visitor uuid not null,
  created_at timestamptz not null default now(),
  primary key (poll_id, visitor)
);
alter table public.daily_poll_votes enable row level security;
create index if not exists daily_poll_votes_time on public.daily_poll_votes(created_at desc);

create or replace function public.poll_results(p_poll text)
returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_object_agg(choice::text, n), '{}'::jsonb)
  from (select choice, count(*) n from public.daily_poll_votes where poll_id = p_poll group by choice) x;
$$;
revoke all on function public.poll_results(text) from public;
grant execute on function public.poll_results(text) to anon, authenticated;

create or replace function public.poll_vote(p_poll text, p_choice int, p_visitor uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  if p_poll is null or p_poll !~ '^[a-z0-9-]{2,40}$' or p_choice is null or p_choice not between 0 and 5 or p_visitor is null then
    return public.poll_results(p_poll);
  end if;
  -- Flood guard: at most 600 votes a minute across the whole site.
  if (select count(*) from (select 1 from public.daily_poll_votes where created_at > now() - interval '1 minute' limit 600) x) < 600 then
    insert into public.daily_poll_votes(poll_id, choice, visitor) values (p_poll, p_choice, p_visitor)
    on conflict (poll_id, visitor) do nothing;
  end if;
  return public.poll_results(p_poll);
end;
$$;
revoke all on function public.poll_vote(text, int, uuid) from public;
grant execute on function public.poll_vote(text, int, uuid) to anon, authenticated;

-- Owner only: every poll that got votes in the period, with its counts.
create or replace function public.owner_poll_summary(p_from timestamptz, p_to timestamptz)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  return (select coalesce(jsonb_agg(x order by x.last desc), '[]'::jsonb) from (
    select poll_id, count(*) votes, max(created_at) last,
           (select jsonb_object_agg(c.choice::text, c.n) from (
              select choice, count(*) n from public.daily_poll_votes v2
              where v2.poll_id = v.poll_id group by choice) c) counts
    from public.daily_poll_votes v
    where created_at >= p_from and created_at < p_to
    group by poll_id) x);
end;
$$;
revoke all on function public.owner_poll_summary(timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.owner_poll_summary(timestamptz, timestamptz) to authenticated;

-- Owner only: the RSVP supplier experiment (24.11.2026). Clicks on the cards themselves come from
-- owner_sponsor_clicks; this adds visits to /advertise and suppliers who signed up in the period.
create or replace function public.owner_supplier_experiment(p_from timestamptz, p_to timestamptz)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  return jsonb_build_object(
    'advertise_views', (select count(*) from public.owner_site_activity
      where created_at >= p_from and created_at < p_to and action = 'open' and path = '/advertise'),
    'advertise_visitors', (select count(distinct visitor) from public.owner_site_activity
      where created_at >= p_from and created_at < p_to and action = 'open' and path = '/advertise'),
    'suppliers_join_views', (select count(*) from public.owner_site_activity
      where created_at >= p_from and created_at < p_to and action = 'open' and path in ('/suppliers/me', '/suppliers/join')),
    'signups', (select coalesce(jsonb_agg(jsonb_build_object(
        'name', s.name, 'status', s.status, 'plan', s.plan, 'category', s.category, 'area', s.area,
        'created_at', s.created_at,
        'self', coalesce(lower(u.email), '') <> 'yos300@gmail.com') order by s.created_at desc), '[]'::jsonb)
      from public.suppliers s left join auth.users u on u.id = s.user_id
      where s.created_at >= p_from and s.created_at < p_to),
    'suppliers_total', (select count(*) from public.suppliers where status = 'approved')
  );
end;
$$;
revoke all on function public.owner_supplier_experiment(timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.owner_supplier_experiment(timestamptz, timestamptz) to authenticated;

notify pgrst, 'reload schema';
