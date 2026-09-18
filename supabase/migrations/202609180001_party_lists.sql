create extension if not exists pgcrypto;

create table if not exists public.party_lists (
  id uuid primary key default gen_random_uuid(),
  share_code text not null unique default encode(gen_random_bytes(9), 'base64'),
  owner_token text not null,
  title text not null default 'מסיבת סוף שנה',
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.party_lists enable row level security;

create or replace function public.create_party_list(p_owner_token text, p_title text, p_items jsonb)
returns table (share_code text, title text, items jsonb)
language plpgsql security definer set search_path = public as $$
begin
  return query insert into public.party_lists(owner_token, title, items)
  values (p_owner_token, coalesce(nullif(p_title,''),'מסיבת סוף שנה'), coalesce(p_items,'[]'::jsonb))
  returning party_lists.share_code, party_lists.title, party_lists.items;
end; $$;

create or replace function public.get_party_list(p_share_code text)
returns table (share_code text, title text, items jsonb)
language sql stable security definer set search_path = public as $$
  select share_code, title, items from public.party_lists where share_code = p_share_code limit 1;
$$;

create or replace function public.update_party_list(p_share_code text, p_owner_token text, p_title text, p_items jsonb)
returns table (share_code text, title text, items jsonb)
language sql security definer set search_path = public as $$
  update public.party_lists set title = coalesce(nullif(p_title,''), title), items = coalesce(p_items, items), updated_at = now()
  where share_code = p_share_code and owner_token = p_owner_token
  returning share_code, title, items;
$$;

create or replace function public.claim_party_item(p_share_code text, p_index integer, p_name text)
returns table (share_code text, title text, items jsonb)
language plpgsql security definer set search_path = public as $$
declare current_items jsonb;
begin
  if nullif(trim(p_name),'') is null then raise exception 'name_required'; end if;
  select items into current_items from public.party_lists where party_lists.share_code = p_share_code for update;
  if current_items is null or p_index < 0 or p_index >= jsonb_array_length(current_items) then raise exception 'item_not_found'; end if;
  if coalesce(current_items->p_index->>'takenBy','') <> '' then raise exception 'item_already_taken'; end if;
  current_items := jsonb_set(current_items, array[p_index::text, 'takenBy'], to_jsonb(trim(p_name)), false);
  return query update public.party_lists set items = current_items, updated_at = now()
    where party_lists.share_code = p_share_code returning party_lists.share_code, party_lists.title, party_lists.items;
end; $$;

revoke all on public.party_lists from anon, authenticated;
grant execute on function public.create_party_list(text,text,jsonb) to anon, authenticated;
grant execute on function public.get_party_list(text) to anon, authenticated;
grant execute on function public.update_party_list(text,text,text,jsonb) to anon, authenticated;
grant execute on function public.claim_party_item(text,integer,text) to anon, authenticated;
