-- Postgres regexes allow at most {0,255} repetitions, so the path rule of 20261031090000 failed on
-- every insert. Same rule, written as a character class plus a length check.
alter table public.session_recordings drop constraint if exists session_recordings_path_check;
alter table public.session_recordings add constraint session_recordings_path_check
  check (path ~ '^/[a-zA-Z0-9/_%.-]*$' and char_length(path) <= 300);

create or replace function public.record_session_chunk(p_session uuid, p_chunk int, p_path text, p_width int, p_events text)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if p_session is null or p_chunk is null or p_chunk < 0 or p_chunk > 400 or p_events is null
    or char_length(p_events) > 400000 or p_path is null or p_path !~ '^/[a-zA-Z0-9/_%.-]*$' or char_length(p_path) > 300 then return false; end if;
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

revoke all on function public.record_session_chunk(uuid,int,text,int,text) from public, anon, authenticated;
grant execute on function public.record_session_chunk(uuid,int,text,int,text) to anon, authenticated;
