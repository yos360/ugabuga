-- Reviewable, additive setup. Run only after approving deployment of shared-spaces.
-- No existing RSVP, quiz, supplier or party-list tables/functions are changed.
begin;
create table if not exists public.sg_spaces (
 code text primary key default gen_random_uuid()::text,
 kind text not null check(kind in ('meet','parents','help','album')),
 owner_hash text not null check(length(owner_hash)=64),
 config jsonb not null,
 closed boolean not null default false,
 selected text,
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default now()+interval '30 days'
);
create index if not exists sg_spaces_expiry on public.sg_spaces(expires_at);
create table if not exists public.sg_entries (
 id uuid primary key default gen_random_uuid(),
 code text not null references public.sg_spaces(code) on delete cascade,
 device_hash text not null,
 item_id text not null,
 name text not null check(length(name) between 1 and 40),
 value text not null check(value in ('yes','maybe','no','booked')),
 unique(code,device_hash,item_id)
);
create index if not exists sg_entries_slot on public.sg_entries(code,item_id);
create table if not exists public.sg_photos (
 id uuid primary key default gen_random_uuid(),
 code text not null references public.sg_spaces(code),
 device_hash text not null,
 name text not null check(length(name) between 1 and 40),
 bytes integer not null check(bytes between 1 and 600000),
 status text not null default 'pending' check(status in ('pending','ready','deleting')),
 created_at timestamptz not null default now()
);
create index if not exists sg_photos_space on public.sg_photos(code,created_at);
create table if not exists public.sg_limits (
 key text primary key,
 used bigint not null default 0,
 expires_at timestamptz not null
);
alter table public.sg_spaces enable row level security;
alter table public.sg_entries enable row level security;
alter table public.sg_photos enable row level security;
alter table public.sg_limits enable row level security;
revoke all on public.sg_spaces,public.sg_entries,public.sg_photos,public.sg_limits from public,anon,authenticated;
grant all on public.sg_spaces,public.sg_entries,public.sg_photos,public.sg_limits to service_role;

-- All privileged operations are INVOKER functions, restricted to the server role.
-- The Edge Function authenticates capability tokens before returning any private data.
create or replace function public.sg_limit(p_key text,p_max bigint,p_amount bigint default 1,p_hours integer default 1)
returns void language plpgsql security invoker set search_path='' as $$
declare n bigint;
begin
 insert into public.sg_limits(key,used,expires_at) values(p_key,p_amount,now()+make_interval(hours=>p_hours))
 on conflict(key) do update set used=case when public.sg_limits.expires_at<now() then p_amount else public.sg_limits.used+p_amount end,
 expires_at=case when public.sg_limits.expires_at<now() then now()+make_interval(hours=>p_hours) else public.sg_limits.expires_at end
 returning used into n;
 if n>p_max then raise exception 'rate_limited'; end if;
end; $$;

