-- "מי מביא מה" v4: several guests can split one item ("6 בקבוקים" → דנה 2, יוסי 4).
-- The needed amount is the leading number of the item's quantity text (default 1).
-- Each item may carry claims: [{ id, name, count, t }] where t is the private
-- per-device token (never returned to clients). Also includes the owner delete.

create or replace function public.party_item_need(p_qty text)
returns int language sql immutable as $$
  select least(greatest(coalesce((substring(coalesce(p_qty,'') from '^\s*(\d{1,3})'))::int, 1), 1), 99);
$$;

create or replace function public.party_item_taken(e jsonb)
returns int language sql immutable as $$
  select (case when coalesce(e->>'takenBy','') <> '' then party_item_need(e->>'qty') else 0 end)
       + coalesce((select sum(greatest(coalesce((c->>'count')::int, 0), 0))
                     from jsonb_array_elements(case when jsonb_typeof(e->'claims') = 'array' then e->'claims' else '[]'::jsonb end) c), 0)::int;
$$;

-- Items as the public sees them: no claim tokens anywhere.
create or replace function public.party_items_public(p_items jsonb)
returns jsonb language sql immutable as $$
  select coalesce(jsonb_agg(
    (e - 'claimToken')
    || case when jsonb_typeof(e->'claims') = 'array'
         then jsonb_build_object('claims', (select coalesce(jsonb_agg(c - 't' order by o), '[]'::jsonb) from jsonb_array_elements(e->'claims') with ordinality x(c, o)))
         else '{}'::jsonb end
    order by ord), '[]'::jsonb)
  from jsonb_array_elements(coalesce(p_items,'[]'::jsonb)) with ordinality as t(e, ord);
$$;

