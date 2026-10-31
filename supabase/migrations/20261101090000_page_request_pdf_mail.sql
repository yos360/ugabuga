-- PDF by mail (owner's decision 2026-11-01): when the instant build (.github/workflows/page-request-flag.yml)
-- makes a printable page for a visitor who left an email, scripts/request-pdf.mjs prints it to a PDF and stores
-- it here. The mail scheduler (functions/api/mail.js, every 10 minutes, 08:00–21:00) mails it right away with the
-- file attached — without waiting for the deploy — and deletes the file once sent. mailed_at is set by the claim,
-- so the later "page ready" link mail is not sent again. Service role only. Safe to run again.
create table if not exists public.page_request_pdfs (
  request_id bigint primary key references public.page_requests(id) on delete cascade,
  file_name text not null check (char_length(file_name) between 5 and 120),
  pdf bytea not null check (octet_length(pdf) <= 12000000),
  created_at timestamptz not null default now()
);
alter table public.page_request_pdfs enable row level security;
revoke all on public.page_request_pdfs from public, anon, authenticated;
grant select, delete on public.page_request_pdfs to service_role;

create or replace function public.page_request_mail(p_action text, p jsonb default '{}') returns jsonb
language plpgsql security invoker set search_path = public as $$
begin
  if p_action = 'unverified' then
    return coalesce((select jsonb_agg(jsonb_build_object('id', r.id, 'result_path', r.result_path) order by r.id)
      from (select id, result_path from public.page_requests
        where status = 'done' and result_path is not null and live_at is null and done_at > now() - interval '14 days'
        order by id limit 50) r), '[]'::jsonb);
  elsif p_action = 'live' then
    update public.page_requests set live_at = now() where id = (p ->> 'id')::bigint and live_at is null;
    return to_jsonb(found);
  elsif p_action = 'due' then
    -- The link mail, once the page is live; requests that have a PDF waiting get the PDF mail instead.
    return coalesce((select jsonb_agg(jsonb_build_object('id', r.id, 'email', r.email, 'public_title', r.public_title,
        'result_path', r.result_path) order by r.id)
      from (select id, email, public_title, result_path from public.page_requests q
        where status = 'done' and email is not null and mailed_at is null and public_title is not null
          and result_path is not null and live_at is not null and mail_attempts < 3 and done_at > now() - interval '14 days'
          and not exists (select 1 from public.page_request_pdfs f where f.request_id = q.id)
        order by id limit 5) r), '[]'::jsonb);
  elsif p_action = 'pdf_due' then
    -- Done requests with a stored PDF, not yet mailed: no live_at needed. Files older than a week are dropped.
    delete from public.page_request_pdfs where created_at < now() - interval '7 days';
    return coalesce((select jsonb_agg(jsonb_build_object('id', r.id, 'email', r.email, 'public_title', r.public_title,
        'result_path', r.result_path) order by r.id)
      from (select q.id, q.email, q.public_title, q.result_path from public.page_requests q
        join public.page_request_pdfs f on f.request_id = q.id
        where q.status = 'done' and q.email is not null and q.mailed_at is null and q.public_title is not null
          and q.result_path is not null and q.mail_attempts < 3
        order by q.id limit 3) r), '[]'::jsonb);
  elsif p_action = 'pdf_get' then
    return (select jsonb_build_object('file_name', file_name, 'content', translate(encode(pdf, 'base64'), E'\n', ''))
      from public.page_request_pdfs where request_id = (p ->> 'id')::bigint);
  elsif p_action = 'pdf_drop' then
    delete from public.page_request_pdfs where request_id = (p ->> 'id')::bigint;
    return to_jsonb(found);
  elsif p_action = 'claim' then
    update public.page_requests set mailed_at = now(), mail_attempts = mail_attempts + 1
      where id = (p ->> 'id')::bigint and mailed_at is null and mail_attempts < 3;
    return to_jsonb(found);
  elsif p_action = 'release' then
    update public.page_requests set mailed_at = null where id = (p ->> 'id')::bigint;
    return 'true'::jsonb;
  elsif p_action = 'announce_next' then
    -- One post every 30 minutes, oldest live page first.
    if exists (select 1 from public.page_requests where announced_at > now() - interval '29 minutes') then return 'null'::jsonb; end if;
    return (select jsonb_build_object('id', id, 'public_title', public_title, 'result_path', result_path, 'audience', audience)
      from public.page_requests
      where status = 'done' and live_at is not null and announced_at is null and public_title is not null
        and done_at > now() - interval '7 days'
      order by live_at, id limit 1);
  elsif p_action = 'announce_claim' then
    update public.page_requests set announced_at = now() where id = (p ->> 'id')::bigint and announced_at is null;
    return to_jsonb(found);
  elsif p_action = 'announce_release' then
    update public.page_requests set announced_at = null where id = (p ->> 'id')::bigint;
    return 'true'::jsonb;
  end if;
  raise exception 'invalid_action';
end $$;

revoke all on function public.page_request_mail(text, jsonb) from public, anon, authenticated;
grant execute on function public.page_request_mail(text, jsonb) to service_role;
