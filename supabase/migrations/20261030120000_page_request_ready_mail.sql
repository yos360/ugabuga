-- "Your page is ready" mails: a done request whose visitor left an email gets one mail from the mail
-- scheduler (functions/api/mail.js, every 10 minutes). Service role only; the requests task never sees
-- emails. Each request is claimed before sending, at most 3 attempts. Safe to run again.
alter table public.page_requests add column if not exists mailed_at timestamptz;
alter table public.page_requests add column if not exists mail_attempts int not null default 0;
-- Requests finished before this went live were left to the owner's manual mail button.
update public.page_requests set mailed_at = done_at
  where status = 'done' and mailed_at is null and done_at < timestamptz '2026-10-30 08:00+00';
grant select, update on public.page_requests to service_role;

create or replace function public.page_request_mail(p_action text, p jsonb default '{}') returns jsonb
language plpgsql security invoker set search_path = public as $$
begin
  if p_action = 'due' then
    return coalesce((select jsonb_agg(jsonb_build_object('id', r.id, 'email', r.email, 'public_title', r.public_title,
        'result_path', r.result_path) order by r.id)
      from (select id, email, public_title, result_path from public.page_requests
        where status = 'done' and email is not null and mailed_at is null and public_title is not null
          and result_path is not null and mail_attempts < 3 and done_at > now() - interval '14 days'
        order by id limit 5) r), '[]'::jsonb);
  elsif p_action = 'claim' then
    update public.page_requests set mailed_at = now(), mail_attempts = mail_attempts + 1
      where id = (p ->> 'id')::bigint and mailed_at is null and mail_attempts < 3;
    return to_jsonb(found);
  elsif p_action = 'release' then
    update public.page_requests set mailed_at = null where id = (p ->> 'id')::bigint;
    return 'true'::jsonb;
  end if;
  raise exception 'invalid_action';
end $$;

revoke all on function public.page_request_mail(text, jsonb) from public, anon, authenticated;
grant execute on function public.page_request_mail(text, jsonb) to service_role;
