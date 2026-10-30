-- A new page request starts the page-requests task right away: on insert, ask GitHub for a
-- repository_dispatch ("page-request"), which fires the cloud routine. Only the event name is sent —
-- no request text, no email. The GitHub token lives in Supabase Vault as 'github_dispatch_token'
-- (the owner adds it in the dashboard); without it this does nothing. Never blocks the insert.
-- Safe to run again.
create extension if not exists pg_net with schema extensions;

create or replace function public.page_request_dispatch()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_token text;
begin
  select decrypted_secret into v_token from vault.decrypted_secrets where name = 'github_dispatch_token' limit 1;
  if coalesce(v_token, '') = '' then return new; end if;
  perform net.http_post(
    url := 'https://api.github.com/repos/yos360/ugabuga/dispatches',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || v_token,
      'Accept', 'application/vnd.github+json',
      'User-Agent', 'ugabuga-page-requests',
      'Content-Type', 'application/json'),
    body := jsonb_build_object('event_type', 'page-request'));
  return new;
exception when others then
  return new;
end $$;

revoke all on function public.page_request_dispatch() from public, anon, authenticated;

drop trigger if exists page_request_dispatch on public.page_requests;
create trigger page_request_dispatch after insert on public.page_requests
  for each row when (new.status = 'new') execute function public.page_request_dispatch();
