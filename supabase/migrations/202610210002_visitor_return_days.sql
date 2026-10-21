-- Returning visitors, anonymously: the browser counts on how many different days it has visited the
-- site (a number only — it keeps no id across days) and reports it once per daily visitor id. The
-- owner report shows "ביקור 3 באתר" next to that day's visitor. The existing event functions are
-- untouched. Safe to run twice. Applied automatically by .github/workflows/apply-migrations.yml.

create table if not exists public.owner_visitor_days (
  visitor uuid primary key,
  visit_no int not null check (visit_no between 1 and 10000),
  created_at timestamptz not null default now()
);
create index if not exists owner_visitor_days_created on public.owner_visitor_days(created_at desc);
alter table public.owner_visitor_days enable row level security;
revoke all on public.owner_visitor_days from public, anon, authenticated;

create or replace function public.record_visit_day(p_visitor uuid, p_visit_no int)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_visitor is null or p_visit_no is null or p_visit_no not between 1 and 10000 then return; end if;
  begin
    perform public.gt_rate_check('visit_day', 20, 3000, interval '10 minutes');
  exception when others then
    if sqlerrm = 'rate_limited' then return; end if;
    raise;
  end;
  delete from public.owner_visitor_days where created_at < now() - interval '400 days';
  -- one number per daily id; a second report for the same id never changes it
  insert into public.owner_visitor_days(visitor, visit_no) values (p_visitor, p_visit_no) on conflict (visitor) do nothing;
end;
$$;
revoke all on function public.record_visit_day(uuid, int) from public, anon, authenticated;
grant execute on function public.record_visit_day(uuid, int) to anon, authenticated;

-- Owner only: visit number per visitor code (the same 6-character code the activity report shows).
create or replace function public.owner_visitor_returns(p_from timestamptz, p_to timestamptz)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  return coalesce((select jsonb_object_agg(v, n) from (
    select left(visitor::text, 6) v, max(visit_no) n from public.owner_visitor_days
    where created_at >= p_from - interval '1 day' and created_at < p_to group by 1) x), '{}'::jsonb);
end;
$$;
revoke all on function public.owner_visitor_returns(timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.owner_visitor_returns(timestamptz, timestamptz) to authenticated;

notify pgrst, 'reload schema';