create or replace function public.sg_action(p_action text,p_code text,p_device text,p_owner text,p_ip text,p jsonb default '{}'::jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare s public.sg_spaces; own boolean; entry public.sg_entries; photo public.sg_photos; slot jsonb; v jsonb; result jsonb; cap integer;
begin
 if length(coalesce(p_device,''))<>64 then raise exception 'bad_input'; end if;
 perform public.sg_limit('request:'||p_ip,600);
 perform public.sg_limit('request:global',5000);
 perform public.sg_limit('request-month:'||to_char(now(),'YYYY-MM'),100000,1,768);
 if p_action='create' then
   perform public.sg_limit('create:'||p_ip,15,1,24);
   perform public.sg_limit('create:global',300,1,24);
   perform pg_advisory_xact_lock(782301);
   if (select count(*) from public.sg_spaces)>10000 then raise exception 'quota'; end if;
   if length(coalesce(p_owner,''))<>64 or p->>'kind' not in ('meet','parents','help','album') or length(coalesce(p->'config'->>'title','')) not between 1 and 100 then raise exception 'bad_input'; end if;
   insert into public.sg_spaces(kind,owner_hash,config,expires_at) values(p->>'kind',p_owner,p->'config',now()+case when p->>'kind'='album' then interval '30 days' else interval '90 days' end) returning * into s;
   return jsonb_build_object('code',s.code);
 end if;
 select * into s from public.sg_spaces where code=p_code and expires_at>now() for update;
 if not found then raise exception 'not_found'; end if;
 own:=s.owner_hash=coalesce(p_owner,'');
 if p_action='get' then
   select coalesce(jsonb_agg(jsonb_build_object('id',e.id,'item_id',e.item_id,'value',e.value,'name',case when s.kind='parents' and not own and e.device_hash<>p_device then null else e.name end,'mine',e.device_hash=p_device) order by e.id),'[]'::jsonb) into result from public.sg_entries e where code=s.code;
   return jsonb_build_object('code',s.code,'kind',s.kind,'config',s.config,'closed',s.closed,'selected',s.selected,'expires_at',s.expires_at,'owner',own,'entries',result,'photos',coalesce((select jsonb_agg(jsonb_build_object('id',id,'name',name,'mine',device_hash=p_device,'bytes',bytes) order by created_at) from public.sg_photos where code=s.code and status='ready'),'[]'::jsonb));
 elsif p_action='update' then
   if not own then raise exception 'not_owner'; end if;
   if p ? 'closed' then update public.sg_spaces set closed=(p->>'closed')::boolean, selected=case when not (p->>'closed')::boolean then null else selected end where code=s.code; end if;
   if p ? 'selected' then
     if s.kind<>'meet' or not exists(select 1 from jsonb_array_elements(s.config->'items') x where x->>'id'=p->>'selected') then raise exception 'bad_input'; end if;
     update public.sg_spaces set selected=p->>'selected',closed=true where code=s.code;
   end if;
   if p ? 'title' then
     if length(trim(p->>'title')) not between 1 and 100 or length(coalesce(p->>'note',''))>600 then raise exception 'bad_input'; end if;
     update public.sg_spaces set config=config||jsonb_build_object('title',trim(p->>'title'),'note',p->>'note') where code=s.code;
   end if;
 elsif p_action='delete' then
   if not own then raise exception 'not_owner'; end if;
   -- Hide immediately; cleanup removes storage objects before dropping their metadata.
   update public.sg_spaces set closed=true,expires_at=now() where code=s.code;
 elsif p_action='withdraw' then
   delete from public.sg_entries where code=s.code and device_hash=p_device and (not(p ? 'item_id') or item_id=p->>'item_id');
 elsif p_action='remove_entry' then
   if not own then raise exception 'not_owner'; end if;
   delete from public.sg_entries where code=s.code and id=(p->>'id')::uuid;
 elsif p_action in ('vote','book') then
   if s.closed then raise exception 'closed'; end if;
   if length(trim(coalesce(p->>'name',''))) not between 1 and 40 then raise exception 'bad_input'; end if;
   perform public.sg_limit('write:'||p_ip,120);
   if not exists(select 1 from public.sg_entries where code=s.code and device_hash=p_device) and (select count(distinct device_hash) from public.sg_entries where code=s.code)>=200 then raise exception 'too_many'; end if;
   if p_action='vote' then
     if s.kind<>'meet' or jsonb_typeof(p->'votes')<>'object' or octet_length((p->'votes')::text)>4000 then raise exception 'bad_input'; end if;
     delete from public.sg_entries where code=s.code and device_hash=p_device;
     for slot in select * from jsonb_array_elements(s.config->'items') loop
       v:=p->'votes'->(slot->>'id');
       if coalesce(v#>>'{}','') not in ('yes','maybe','no') then raise exception 'bad_input'; end if;
       insert into public.sg_entries(code,device_hash,item_id,name,value) values(s.code,p_device,slot->>'id',trim(p->>'name'),v#>>'{}');
     end loop;
   else
     if s.kind not in ('parents','help') then raise exception 'bad_input'; end if;
     select x into slot from jsonb_array_elements(s.config->'items') x where x->>'id'=p->>'item_id';
     if slot is null then raise exception 'bad_input'; end if;
     cap:=coalesce((slot->>'capacity')::integer,1);
     if (select count(*) from public.sg_entries where code=s.code and item_id=p->>'item_id' and device_hash<>p_device)>=cap then raise exception 'slot_full'; end if;
     -- Both cancellation of an old appointment and booking the new one are atomic.
     if s.kind='parents' then delete from public.sg_entries where code=s.code and device_hash=p_device; end if;
     insert into public.sg_entries(code,device_hash,item_id,name,value) values(s.code,p_device,p->>'item_id',trim(p->>'name'),'booked') on conflict(code,device_hash,item_id) do update set name=excluded.name;
   end if;
 elsif p_action='photo_reserve' then
   if s.kind<>'album' then raise exception 'bad_input'; end if;
   if s.closed then raise exception 'closed'; end if;
   perform public.sg_limit('upload:'||p_ip,100,1,24);
   perform pg_advisory_xact_lock(782302);
   if (select count(*) from public.sg_photos where code=s.code)>=100 or (select coalesce(sum(bytes),0) from public.sg_photos)+(p->>'bytes')::integer>100000000 then raise exception 'quota'; end if;
   insert into public.sg_photos(code,device_hash,name,bytes) values(s.code,p_device,trim(p->>'name'),(p->>'bytes')::integer) returning * into photo;
   return jsonb_build_object('id',photo.id,'path',s.code||'/'||photo.id||'.jpg');
 elsif p_action in ('photo_read','photo_delete') then
   select * into photo from public.sg_photos where code=s.code and id=(p->>'id')::uuid and status='ready' for update;
   if not found then raise exception 'not_found'; end if;
   if p_action='photo_delete' then
     if not own and photo.device_hash<>p_device then raise exception 'not_yours'; end if;
     update public.sg_photos set status='deleting' where id=photo.id;
   else
     begin
       perform public.sg_limit('photo-bytes:'||to_char(now(),'YYYY-MM'),2000000000,photo.bytes,768);
     exception when raise_exception then raise exception 'gallery_busy'; end;
   end if;
   return jsonb_build_object('id',photo.id,'path',s.code||'/'||photo.id||'.jpg');
 else raise exception 'bad_input';
 end if;
 return jsonb_build_object('ok',true);
end; $$;
revoke all on function public.sg_limit(text,bigint,bigint,integer), public.sg_action(text,text,text,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.sg_limit(text,bigint,bigint,integer), public.sg_action(text,text,text,text,text,jsonb) to service_role;

-- A separate private bucket; no public or user storage policies are added.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('party-albums','party-albums',false,600000,array['image/jpeg'])
on conflict(id) do nothing;
commit;
