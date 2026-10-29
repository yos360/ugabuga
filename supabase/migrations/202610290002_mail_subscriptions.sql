-- Mail subscriptions (approved by the site owner). Safe to re-run; does not change existing tables or recipients.
begin;
create table if not exists public.mail_subscriptions (
 id uuid primary key default gen_random_uuid(), email text not null unique,
 shabbat boolean not null default false, weekly boolean not null default false, marketing boolean not null default false,
 city text not null default 'jerusalem', minutes integer not null default 60 check(minutes in (30,60,120,180)),
 confirmed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 consent_version text, manage_hash text not null,
 pending jsonb, confirm_hash text, expires_at timestamptz, requested_at timestamptz,
 constraint mail_email_length check(length(email) <= 254)
);
create table if not exists public.mail_consent_events (
 id uuid primary key default gen_random_uuid(), subscriber_id uuid references public.mail_subscriptions(id) on delete cascade,
 happened_at timestamptz not null default now(), action text not null, preferences jsonb not null, version text not null
);
create table if not exists public.mail_deliveries (
 subscriber_id uuid references public.mail_subscriptions(id) on delete cascade, campaign text not null,
 status text not null default 'sending', locked_at timestamptz not null default now(), sent_at timestamptz,
 primary key(subscriber_id,campaign)
);
create table if not exists public.mail_limits (key text primary key, n integer not null, expires_at timestamptz not null);
alter table public.mail_subscriptions enable row level security;
alter table public.mail_consent_events enable row level security;
alter table public.mail_deliveries enable row level security;
alter table public.mail_limits enable row level security;
revoke all on public.mail_subscriptions,public.mail_consent_events,public.mail_deliveries,public.mail_limits from public,anon,authenticated;
grant all on public.mail_subscriptions,public.mail_consent_events,public.mail_deliveries,public.mail_limits to service_role;
create index if not exists mail_confirm_idx on public.mail_subscriptions(confirm_hash) where confirm_hash is not null;
create index if not exists mail_manage_idx on public.mail_subscriptions(manage_hash);

