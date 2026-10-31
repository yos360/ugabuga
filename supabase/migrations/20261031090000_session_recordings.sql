-- Anonymous session recordings (rrweb), so the owner can watch how visitors actually use a page or game.
-- A sampled share of visits uploads gzip+base64 chunks of rrweb events. No ids, no query strings, inputs
-- are masked in the browser. Kept 30 days, and hard caps keep the table small whatever the traffic.
create table if not exists public.session_recordings (
  id bigint generated always as identity primary key,
  session_id uuid not null,
  chunk int not null check (chunk between 0 and 400),
  path text not null check (path ~ '^/[a-zA-Z0-9/_%.-]{0,299}$'),
  width int check (width between 0 and 10000),
  events text not null check (char_length(events) <= 400000),
  bytes int generated always as (octet_length(events)) stored,
  created_at timestamptz not null default now(),
  unique (session_id, chunk)
);
create index if not exists session_recordings_created_at on public.session_recordings(created_at desc);
create index if not exists session_recordings_session on public.session_recordings(session_id, chunk);
alter table public.session_recordings enable row level security;
revoke all on table public.session_recordings from anon, authenticated;
revoke all on sequence public.session_recordings_id_seq from anon, authenticated;

create or replace function public.record_session_chunk(p_session uuid, p_chunk int, p_path text, p_width int, p_events text)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if p_session is null or p_chunk is null or p_chunk < 0 or p_chunk > 400 or p_events is null
    or char_length(p_events) > 400000 or p_path is null or p_path !~ '^/[a-zA-Z0-9/_%.-]{0,299}$' then return false; end if;
  if (select count(*) from (select 1 from public.session_recordings where created_at > now() - interval '1 minute' limit 600) q) >= 600 then return false; end if;
  if p_chunk = 0 then
    -- New recordings only: at most 150 a day and about 250 MB in all. Running ones may finish.
    delete from public.session_recordings where created_at < now() - interval '30 days';
    if (select count(*) from (select 1 from public.session_recordings where chunk = 0 and created_at > now() - interval '1 day' limit 150) q) >= 150 then return false; end if;
    if (select coalesce(sum(bytes), 0) from public.session_recordings) > 250000000 then return false; end if;
  elsif not exists (select 1 from public.session_recordings where session_id = p_session and chunk = 0 and created_at > now() - interval '2 hours') then
    return false;
  end if;
  insert into public.session_recordings(session_id, chunk, path, width, events)
    values (p_session, p_chunk, p_path, greatest(0, least(coalesce(p_width, 0), 10000)), p_events)
    on conflict (session_id, chunk) do nothing;
  return true;
end;
$$;

create or replace function public.session_recordings_owner(p_from timestamptz, p_to timestamptz)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  return coalesce((select jsonb_agg(to_jsonb(s) order by s.started desc) from (
    select session_id as id, min(created_at) as started, max(created_at) as last, count(*) as chunks,
      sum(bytes) as bytes, max(width) as width,
      (select jsonb_agg(p.path order by p.first) from (select path, min(chunk) as first from public.session_recordings r2
        where r2.session_id = r.session_id group by path) p) as paths
    from public.session_recordings r
    group by session_id
    having min(created_at) >= p_from and min(created_at) < p_to
    order by min(created_at) desc limit 300) s), '[]'::jsonb);
end;
$$;

create or replace function public.session_recording_chunks_owner(p_session uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  return coalesce((select jsonb_agg(events order by chunk) from public.session_recordings where session_id = p_session), '[]'::jsonb);
end;
$$;

revoke all on function public.record_session_chunk(uuid,int,text,int,text) from public, anon, authenticated;
revoke all on function public.session_recordings_owner(timestamptz,timestamptz) from public, anon, authenticated;
revoke all on function public.session_recording_chunks_owner(uuid) from public, anon, authenticated;
grant execute on function public.record_session_chunk(uuid,int,text,int,text) to anon, authenticated;
grant execute on function public.session_recordings_owner(timestamptz,timestamptz) to authenticated;
grant execute on function public.session_recording_chunks_owner(uuid) to authenticated;
