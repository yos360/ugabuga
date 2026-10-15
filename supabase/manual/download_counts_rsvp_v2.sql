-- Additive rollout: existing events, tokens, answers and all legacy RPCs are untouched.
-- Run this complete file in the Supabase SQL editor if the migration API is unavailable.
begin;
create table if not exists public.pdf_download_totals (
  path text primary key,
  downloads bigint not null default 0 check (downloads >= 0)
);
create table if not exists public.pdf_download_receipts (
  request_id uuid primary key,
  created_at timestamptz not null default now()
);
create index if not exists pdf_download_receipts_created on public.pdf_download_receipts(created_at);
alter table public.pdf_download_totals enable row level security;
alter table public.pdf_download_receipts enable row level security;
revoke all on public.pdf_download_totals, public.pdf_download_receipts from public, anon, authenticated;

-- Only successful PDF exports call this. No historical button clicks are imported.
create or replace function public.record_pdf_download(p_path text, p_request_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if p_request_id is null or p_path is null or length(p_path) > 120
     or p_path !~ '^/(printables|recipes|cakes|food|shabbat-activities|shabbat-times|parasha|tools|learn|math|hebrew|english|classroom|family|holidays|games|discover|en|invitation|greeting|roots-project|birthday-newspaper)(/[a-z0-9_-]+)*$'
  then return false; end if;
  perform public.gt_rate_check('pdf_download', 60, 100000);
  delete from public.pdf_download_receipts where created_at < now() - interval '1 day';
  insert into public.pdf_download_receipts(request_id) values(p_request_id) on conflict do nothing;
  if not found then return false; end if;
  insert into public.pdf_download_totals(path, downloads) values(p_path, 1)
    on conflict(path) do update set downloads = public.pdf_download_totals.downloads + 1;
  return true;
end; $$;
create or replace function public.public_download_counts()
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('total', coalesce(sum(downloads), 0),
    'pages', coalesce(jsonb_object_agg(path, downloads) filter(where downloads >= 20), '{}'::jsonb))
  from public.pdf_download_totals;
$$;
revoke all on function public.record_pdf_download(text, uuid), public.public_download_counts() from public;
grant execute on function public.record_pdf_download(text, uuid), public.public_download_counts() to anon, authenticated;

-- Presence of this row, never a browser flag or date cutoff, selects the new UI.
create table if not exists public.rsvp_presentations (
  event_id uuid primary key references public.rsvp_events(id) on delete cascade,
  theme text not null check(theme in ('party', 'garden', 'sky', 'elegant'))
);
alter table public.rsvp_presentations enable row level security;
revoke all on public.rsvp_presentations from public, anon, authenticated;

create or replace function public.rsvp_create_v2(p_host_token text, p jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare result jsonb; chosen text := coalesce(p->>'theme', 'party');
begin
  if chosen not in ('party','garden','sky','elegant') then raise exception 'bad_theme'; end if;
  result := public.rsvp_create(p_host_token, p);
  insert into public.rsvp_presentations(event_id, theme)
    select id, chosen from public.rsvp_events where code = result->>'code' and host_token = p_host_token;
  return result || jsonb_build_object('ui_version', 2, 'theme', chosen);
end; $$;
create or replace function public.rsvp_get_v2(p_code text, p_device_token text default null)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare result jsonb; chosen text;
begin
  result := public.rsvp_get(p_code, p_device_token);
  select v.theme into chosen from public.rsvp_presentations v join public.rsvp_events e on e.id = v.event_id where e.code = p_code;
  if chosen is null then return result; end if;
  return result || jsonb_build_object('ui_version', 2, 'theme', chosen);
end; $$;
create or replace function public.rsvp_host_v2(p_code text, p_host_token text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare result jsonb; chosen text;
begin
  result := public.rsvp_host(p_code, p_host_token);
  select v.theme into chosen from public.rsvp_presentations v join public.rsvp_events e on e.id = v.event_id where e.code = p_code;
  if chosen is null then return result; end if;
  return result || jsonb_build_object('ui_version', 2, 'theme', chosen);
end; $$;
create or replace function public.rsvp_update_v2(p_code text, p_host_token text, p jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare result jsonb; chosen text := p->>'theme'; event_uuid uuid;
begin
  -- Authorization first; updates can never opt legacy events into the new UI.
  select (public.rsvp_host_find(p_code, p_host_token)).id into event_uuid;
  if not exists(select 1 from public.rsvp_presentations where event_id = event_uuid) then
    return public.rsvp_update(p_code, p_host_token, p);
  end if;
  if chosen is not null and chosen not in ('party','garden','sky','elegant') then raise exception 'bad_theme'; end if;
  result := public.rsvp_update(p_code, p_host_token, p);
  update public.rsvp_presentations set theme = coalesce(chosen, theme) where event_id = event_uuid returning theme into chosen;
  return result || jsonb_build_object('ui_version', 2, 'theme', chosen);
end; $$;
revoke all on function public.rsvp_create_v2(text,jsonb), public.rsvp_get_v2(text,text), public.rsvp_host_v2(text,text), public.rsvp_update_v2(text,text,jsonb) from public;
grant execute on function public.rsvp_create_v2(text,jsonb), public.rsvp_get_v2(text,text), public.rsvp_host_v2(text,text), public.rsvp_update_v2(text,text,jsonb) to anon, authenticated;
create or replace function public.rsvp_experience_version()
returns integer language sql immutable set search_path = '' as $$ select 2; $$;
revoke all on function public.rsvp_experience_version() from public;
grant execute on function public.rsvp_experience_version() to anon, authenticated;
-- Abort the entire installation if any legacy guest/organizer response would change.
do $$
begin
  if exists (
    select 1 from public.rsvp_events e
    where e.expires_at > now() and not exists(select 1 from public.rsvp_presentations v where v.event_id = e.id)
      and (public.rsvp_get_v2(e.code, null) is distinct from public.rsvp_get(e.code, null)
        or public.rsvp_host_v2(e.code, e.host_token) is distinct from public.rsvp_host(e.code, e.host_token))
  ) then raise exception 'Legacy RSVP compatibility check failed'; end if;
end; $$;
commit;