create or replace function public.mail_action(p_action text, p jsonb default '{}') returns jsonb
language plpgsql security invoker set search_path=public as $$
declare r public.mail_subscriptions; pref jsonb; num integer; delivery public.mail_deliveries;
begin
 if p_action='limit' then
  insert into mail_limits(key,n,expires_at) values(p->>'key',1,now()+interval '2 days')
  on conflict(key) do update set n=mail_limits.n+1 returning n into num;
  return to_jsonb(num <= (p->>'max')::integer);
 elsif p_action='request' then
  perform pg_advisory_xact_lock(hashtextextended(p->>'email',0));
  select * into r from mail_subscriptions where email=p->>'email' for update;
  if r.requested_at > now()-interval '15 minutes' then return jsonb_build_object('send',false); end if;
  if r.id is null then
   insert into mail_subscriptions(email,manage_hash) values(p->>'email',p->>'manage_hash') returning * into r;
  end if;
  update mail_subscriptions set pending=p->'preferences',confirm_hash=p->>'confirm_hash',expires_at=now()+interval '24 hours',requested_at=now() where id=r.id;
  return jsonb_build_object('send',true);
 elsif p_action='confirm' then
  select * into r from mail_subscriptions where confirm_hash=p->>'hash' and expires_at>now() for update;
  if r.id is null then raise exception 'invalid_link'; end if;
  pref=r.pending;
  update mail_subscriptions set shabbat=(pref->>'shabbat')::boolean,weekly=(pref->>'weekly')::boolean,marketing=(pref->>'marketing')::boolean,
   city=pref->>'city',minutes=(pref->>'minutes')::integer,consent_version=pref->>'consent_version',confirmed_at=coalesce(confirmed_at,now()),updated_at=now(),pending=null,confirm_hash=null,expires_at=null where id=r.id;
  insert into mail_consent_events(subscriber_id,action,preferences,version) values(r.id,'confirmed',pref,pref->>'consent_version');
  return jsonb_build_object('email',r.email);
 elsif p_action in ('get','update') then
  select * into r from mail_subscriptions where manage_hash=p->>'hash' and confirmed_at is not null for update;
  if r.id is null then raise exception 'invalid_link'; end if;
  if p_action='update' then
   pref=p->'preferences';
   update mail_subscriptions set shabbat=(pref->>'shabbat')::boolean,weekly=(pref->>'weekly')::boolean,marketing=(pref->>'marketing')::boolean,
    city=pref->>'city',minutes=(pref->>'minutes')::integer,consent_version=pref->>'consent_version',updated_at=now(),pending=null,confirm_hash=null,expires_at=null where id=r.id returning * into r;
   insert into mail_consent_events(subscriber_id,action,preferences,version) values(r.id,'updated',pref,pref->>'consent_version');
  end if;
  return jsonb_build_object('email',r.email,'shabbat',r.shabbat,'weekly',r.weekly,'marketing',r.marketing,'city',r.city,'minutes',r.minutes);
 elsif p_action='counts' then
  return (select jsonb_build_object('shabbat',count(*) filter(where confirmed_at is not null and shabbat),'weekly',count(*) filter(where confirmed_at is not null and weekly),'marketing',count(*) filter(where confirmed_at is not null and marketing)) from mail_subscriptions);
 elsif p_action='list' then
  return coalesce((select jsonb_agg(to_jsonb(x)) from (select id,email,shabbat,weekly,marketing,city,minutes,confirmed_at,created_at from mail_subscriptions
   where ((p->>'filter')='all' or ((p->>'filter')='shabbat' and shabbat and confirmed_at is not null) or ((p->>'filter')='weekly' and weekly and confirmed_at is not null) or ((p->>'filter')='marketing' and marketing and confirmed_at is not null))
   order by created_at desc,id limit 200 offset least(100000,greatest(0,coalesce((p->>'offset')::integer,0)))) x),'[]'::jsonb);
 elsif p_action='recipients' then
  return coalesce((select jsonb_agg(to_jsonb(x)) from (select s.id,s.email,s.shabbat,s.weekly,s.marketing,s.city,s.minutes from mail_subscriptions s where confirmed_at is not null and (case when p->>'kind'='shabbat' then shabbat else weekly or marketing end) and not exists(select 1 from mail_deliveries d where d.subscriber_id=s.id and d.campaign=p->>'campaign' and d.status='sent') and s.id>coalesce((p->>'after')::uuid,'00000000-0000-0000-0000-000000000000'::uuid) order by s.id limit 5) x),'[]'::jsonb);
 elsif p_action='claim' then
  select * into r from mail_subscriptions where id=(p->>'id')::uuid and confirmed_at is not null for update;
  if r.id is null or (p->>'kind'='shabbat' and not r.shabbat) or (p->>'kind'='weekly' and not (r.weekly or r.marketing)) then return 'false'::jsonb; end if;
  insert into mail_deliveries(subscriber_id,campaign) values(r.id,p->>'campaign') on conflict do nothing;
  if found then return 'true'::jsonb; end if;
  select * into delivery from mail_deliveries where subscriber_id=r.id and campaign=p->>'campaign' for update;
  if delivery.status='sent' or delivery.locked_at>now()-interval '15 minutes' then return 'false'::jsonb; end if;
  update mail_deliveries set locked_at=now() where subscriber_id=r.id and campaign=p->>'campaign';
  return 'true'::jsonb;
 elsif p_action='sent' then
  update mail_deliveries set status='sent',sent_at=now() where subscriber_id=(p->>'id')::uuid and campaign=p->>'campaign';
  return 'true'::jsonb;
 elsif p_action='cleanup' then
  delete from mail_subscriptions where confirmed_at is null and requested_at<now()-interval '2 days';
  update mail_subscriptions set pending=null,confirm_hash=null,expires_at=null where expires_at<now();
  delete from mail_limits where expires_at<now();
  delete from mail_deliveries where locked_at<now()-interval '90 days';
  return 'true'::jsonb;
 end if;
 raise exception 'invalid_action';
end $$;
revoke all on function public.mail_action(text,jsonb) from public,anon,authenticated;
grant execute on function public.mail_action(text,jsonb) to service_role;
commit;
