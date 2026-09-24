-- "מי מביא מה" v2: stable item ids, claim/unclaim by id with a private
-- per-device token, and owner updates that never overwrite a guest's claim.

-- Root-cause fix: v1 used gen_random_bytes (pgcrypto), which on Supabase lives in
-- the "extensions" schema and is invisible under search_path=public, so every
-- create_party_list call failed. v2 uses only core functions.

-- Short, unambiguous share codes (no 0/o/1/l/i): 7 chars ≈ 34 bits.
create or replace function public.party_short_code()
returns text language plpgsql volatile as $$
declare alphabet text := 'abcdefghjkmnpqrstuvwxyz23456789'; code text; n int := 0;
begin
  loop
    code := '';
    for i in 1..7 loop code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1); end loop;
    exit when not exists (select 1 from public.party_lists where share_code = code);
    n := n + 1; if n > 20 then raise exception 'code_space_exhausted'; end if;
  end loop;
  return code;
end; $$;

alter table public.party_lists alter column share_code set default public.party_short_code();

-- Give every existing item a stable id.
update public.party_lists pl set items = (
  select coalesce(jsonb_agg(
    case when e ? 'id' then e else e || jsonb_build_object('id', substr(replace(gen_random_uuid()::text,'-',''),1,12)) end
    order by ord), '[]'::jsonb)
  from jsonb_array_elements(pl.items) with ordinality as t(e, ord)
) where exists (select 1 from jsonb_array_elements(pl.items) e where not (e ? 'id'));

-- Items as the public sees them: never expose claim tokens.
create or replace function public.party_items_public(p_items jsonb)
returns jsonb language sql immutable as $$
  select coalesce(jsonb_agg((e - 'claimToken') order by ord), '[]'::jsonb)
  from jsonb_array_elements(coalesce(p_items,'[]'::jsonb)) with ordinality as t(e, ord);
$$;

create or replace function public.party_items_with_ids(p_items jsonb)
returns jsonb language sql volatile as $$
  select coalesce(jsonb_agg(
    case when coalesce(e->>'id','') <> '' then e else e || jsonb_build_object('id', substr(replace(gen_random_uuid()::text,'-',''),1,12)) end
    order by ord), '[]'::jsonb)
  from jsonb_array_elements(coalesce(p_items,'[]'::jsonb)) with ordinality as t(e, ord);
$$;

create or replace function public.create_party_list2(p_owner_token text, p_title text, p_items jsonb)
returns table (share_code text, title text, items jsonb)
language plpgsql security definer set search_path = public as $$
begin
  return query insert into public.party_lists(share_code, owner_token, title, items)
  values (party_short_code(), p_owner_token, left(coalesce(nullif(trim(p_title),''),'הרשימה שלנו'), 80), party_items_with_ids(p_items))
  returning party_lists.share_code, party_lists.title, party_items_public(party_lists.items);
end; $$;

create or replace function public.get_party_list2(p_share_code text)
returns table (share_code text, title text, items jsonb, updated_at timestamptz)
language sql stable security definer set search_path = public as $$
  select share_code, title, party_items_public(items), updated_at
  from public.party_lists where share_code = p_share_code limit 1;
$$;

