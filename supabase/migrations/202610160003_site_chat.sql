-- Private visitor-to-owner chat. Visitors can only reach a thread with its unguessable UUID token;
-- the owner can list and answer through the authenticated dashboard. Tables are never exposed directly.

create table if not exists public.site_chat_threads (
  id uuid primary key default gen_random_uuid(),
  public_token uuid not null unique,
  name text,
  contact text,
  topic text not null,
  status text not null default 'open' check (status in ('open', 'answered', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  constraint site_chat_name_length check (name is null or char_length(name) <= 60),
  constraint site_chat_contact_length check (contact is null or char_length(contact) <= 160),
  constraint site_chat_topic_length check (char_length(topic) between 2 and 80)
);

create table if not exists public.site_chat_messages (
  id bigint generated always as identity primary key,
  thread_id uuid not null references public.site_chat_threads(id) on delete cascade,
  sender text not null check (sender in ('visitor', 'owner')),
  body text not null check (char_length(body) between 1 and 1500),
  created_at timestamptz not null default now()
);

create index if not exists site_chat_threads_last_message on public.site_chat_threads(last_message_at desc);
create index if not exists site_chat_messages_thread_created on public.site_chat_messages(thread_id, created_at, id);

alter table public.site_chat_threads enable row level security;
alter table public.site_chat_messages enable row level security;
revoke all on public.site_chat_threads from anon, authenticated;
revoke all on public.site_chat_messages from anon, authenticated;
revoke all on sequence public.site_chat_messages_id_seq from anon, authenticated;

create or replace function public.site_chat_payload(p_thread_id uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'id', t.id,
    'name', t.name,
    'topic', t.topic,
    'status', t.status,
    'created_at', t.created_at,
    'updated_at', t.updated_at,
    'messages', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', m.id, 'sender', m.sender, 'body', m.body, 'created_at', m.created_at
      ) order by m.created_at, m.id)
      from public.site_chat_messages m where m.thread_id = t.id
    ), '[]'::jsonb)
  )
  from public.site_chat_threads t where t.id = p_thread_id;
$$;
revoke all on function public.site_chat_payload(uuid) from public, anon, authenticated;

create or replace function public.site_chat_start(
  p_token uuid, p_name text, p_contact text, p_topic text, p_body text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
  v_body text := btrim(coalesce(p_body, ''));
  v_topic text := btrim(coalesce(p_topic, ''));
begin
  if p_token is null or char_length(v_body) < 2 then raise exception 'message_required'; end if;
  if char_length(v_body) > 1500 or char_length(v_topic) not between 2 and 80 then raise exception 'message_required'; end if;
  if (select count(*) from (select 1 from public.site_chat_threads where created_at > now() - interval '1 minute' limit 80) q) >= 80 then
    raise exception 'rate_limited';
  end if;
  insert into public.site_chat_threads(public_token, name, contact, topic)
  values (p_token, nullif(left(btrim(coalesce(p_name, '')), 60), ''), nullif(left(btrim(coalesce(p_contact, '')), 160), ''), v_topic)
  on conflict (public_token) do nothing returning id into v_id;
  if v_id is null then raise exception 'rate_limited'; end if;
  insert into public.site_chat_messages(thread_id, sender, body) values (v_id, 'visitor', v_body);
  return public.site_chat_payload(v_id);
end;
$$;

create or replace function public.site_chat_get(p_token uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_id uuid;
begin
  select id into v_id from public.site_chat_threads where public_token = p_token;
  if v_id is null then raise exception 'chat_not_found'; end if;
  return public.site_chat_payload(v_id);
end;
$$;

create or replace function public.site_chat_send(p_token uuid, p_body text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
  v_status text;
  v_body text := btrim(coalesce(p_body, ''));
begin
  if char_length(v_body) not between 1 and 1500 then raise exception 'message_required'; end if;
  select id, status into v_id, v_status from public.site_chat_threads where public_token = p_token for update;
  if v_id is null then raise exception 'chat_not_found'; end if;
  if v_status = 'closed' then raise exception 'chat_closed'; end if;
  if (select count(*) from (select 1 from public.site_chat_messages where thread_id = v_id and sender = 'visitor' and created_at > now() - interval '1 hour' limit 30) q) >= 30 then
    raise exception 'rate_limited';
  end if;
  insert into public.site_chat_messages(thread_id, sender, body) values (v_id, 'visitor', v_body);
  update public.site_chat_threads set status = 'open', updated_at = now(), last_message_at = now() where id = v_id;
  return public.site_chat_payload(v_id);
end;
$$;

create or replace function public.site_chat_owner_list(p_limit int default 200)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', t.id, 'name', t.name, 'contact', t.contact, 'topic', t.topic, 'status', t.status,
      'created_at', t.created_at, 'updated_at', t.updated_at, 'last_message_at', t.last_message_at,
      'messages', (select coalesce(jsonb_agg(jsonb_build_object('id', m.id, 'sender', m.sender, 'body', m.body, 'created_at', m.created_at) order by m.created_at, m.id), '[]'::jsonb) from public.site_chat_messages m where m.thread_id = t.id)
    ) order by t.last_message_at desc)
    from (select * from public.site_chat_threads order by last_message_at desc limit least(greatest(coalesce(p_limit, 200), 1), 500)) t
  ), '[]'::jsonb);
end;
$$;

create or replace function public.site_chat_owner_reply(p_thread_id uuid, p_body text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_body text := btrim(coalesce(p_body, ''));
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  if char_length(v_body) not between 1 and 1500 then raise exception 'message_required'; end if;
  if not exists (select 1 from public.site_chat_threads where id = p_thread_id) then raise exception 'chat_not_found'; end if;
  insert into public.site_chat_messages(thread_id, sender, body) values (p_thread_id, 'owner', v_body);
  update public.site_chat_threads set status = 'answered', updated_at = now(), last_message_at = now() where id = p_thread_id;
  return public.site_chat_payload(p_thread_id);
end;
$$;

create or replace function public.site_chat_owner_status(p_thread_id uuid, p_status text)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  if p_status not in ('open', 'answered', 'closed') then raise exception 'bad_status'; end if;
  update public.site_chat_threads set status = p_status, updated_at = now() where id = p_thread_id;
  if not found then raise exception 'chat_not_found'; end if;
  return public.site_chat_payload(p_thread_id);
end;
$$;

revoke all on function public.site_chat_start(uuid, text, text, text, text) from public;
revoke all on function public.site_chat_get(uuid) from public;
revoke all on function public.site_chat_send(uuid, text) from public;
revoke all on function public.site_chat_owner_list(int) from public;
revoke all on function public.site_chat_owner_reply(uuid, text) from public;
revoke all on function public.site_chat_owner_status(uuid, text) from public;
grant execute on function public.site_chat_start(uuid, text, text, text, text) to anon, authenticated;
grant execute on function public.site_chat_get(uuid) to anon, authenticated;
grant execute on function public.site_chat_send(uuid, text) to anon, authenticated;
grant execute on function public.site_chat_owner_list(int) to authenticated;
grant execute on function public.site_chat_owner_reply(uuid, text) to authenticated;
grant execute on function public.site_chat_owner_status(uuid, text) to authenticated;
