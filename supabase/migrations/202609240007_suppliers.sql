-- ספקים: supplier cards (free) and landing pages (enabled by the owner).
-- All access goes through the functions below; the tables themselves are closed.
-- Owner = yos300@gmail.com. A supplier signs in (Google / email link) and can
-- create ONE card, which stays hidden until the owner approves it.

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,40}$'),
  user_id uuid,
  status text not null default 'pending' check (status in ('pending','approved','hidden')),
  plan text not null default 'card' check (plan in ('card','page')),
  template int not null default 1 check (template between 1 and 5),
  page_request boolean not null default false,
  name text not null check (char_length(name) between 2 and 60),
  tagline text, about text, category text, area text,
  tags text[] not null default '{}',
  logo_url text, cover_url text,
  whatsapp text, phone text, instagram text, facebook text, tiktok text, youtube text, website text,
  gallery jsonb not null default '[]'::jsonb,
  videos jsonb not null default '[]'::jsonb,
  services jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists suppliers_user on public.suppliers(user_id);
create index if not exists suppliers_status on public.suppliers(status, created_at desc);
alter table public.suppliers enable row level security;
revoke all on public.suppliers from anon, authenticated;

create table if not exists public.supplier_events (
  id bigint generated always as identity primary key,
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  kind text not null check (kind in ('view','whatsapp','phone','social','website','card')),
  visitor uuid,
  created_at timestamptz not null default now()
);
create index if not exists supplier_events_by on public.supplier_events(supplier_id, created_at desc);
alter table public.supplier_events enable row level security;
revoke all on public.supplier_events from anon, authenticated;

create or replace function public.sup_is_owner() returns boolean language sql stable set search_path = '' as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'yos300@gmail.com';
$$;

-- Only https links; empty → null.
create or replace function public.sup_url(v text) returns text language sql immutable as $$
  select case when v ~* '^https://[^\s]{3,}$' and char_length(v) <= 400 then v else null end;
$$;
create or replace function public.sup_txt(v text, n int) returns text language sql immutable as $$
  select nullif(left(trim(coalesce(v, '')), n), '');
$$;
create or replace function public.sup_phone(v text) returns text language sql immutable as $$
  select nullif(left(regexp_replace(coalesce(v, ''), '[^0-9+]', '', 'g'), 16), '');
$$;
create or replace function public.sup_list(p jsonb, fields text[], maxn int) returns jsonb language sql immutable as $$
  select coalesce(jsonb_agg(x order by o), '[]'::jsonb) from (
    select jsonb_strip_nulls(jsonb_build_object(
      'url', public.sup_url(e->>'url'),
      'title', public.sup_txt(e->>'title', 80),
      'text', public.sup_txt(e->>'text', 400),
      'price', public.sup_txt(e->>'price', 40)
    )) x, o
    from jsonb_array_elements(case when jsonb_typeof(p) = 'array' then p else '[]'::jsonb end) with ordinality t(e, o)
    where o <= maxn
  ) y where (('url' = any(fields)) and x ? 'url') or (not ('url' = any(fields)) and x ? 'title');
$$;

-- Public shape (no user_id, no internal flags).
create or replace function public.sup_public(s public.suppliers) returns jsonb language sql stable as $$
  select jsonb_build_object('id', s.id, 'slug', s.slug, 'plan', s.plan, 'template', s.template,
    'name', s.name, 'tagline', s.tagline, 'about', s.about, 'category', s.category, 'area', s.area, 'tags', to_jsonb(s.tags),
    'logo_url', s.logo_url, 'cover_url', s.cover_url, 'whatsapp', s.whatsapp, 'phone', s.phone,
    'instagram', s.instagram, 'facebook', s.facebook, 'tiktok', s.tiktok, 'youtube', s.youtube, 'website', s.website,
    'gallery', s.gallery, 'videos', s.videos, 'services', s.services);
$$;

create or replace function public.suppliers_public_list()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(sup_public(s) - 'gallery' - 'videos' - 'services' order by (s.plan = 'page') desc, s.created_at desc), '[]'::jsonb)
  from public.suppliers s where s.status = 'approved';
$$;

create or replace function public.supplier_public_get(p_slug text)
returns jsonb language sql stable security definer set search_path = public as $$
  select sup_public(s) from public.suppliers s where s.slug = p_slug and s.status = 'approved' limit 1;
$$;

create or replace function public.supplier_track(p_id uuid, p_kind text, p_visitor uuid default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_kind not in ('view','whatsapp','phone','social','website','card') then return; end if;
  if not exists (select 1 from public.suppliers where id = p_id and status = 'approved') then return; end if;
  insert into public.supplier_events(supplier_id, kind, visitor) values (p_id, p_kind, p_visitor);
end; $$;

-- Counts for the last p_days days.
create or replace function public.sup_stats(p_id uuid, p_days int) returns jsonb language sql stable as $$
  select jsonb_build_object(
    'by_kind', coalesce((select jsonb_object_agg(kind, n) from (select kind, count(*) n from public.supplier_events
        where supplier_id = p_id and created_at > now() - make_interval(days => p_days) group by kind) x), '{}'::jsonb),
    'visitors', (select count(distinct visitor) from public.supplier_events where supplier_id = p_id and created_at > now() - make_interval(days => p_days)));
$$;

-- The signed-in supplier's own card(s), with stats.
create or replace function public.supplier_mine()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(sup_public(s) || jsonb_build_object('status', s.status, 'page_request', s.page_request, 'stats', sup_stats(s.id, 30)) order by s.created_at), '[]'::jsonb)
  from public.suppliers s where auth.uid() is not null and s.user_id = auth.uid();
$$;

