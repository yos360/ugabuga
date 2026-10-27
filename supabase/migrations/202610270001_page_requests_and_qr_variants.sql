-- Page requests ("מבקשים דף") and QR-message variants on printed pages.
-- Visitors write only through narrow RPCs; tables are closed to direct access; only the owner reads.
-- Safe to run again: create if not exists / create or replace / drop policy if exists.

create table if not exists public.page_requests (
  id bigint generated always as identity primary key,
  request text not null check (char_length(request) between 3 and 400),
  audience text check (audience is null or char_length(audience) <= 60),
  email text check (email is null or char_length(email) <= 120),
  from_path text check (from_path is null or char_length(from_path) <= 120),
  source text check (source is null or source in ('site','qr','search','print')),
  status text not null default 'new' check (status in ('new','planned','done','declined')),
  created_at timestamptz not null default now()
);
create index if not exists page_requests_created_at on public.page_requests(created_at desc);
alter table public.page_requests enable row level security;
revoke all on table public.page_requests from anon, authenticated;
revoke all on sequence public.page_requests_id_seq from anon, authenticated;

-- Returns true when the request was saved. The email is optional and kept only to say "your page is ready".
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
  if p_source is null or p_source not in ('site','qr','search','print') then p_source := 'site'; end if;
  -- Flood guard: at most 30 requests a minute site-wide, and the same text once a day.
  if (select count(*) from (select 1 from public.page_requests where created_at > now() - interval '1 minute' limit 30) q) >= 30 then return false; end if;
  if exists (select 1 from public.page_requests where request = v_request and created_at > now() - interval '1 day') then return true; end if;
  delete from public.page_requests where created_at < now() - interval '400 days';
  insert into public.page_requests(request, audience, email, from_path, source)
  values (v_request, nullif(left(btrim(coalesce(p_audience, '')), 60), ''), nullif(v_email, ''), p_from_path, p_source);
  return true;
end;
$$;

create or replace function public.page_requests_owner(p_from timestamptz, p_to timestamptz, p_limit int default 300)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id', r.id, 'request', r.request, 'audience', r.audience, 'email', r.email,
      'from_path', r.from_path, 'source', r.source, 'status', r.status, 'created_at', r.created_at) order by r.created_at desc)
    from (select * from public.page_requests where created_at >= p_from and created_at < p_to order by created_at desc
      limit least(greatest(coalesce(p_limit, 300), 1), 1000)) r), '[]'::jsonb);
end;
$$;

create or replace function public.page_request_set_status(p_id bigint, p_status text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  if p_status not in ('new','planned','done','declined') then raise exception 'bad_status'; end if;
  update public.page_requests set status = p_status where id = p_id;
end;
$$;

-- Which QR message was printed, and which one was scanned. Variant ids are short codes (g1, r2…).
create table if not exists public.qr_variant_events (
  id bigint generated always as identity primary key,
  variant text not null check (variant ~ '^[a-z][0-9]{1,2}$'),
  kind text not null check (kind in ('printed','scanned')),
  path text check (path is null or char_length(path) <= 120),
  created_at timestamptz not null default now()
);
create index if not exists qr_variant_events_created_at on public.qr_variant_events(created_at desc);
alter table public.qr_variant_events enable row level security;
revoke all on table public.qr_variant_events from anon, authenticated;
revoke all on sequence public.qr_variant_events_id_seq from anon, authenticated;

create or replace function public.record_qr_variant(p_variant text, p_kind text, p_path text default null)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_variant is null or p_variant !~ '^[a-z][0-9]{1,2}$' or p_kind not in ('printed','scanned') then return; end if;
  if p_path is not null and p_path !~ '^/[a-z0-9/_-]{0,119}$' then p_path := null; end if;
  if (select count(*) from (select 1 from public.qr_variant_events where created_at > now() - interval '1 minute' limit 300) q) >= 300 then return; end if;
  delete from public.qr_variant_events where created_at < now() - interval '400 days';
  insert into public.qr_variant_events(variant, kind, path) values (p_variant, p_kind, p_path);
end;
$$;

create or replace function public.qr_variant_owner(p_from timestamptz, p_to timestamptz)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('variant', v.variant, 'printed', v.printed, 'scanned', v.scanned) order by v.variant)
    from (select variant, count(*) filter (where kind = 'printed') as printed, count(*) filter (where kind = 'scanned') as scanned
      from public.qr_variant_events where created_at >= p_from and created_at < p_to group by variant) v), '[]'::jsonb);
end;
$$;

revoke all on function public.record_page_request(text,text,text,text,text) from public, anon, authenticated;
revoke all on function public.page_requests_owner(timestamptz,timestamptz,int) from public, anon, authenticated;
revoke all on function public.page_request_set_status(bigint,text) from public, anon, authenticated;
revoke all on function public.record_qr_variant(text,text,text) from public, anon, authenticated;
revoke all on function public.qr_variant_owner(timestamptz,timestamptz) from public, anon, authenticated;
grant execute on function public.record_page_request(text,text,text,text,text) to anon, authenticated;
grant execute on function public.record_qr_variant(text,text,text) to anon, authenticated;
grant execute on function public.page_requests_owner(timestamptz,timestamptz,int) to authenticated;
grant execute on function public.page_request_set_status(bigint,text) to authenticated;
grant execute on function public.qr_variant_owner(timestamptz,timestamptz) to authenticated;