-- Owner saves the list's structure. Claims always come from the server copy,
-- so a stale owner tab can't wipe a guest's claim. p_release = item ids the
-- owner explicitly freed. An owner may pre-assign a name to a free item.
create or replace function public.update_party_list2(p_share_code text, p_owner_token text, p_title text, p_items jsonb, p_release text[] default '{}')
returns table (share_code text, title text, items jsonb, updated_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare server_items jsonb; merged jsonb;
begin
  select pl.items into server_items from public.party_lists pl
   where pl.share_code = p_share_code and pl.owner_token = p_owner_token for update;
  if server_items is null then raise exception 'not_owner'; end if;
  select coalesce(jsonb_agg(
    case
      when s.e is not null and coalesce(s.e->>'takenBy','') <> '' and not (n.e->>'id' = any(coalesce(p_release,'{}')))
        then jsonb_build_object('id', n.e->>'id', 'text', n.e->>'text', 'takenBy', s.e->>'takenBy')
             || case when s.e ? 'claimToken' then jsonb_build_object('claimToken', s.e->'claimToken') else '{}'::jsonb end
      else jsonb_build_object('id', n.e->>'id', 'text', n.e->>'text', 'takenBy', coalesce(nullif(trim(n.e->>'takenBy'),''), ''))
    end order by n.ord), '[]'::jsonb)
  into merged
  from jsonb_array_elements(party_items_with_ids(p_items)) with ordinality as n(e, ord)
  left join lateral (select x as e from jsonb_array_elements(server_items) x where x->>'id' = n.e->>'id' limit 1) s on true;
  return query update public.party_lists pl
     set title = coalesce(nullif(trim(p_title),''), pl.title), items = merged, updated_at = now()
   where pl.share_code = p_share_code
   returning pl.share_code, pl.title, party_items_public(pl.items), pl.updated_at;
end; $$;

create or replace function public.claim_party_item2(p_share_code text, p_item_id text, p_name text, p_claim_token text)
returns table (share_code text, title text, items jsonb, updated_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare cur jsonb; idx int;
begin
  if nullif(trim(p_name),'') is null then raise exception 'name_required'; end if;
  select pl.items into cur from public.party_lists pl where pl.share_code = p_share_code for update;
  if cur is null then raise exception 'list_not_found'; end if;
  select ord - 1 into idx from jsonb_array_elements(cur) with ordinality t(e, ord) where e->>'id' = p_item_id limit 1;
  if idx is null then raise exception 'item_not_found'; end if;
  if coalesce(cur->idx->>'takenBy','') <> '' then raise exception 'item_already_taken'; end if;
  cur := jsonb_set(cur, array[idx::text], (cur->idx) || jsonb_build_object('takenBy', left(trim(p_name), 40), 'claimToken', p_claim_token));
  return query update public.party_lists pl set items = cur, updated_at = now()
   where pl.share_code = p_share_code returning pl.share_code, pl.title, party_items_public(pl.items), pl.updated_at;
end; $$;

create or replace function public.unclaim_party_item(p_share_code text, p_item_id text, p_claim_token text)
returns table (share_code text, title text, items jsonb, updated_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare cur jsonb; idx int;
begin
  select pl.items into cur from public.party_lists pl where pl.share_code = p_share_code for update;
  if cur is null then raise exception 'list_not_found'; end if;
  select ord - 1 into idx from jsonb_array_elements(cur) with ordinality t(e, ord) where e->>'id' = p_item_id limit 1;
  if idx is null then raise exception 'item_not_found'; end if;
  if coalesce(cur->idx->>'claimToken','') = '' or cur->idx->>'claimToken' <> p_claim_token then raise exception 'not_your_claim'; end if;
  cur := jsonb_set(cur, array[idx::text], ((cur->idx) - 'claimToken') || jsonb_build_object('takenBy',''));
  return query update public.party_lists pl set items = cur, updated_at = now()
   where pl.share_code = p_share_code returning pl.share_code, pl.title, party_items_public(pl.items), pl.updated_at;
end; $$;

-- The old index-based functions stay for any open v1 tabs, but must never leak tokens.
create or replace function public.get_party_list(p_share_code text)
returns table (share_code text, title text, items jsonb)
language sql stable security definer set search_path = public as $$
  select share_code, title, party_items_public(items) from public.party_lists where share_code = p_share_code limit 1;
$$;

grant execute on function public.create_party_list2(text,text,jsonb) to anon, authenticated;
grant execute on function public.get_party_list2(text) to anon, authenticated;
grant execute on function public.update_party_list2(text,text,text,jsonb,text[]) to anon, authenticated;
grant execute on function public.claim_party_item2(text,text,text,text) to anon, authenticated;
grant execute on function public.unclaim_party_item(text,text,text) to anon, authenticated;
