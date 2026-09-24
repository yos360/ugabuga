-- "מי מביא מה" v3: event details (date/time/place/note) and richer items
-- (category, recommended quantity, arrived flag). Additive only.

alter table public.party_lists add column if not exists details jsonb not null default '{}'::jsonb;

-- Keep only known, short detail fields.
create or replace function public.party_clean_details(p jsonb)
returns jsonb language sql immutable as $$
  select jsonb_strip_nulls(jsonb_build_object(
    'date',  nullif(left(trim(coalesce(p->>'date','')), 20), ''),
    'time',  nullif(left(trim(coalesce(p->>'time','')), 10), ''),
    'place', nullif(left(trim(coalesce(p->>'place','')), 80), ''),
    'note',  nullif(left(trim(coalesce(p->>'note','')), 300), '')
  ));
$$;

create or replace function public.create_party_list3(p_owner_token text, p_title text, p_items jsonb, p_details jsonb)
returns table (share_code text, title text, items jsonb, details jsonb, updated_at timestamptz)
language plpgsql security definer set search_path = public as $$
begin
  return query insert into public.party_lists(share_code, owner_token, title, items, details)
  values (party_short_code(), p_owner_token, left(coalesce(nullif(trim(p_title),''),'הרשימה שלנו'), 80),
          party_items_with_ids(p_items), party_clean_details(coalesce(p_details,'{}'::jsonb)))
  returning party_lists.share_code, party_lists.title, party_items_public(party_lists.items), party_lists.details, party_lists.updated_at;
end; $$;

create or replace function public.get_party_list3(p_share_code text)
returns table (share_code text, title text, items jsonb, details jsonb, updated_at timestamptz)
language sql stable security definer set search_path = public as $$
  select share_code, title, party_items_public(items), details, updated_at
  from public.party_lists where share_code = p_share_code limit 1;
$$;

-- Owner saves structure (text, category, quantity, arrived). Claims always come
-- from the server copy unless the owner explicitly released the item.
create or replace function public.update_party_list3(p_share_code text, p_owner_token text, p_title text, p_items jsonb, p_release text[], p_details jsonb)
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
         when s.e is not null and coalesce(s.e->>'takenBy','') <> '' and not (n.e->>'id' = any(coalesce(p_release,'{}')))
           then jsonb_build_object('takenBy', s.e->>'takenBy',
                                   'arrived', coalesce((n.e->>'arrived')::boolean, false))
                || case when s.e ? 'claimToken' then jsonb_build_object('claimToken', s.e->'claimToken') else '{}'::jsonb end
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

grant execute on function public.create_party_list3(text,text,jsonb,jsonb) to anon, authenticated;
grant execute on function public.get_party_list3(text) to anon, authenticated;
grant execute on function public.update_party_list3(text,text,text,jsonb,text[],jsonb) to anon, authenticated;
