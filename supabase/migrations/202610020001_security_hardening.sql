-- Security hardening (2026-10-02 site audit). Safe to run more than once.

-- 1) Party lists ("מי מביא מה"): the first-version functions are still callable by anyone with the
--    link. claim_party_item (v1) returns the raw items, including every guest's private claimToken,
--    which would let a visitor remove other guests' claims; update/create v1 also skip the newer
--    validation. The site only uses the v2–v4 functions, so close the v1 ones.
revoke execute on function public.claim_party_item(text, integer, text) from public, anon, authenticated;
revoke execute on function public.update_party_list(text, text, text, jsonb) from public, anon, authenticated;
revoke execute on function public.create_party_list(text, text, jsonb) from public, anon, authenticated;

-- 2) Suppliers: an approved supplier's edits (name, about, images, links, videos) went live on the
--    public page immediately. Same function as 202609240007_suppliers.sql, except that a supplier's own
--    edit to an approved card sets it back to 'pending' until the owner approves it again.
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
    -- A supplier's own edit to a live card goes back to review: nothing new reaches the public page unchecked.
    status = case when owner and p->>'status' in ('pending','approved','hidden') then p->>'status'
                  when not owner and status = 'approved' then 'pending' else status end,
    plan = case when owner and p->>'plan' in ('card','page') then p->>'plan' else plan end,
    page_request = case when owner and p->>'plan' = 'page' then false else page_request end,
    updated_at = now()
  where id = sid returning * into cur;
  return sup_public(cur) || jsonb_build_object('status', cur.status, 'page_request', cur.page_request);
end; $$;
