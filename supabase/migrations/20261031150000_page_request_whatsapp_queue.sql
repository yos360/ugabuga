-- WhatsApp channel queue: WhatsApp has no API for channels, so the owner report shows one live page at a
-- time, oldest first, and the owner posts it by hand. whatsapp_at marks it posted; the next one opens only
-- 30 minutes later and only 08:00–21:00 Israel time, so the channel never gets a burst. Safe to run again.
alter table public.page_requests add column if not exists whatsapp_at timestamptz;

create or replace function public.page_request_whatsapp_owner(p_action text, p_id bigint default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  last_at timestamptz;
  hour_il int := extract(hour from now() at time zone 'Asia/Jerusalem');
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  if p_action = 'next' then
    select max(whatsapp_at) into last_at from public.page_requests;
    return jsonb_build_object(
      'waiting', (select count(*) from public.page_requests
        where status = 'done' and live_at is not null and whatsapp_at is null and public_title is not null and result_path is not null),
      'wait_minutes', case when last_at > now() - interval '30 minutes'
        then ceil(extract(epoch from (last_at + interval '30 minutes' - now())) / 60)::int else 0 end,
      'quiet_hours', hour_il < 8 or hour_il >= 21,
      'next', (select jsonb_build_object('id', id, 'public_title', public_title, 'result_path', result_path, 'audience', audience)
        from public.page_requests
        where status = 'done' and live_at is not null and whatsapp_at is null and public_title is not null and result_path is not null
        order by live_at, id limit 1));
  elsif p_action = 'posted' then
    update public.page_requests set whatsapp_at = now() where id = p_id and whatsapp_at is null and live_at is not null;
    return to_jsonb(found);
  elsif p_action = 'undo' then
    update public.page_requests set whatsapp_at = null where id = p_id;
    return 'true'::jsonb;
  end if;
  raise exception 'invalid_action';
end $$;
revoke all on function public.page_request_whatsapp_owner(text, bigint) from public, anon, authenticated;
grant execute on function public.page_request_whatsapp_owner(text, bigint) to authenticated;