create or replace function public.claim_party_item4(p_share_code text, p_item_id text, p_name text, p_count int, p_claim_id text, p_claim_token text)
returns table (share_code text, title text, items jsonb, details jsonb, updated_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare cur jsonb; idx int; it jsonb; need int; taken int; cl jsonb; mine int; cnt int := greatest(coalesce(p_count, 1), 1);
begin
  if nullif(trim(p_name),'') is null then raise exception 'name_required'; end if;
  if coalesce(p_claim_token,'') = '' or coalesce(p_claim_id,'') = '' then raise exception 'token_required'; end if;
  select pl.items into cur from public.party_lists pl where pl.share_code = p_share_code for update;
  if cur is null then raise exception 'list_not_found'; end if;
  select ord - 1 into idx from jsonb_array_elements(cur) with ordinality t(e, ord) where e->>'id' = p_item_id limit 1;
  if idx is null then raise exception 'item_not_found'; end if;
  it := cur->idx; need := party_item_need(it->>'qty'); taken := party_item_taken(it);
  if cnt > need - taken then raise exception 'item_already_taken'; end if;
  cl := case when jsonb_typeof(it->'claims') = 'array' then it->'claims' else '[]'::jsonb end;
  select ord - 1 into mine from jsonb_array_elements(cl) with ordinality t(c, ord) where c->>'id' = p_claim_id limit 1;
  if mine is not null then
    if cl->mine->>'t' is distinct from p_claim_token then raise exception 'not_your_claim'; end if;
    cl := jsonb_set(cl, array[mine::text], (cl->mine) || jsonb_build_object('count', coalesce((cl->mine->>'count')::int, 0) + cnt, 'name', left(trim(p_name), 40)));
  else
    cl := cl || jsonb_build_array(jsonb_build_object('id', left(p_claim_id, 24), 'name', left(trim(p_name), 40), 'count', cnt, 't', p_claim_token));
  end if;
  cur := jsonb_set(cur, array[idx::text], it || jsonb_build_object('claims', cl));
  return query update public.party_lists pl set items = cur, updated_at = now()
   where pl.share_code = p_share_code
   returning pl.share_code, pl.title, party_items_public(pl.items), pl.details, pl.updated_at;
end; $$;

-- Remove my whole claim on an item (also handles pre-v4 single claims).
create or replace function public.unclaim_party_item4(p_share_code text, p_item_id text, p_claim_id text, p_claim_token text)
returns table (share_code text, title text, items jsonb, details jsonb, updated_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare cur jsonb; idx int; it jsonb; cl jsonb; kept jsonb;
begin
  if coalesce(p_claim_token,'') = '' then raise exception 'not_your_claim'; end if;
  select pl.items into cur from public.party_lists pl where pl.share_code = p_share_code for update;
  if cur is null then raise exception 'list_not_found'; end if;
  select ord - 1 into idx from jsonb_array_elements(cur) with ordinality t(e, ord) where e->>'id' = p_item_id limit 1;
  if idx is null then raise exception 'item_not_found'; end if;
  it := cur->idx;
  if coalesce(it->>'claimToken','') in (p_claim_token, coalesce(p_claim_id,'') || '.' || p_claim_token) then
    it := (it - 'claimToken') || jsonb_build_object('takenBy', '');
  else
    cl := case when jsonb_typeof(it->'claims') = 'array' then it->'claims' else '[]'::jsonb end;
    select coalesce(jsonb_agg(c order by o), '[]'::jsonb) into kept from jsonb_array_elements(cl) with ordinality x(c, o)
     where not (c->>'id' = coalesce(p_claim_id,'') and c->>'t' = p_claim_token);
    if jsonb_array_length(kept) = jsonb_array_length(cl) then raise exception 'not_your_claim'; end if;
    it := it || jsonb_build_object('claims', kept);
  end if;
  if party_item_taken(it) = 0 then it := it || jsonb_build_object('arrived', false); end if;
  cur := jsonb_set(cur, array[idx::text], it);
  return query update public.party_lists pl set items = cur, updated_at = now()
   where pl.share_code = p_share_code
   returning pl.share_code, pl.title, party_items_public(pl.items), pl.details, pl.updated_at;
end; $$;

-- Owner saves structure. Claims (single and split) always come from the server
-- copy unless the owner explicitly released the item.
create or replace function public.update_party_list4(p_share_code text, p_owner_token text, p_title text, p_items jsonb, p_release text[], p_details jsonb)
returns table (share_code text, title text, items jsonb, details jsonb, updated_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare server_items jsonb; merged jsonb;
begin
  select pl.items into server_items from public.party_lists pl
   where pl.share_code = p_share_code and pl.owner_token = p_owner_token for update;
  if server_items is null then raise exception 'not_owner'; end if;
  select coalesce(jsonb_agg(
    jsonb_strip_nulls(jsonb_build_object(
      'id', n.e->>'id',
      'text', left(coalesce(n.e->>'text',''), 80),
      'cat', nullif(left(coalesce(n.e->>'cat',''), 40), ''),
      'qty', nullif(left(coalesce(n.e->>'qty',''), 30), '')
    ))
    || case
         when s.e is not null and not (n.e->>'id' = any(coalesce(p_release,'{}'))) and party_item_taken(s.e) > 0 then
           jsonb_build_object('takenBy', coalesce(s.e->>'takenBy',''), 'arrived', coalesce((n.e->>'arrived')::boolean, false))
           || case when s.e ? 'claimToken' then jsonb_build_object('claimToken', s.e->'claimToken') else '{}'::jsonb end
           || case when jsonb_typeof(s.e->'claims') = 'array' then jsonb_build_object('claims', s.e->'claims') else '{}'::jsonb end
         else jsonb_build_object('takenBy', left(coalesce(nullif(trim(n.e->>'takenBy'),''), ''), 40), 'arrived', false)
       end
    order by n.ord), '[]'::jsonb)
  into merged
  from jsonb_array_elements(party_items_with_ids(p_items)) with ordinality as n(e, ord)
  left join lateral (select x as e from jsonb_array_elements(server_items) x where x->>'id' = n.e->>'id' limit 1) s on true;
  return query update public.party_lists pl
     set title = coalesce(nullif(trim(p_title),''), pl.title), items = merged,
         details = case when p_details is null then pl.details else party_clean_details(p_details) end,
         updated_at = now()
   where pl.share_code = p_share_code
   returning pl.share_code, pl.title, party_items_public(pl.items), pl.details, pl.updated_at;
end; $$;

create or replace function public.delete_party_list(p_share_code text, p_owner_token text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  delete from public.party_lists where share_code = p_share_code and owner_token = p_owner_token;
  if not found then raise exception 'not_owner'; end if;
  return true;
end; $$;

grant execute on function public.claim_party_item4(text,text,text,int,text,text) to anon, authenticated;
grant execute on function public.unclaim_party_item4(text,text,text,text) to anon, authenticated;
grant execute on function public.update_party_list4(text,text,text,jsonb,text[],jsonb) to anon, authenticated;
grant execute on function public.delete_party_list(text,text) to anon, authenticated;