-- Create or update a card. Suppliers edit content only; the owner also sets
-- status, plan, slug and can create cards for others.
create or replace function public.supplier_save(p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare owner boolean := sup_is_owner(); uid uuid := auth.uid(); cur public.suppliers; sid uuid; slug_in text;
begin
  if uid is null and not owner then raise exception 'not_signed_in'; end if;
  if nullif(p->>'id', '') is not null then
    select * into cur from public.suppliers where id = (p->>'id')::uuid for update;
    if cur.id is null then raise exception 'not_found'; end if;
    if not owner and cur.user_id is distinct from uid then raise exception 'not_allowed'; end if;
  else
    if not owner and exists (select 1 from public.suppliers where user_id = uid) then raise exception 'already_has_card'; end if;
  end if;
  if char_length(trim(coalesce(p->>'name', ''))) < 2 then raise exception 'name_required'; end if;
  slug_in := lower(coalesce(nullif(p->>'slug', ''), ''));
  if slug_in <> '' and slug_in !~ '^[a-z0-9-]{3,40}$' then raise exception 'bad_slug'; end if;
  if slug_in <> '' and exists (select 1 from public.suppliers where slug = slug_in and id is distinct from cur.id) then raise exception 'slug_taken'; end if;

  if cur.id is null then
    insert into public.suppliers(slug, user_id, status, plan, name)
    values (case when slug_in <> '' then slug_in else 's-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8) end,
            case when owner then null else uid end,
            case when owner then coalesce(nullif(p->>'status', ''), 'approved') else 'pending' end,
            case when owner then coalesce(nullif(p->>'plan', ''), 'card') else 'card' end,
            left(trim(p->>'name'), 60))
    returning * into cur;
  end if;
  sid := cur.id;

  update public.suppliers set
    name = left(trim(p->>'name'), 60),
    tagline = sup_txt(p->>'tagline', 90),
    about = sup_txt(p->>'about', 1200),
    category = sup_txt(p->>'category', 40),
    area = sup_txt(p->>'area', 40),
    tags = coalesce((select array_agg(left(trim(t), 30)) from (select jsonb_array_elements_text(case when jsonb_typeof(p->'tags') = 'array' then p->'tags' else '[]'::jsonb end) t limit 6) x where trim(t) <> ''), '{}'),
    logo_url = sup_url(p->>'logo_url'), cover_url = sup_url(p->>'cover_url'),
    whatsapp = sup_phone(p->>'whatsapp'), phone = sup_phone(p->>'phone'),
    instagram = sup_url(p->>'instagram'), facebook = sup_url(p->>'facebook'), tiktok = sup_url(p->>'tiktok'),
    youtube = sup_url(p->>'youtube'), website = sup_url(p->>'website'),
    gallery = sup_list(p->'gallery', array['url'], 30),
    videos = sup_list(p->'videos', array['url'], 12),
    services = sup_list(p->'services', array['title'], 12),
    template = case when (p->>'template') ~ '^[1-5]$' then (p->>'template')::int else template end,
    slug = case when owner and slug_in <> '' then slug_in else slug end,
    status = case when owner and p->>'status' in ('pending','approved','hidden') then p->>'status' else status end,
    plan = case when owner and p->>'plan' in ('card','page') then p->>'plan' else plan end,
    page_request = case when owner and p->>'plan' = 'page' then false else page_request end,
    updated_at = now()
  where id = sid returning * into cur;
  return sup_public(cur) || jsonb_build_object('status', cur.status, 'page_request', cur.page_request);
end; $$;

create or replace function public.supplier_request_page(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.suppliers set page_request = true, updated_at = now()
   where id = p_id and user_id = auth.uid() and plan = 'card';
end; $$;

-- Owner only.
create or replace function public.supplier_admin_list()
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not sup_is_owner() then raise exception 'not_allowed'; end if;
  return coalesce((select jsonb_agg(sup_public(s) || jsonb_build_object('status', s.status, 'page_request', s.page_request,
      'has_user', s.user_id is not null, 'created_at', s.created_at, 'stats', sup_stats(s.id, 30))
      order by (s.status = 'pending') desc, s.page_request desc, s.created_at desc) from public.suppliers s), '[]'::jsonb);
end; $$;

create or replace function public.supplier_admin_delete(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not sup_is_owner() then raise exception 'not_allowed'; end if;
  delete from public.suppliers where id = p_id;
end; $$;

revoke all on function public.supplier_save(jsonb), public.supplier_request_page(uuid), public.supplier_admin_list(), public.supplier_admin_delete(uuid), public.supplier_mine() from public, anon;
grant execute on function public.suppliers_public_list(), public.supplier_public_get(text), public.supplier_track(uuid, text, uuid) to anon, authenticated;
grant execute on function public.supplier_save(jsonb), public.supplier_request_page(uuid), public.supplier_admin_list(), public.supplier_admin_delete(uuid), public.supplier_mine() to authenticated;

-- Images: public bucket; signed-in suppliers upload only into their own folder,
-- the owner anywhere. JPEG/PNG/WebP up to 5MB.
do $$
begin
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('supplier-media', 'supplier-media', true, 5242880, array['image/jpeg','image/png','image/webp'])
    on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg','image/png','image/webp'];
    execute 'drop policy if exists "supplier media upload" on storage.objects';
    execute 'drop policy if exists "supplier media delete" on storage.objects';
    execute $p$create policy "supplier media upload" on storage.objects for insert to authenticated
      with check (bucket_id = 'supplier-media' and ((storage.foldername(name))[1] = auth.uid()::text or public.sup_is_owner()))$p$;
    execute $p$create policy "supplier media delete" on storage.objects for delete to authenticated
      using (bucket_id = 'supplier-media' and ((storage.foldername(name))[1] = auth.uid()::text or public.sup_is_owner()))$p$;
  end if;
end $$;
