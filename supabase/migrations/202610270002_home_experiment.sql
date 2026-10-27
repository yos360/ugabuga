-- Home-page experiment: each visitor sees one top block (search / Buga Live / "what should we make?").
-- Per variant we count, once per browser tab: shown, clicked the top block, printed, sent a page request.
-- Safe to run again.

create table if not exists public.site_experiment_events (
  id bigint generated always as identity primary key,
  experiment text not null check (experiment ~ '^[a-z][a-z0-9-]{1,30}$'),
  variant text not null check (variant ~ '^[a-z][a-z0-9-]{0,20}$'),
  kind text not null check (kind in ('shown','click','print','request')),
  created_at timestamptz not null default now()
);
create index if not exists site_experiment_events_created_at on public.site_experiment_events(experiment, created_at desc);
alter table public.site_experiment_events enable row level security;
revoke all on table public.site_experiment_events from anon, authenticated;
revoke all on sequence public.site_experiment_events_id_seq from anon, authenticated;

create or replace function public.record_experiment_event(p_experiment text, p_variant text, p_kind text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_experiment is null or p_experiment !~ '^[a-z][a-z0-9-]{1,30}$' then return; end if;
  if p_variant is null or p_variant !~ '^[a-z][a-z0-9-]{0,20}$' then return; end if;
  if p_kind not in ('shown','click','print','request') then return; end if;
  if (select count(*) from (select 1 from public.site_experiment_events where created_at > now() - interval '1 minute' limit 600) q) >= 600 then return; end if;
  delete from public.site_experiment_events where created_at < now() - interval '400 days';
  insert into public.site_experiment_events(experiment, variant, kind) values (p_experiment, p_variant, p_kind);
end;
$$;

create or replace function public.experiment_owner(p_experiment text, p_from timestamptz, p_to timestamptz)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('variant', v.variant, 'shown', v.shown, 'click', v.click, 'print', v.print, 'request', v.request) order by v.variant)
    from (select variant,
        count(*) filter (where kind = 'shown') as shown, count(*) filter (where kind = 'click') as click,
        count(*) filter (where kind = 'print') as print, count(*) filter (where kind = 'request') as request
      from public.site_experiment_events where experiment = p_experiment and created_at >= p_from and created_at < p_to group by variant) v), '[]'::jsonb);
end;
$$;

revoke all on function public.record_experiment_event(text,text,text) from public, anon, authenticated;
revoke all on function public.experiment_owner(text,timestamptz,timestamptz) from public, anon, authenticated;
grant execute on function public.record_experiment_event(text,text,text) to anon, authenticated;
grant execute on function public.experiment_owner(text,timestamptz,timestamptz) to authenticated;

-- Page requests can now also come straight from the home page.
alter table public.page_requests drop constraint if exists page_requests_source_check;
alter table public.page_requests add constraint page_requests_source_check check (source is null or source in ('site','qr','search','print','home'));
create or replace function public.record_page_request(p_request text, p_audience text default null, p_email text default null,
  p_from_path text default null, p_source text default null)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_request text := btrim(regexp_replace(coalesce(p_request, ''), '\s+', ' ', 'g'));
  v_email text := lower(btrim(coalesce(p_email, '')));
begin
  if char_length(v_request) not between 3 and 400 then return false; end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[a-z]{2,}$' or char_length(v_email) > 120 then v_email := null; end if;
  if p_from_path is not null and p_from_path !~ '^/[a-z0-9/_-]{0,119}$' then p_from_path := null; end if;
  if p_source is null or p_source not in ('site','qr','search','print','home') then p_source := 'site'; end if;
  if (select count(*) from (select 1 from public.page_requests where created_at > now() - interval '1 minute' limit 30) q) >= 30 then return false; end if;
  if exists (select 1 from public.page_requests where request = v_request and created_at > now() - interval '1 day') then return true; end if;
  delete from public.page_requests where created_at < now() - interval '400 days';
  insert into public.page_requests(request, audience, email, from_path, source)
  values (v_request, nullif(left(btrim(coalesce(p_audience, '')), 60), ''), nullif(v_email, ''), p_from_path, p_source);
  return true;
end;
$$;
revoke all on function public.record_page_request(text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.record_page_request(text,text,text,text,text) to anon, authenticated;
