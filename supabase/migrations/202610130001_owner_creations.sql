-- What visitors create with the personal tools (invitations, greetings, bedtime stories, word
-- puzzles, newspapers…), for the owner's report. The text is kept as written, but phone numbers,
-- e-mail addresses and address lines are masked — in the browser before sending, and again here.
-- Owner-only reading; rows are deleted after 90 days. Disclosed on /privacy and next to the tools.

create table if not exists public.owner_creations (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  tool text not null check (char_length(tool) <= 60),
  action text not null check (action in ('print', 'pdf', 'share', 'copy', 'create')),
  path text check (path is null or path ~ '^/[a-z0-9/_-]{0,119}$'),
  content text not null check (char_length(content) <= 3000),
  visitor uuid
);
create index if not exists owner_creations_created on public.owner_creations(created_at desc);
create index if not exists owner_creations_visitor on public.owner_creations(visitor, created_at desc) where visitor is not null;
alter table public.owner_creations enable row level security;
revoke all on public.owner_creations from anon, authenticated;
grant select on public.owner_creations to authenticated;
drop policy if exists owner_reads_creations on public.owner_creations;
create policy owner_reads_creations on public.owner_creations
  for select to authenticated
  using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'yos300@gmail.com');

create or replace function public.record_creation(
  p_tool text, p_action text, p_content text, p_path text default null, p_visitor uuid default null)
returns void language plpgsql security definer set search_path = '' as $$
declare c text;
begin
  if p_tool is null or char_length(p_tool) > 60 or p_action not in ('print', 'pdf', 'share', 'copy', 'create') then return; end if;
  c := left(btrim(coalesce(p_content, '')), 3000);
  if char_length(c) < 2 then return; end if;
  -- second line of defence: e-mails, phone-like digit runs, then whatever follows an address word
  c := regexp_replace(c, '[[:alnum:]._%+-]+@[[:alnum:].-]+\.[[:alpha:]]{2,}', '[מייל]', 'g');
  c := regexp_replace(c, '\+?[0-9](?:[ ()-]{0,2}[0-9]){8,}', '[מספר]', 'g'); -- 9+ digits: phone-like, not dates
  c := regexp_replace(c, '(כתובת|רחוב|רח׳|רח''|שדרות|שד׳|📍)[^\n]*', '\1 [כתובת]', 'g');
  if p_path is not null and p_path !~ '^/[a-z0-9/_-]{0,119}$' then p_path := null; end if;
  -- rate limits: 30 an hour per browser, 300 a minute for the whole site
  if p_visitor is not null and (select count(*) from (select 1 from public.owner_creations
      where visitor = p_visitor and created_at > now() - interval '1 hour' limit 30) x) >= 30 then return; end if;
  if (select count(*) from (select 1 from public.owner_creations
      where created_at > now() - interval '1 minute' limit 300) x) >= 300 then return; end if;
  insert into public.owner_creations(tool, action, path, content, visitor) values (left(p_tool, 60), p_action, p_path, c, p_visitor);
  -- retention: now and then, drop rows older than 90 days
  if random() < 0.02 then delete from public.owner_creations where created_at < now() - interval '90 days'; end if;
end;
$$;
revoke all on function public.record_creation(text, text, text, text, uuid) from public;
grant execute on function public.record_creation(text, text, text, text, uuid) to anon, authenticated;
