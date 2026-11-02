-- "רשימת קניות משותפת": a shopping list anyone holding its link can edit (the couple shares one link).
-- The code is 16 random hex characters (64 bits), so a list can't be guessed. The table is closed to
-- direct access; every change goes through one small function that edits the row atomically, so two
-- phones adding or ticking at the same moment never overwrite each other. Safe to run again.

create table if not exists public.shopping_lists (
  code text primary key,
  title text not null default 'רשימת קניות',
  items jsonb not null default '[]'::jsonb,
  version integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists shopping_lists_updated_at on public.shopping_lists (updated_at);
alter table public.shopping_lists enable row level security;
revoke all on table public.shopping_lists from anon, authenticated;

create or replace function public.shop_json(l public.shopping_lists)
returns jsonb language sql immutable set search_path = '' as $$
  select jsonb_build_object('code', l.code, 'title', l.title, 'items', l.items, 'version', l.version, 'updated_at', l.updated_at);
$$;

-- Item text: trimmed, 1–80 characters, no links (keeps the lists from being used for spam).
create or replace function public.shop_clean_text(p text)
returns text language plpgsql immutable set search_path = '' as $$
declare t text := left(trim(regexp_replace(coalesce(p, ''), '\s+', ' ', 'g')), 80);
begin
  if t = '' then raise exception 'text_required'; end if;
  if t ~* '(https?://|www\.)' then raise exception 'no_links'; end if;
  return t;
end; $$;

create or replace function public.shop_create(p_title text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare l public.shopping_lists;
begin
  -- Lists nobody touched for half a year are dropped.
  delete from public.shopping_lists where updated_at < now() - interval '180 days';
  insert into public.shopping_lists (code, title)
  values (left(replace(gen_random_uuid()::text, '-', ''), 16), left(coalesce(nullif(trim(p_title), ''), 'רשימת קניות'), 60))
  returning * into l;
  return public.shop_json(l);
end; $$;

create or replace function public.shop_get(p_code text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare l public.shopping_lists;
begin
  select * into l from public.shopping_lists where code = p_code;
  if l.code is null then raise exception 'list_not_found'; end if;
  return public.shop_json(l);
end; $$;

-- One entry point for every change: p_op is add | done | undone | remove | clear_done | rename.
create or replace function public.shop_change(p_code text, p_op text, p_id text default null, p_text text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare l public.shopping_lists; next_items jsonb; next_title text;
begin
  select * into l from public.shopping_lists where code = p_code for update;
  if l.code is null then raise exception 'list_not_found'; end if;
  next_items := l.items; next_title := l.title;
  if p_op = 'add' then
    if jsonb_array_length(l.items) >= 300 then raise exception 'list_full'; end if;
    next_items := l.items || jsonb_build_array(jsonb_build_object(
      'id', coalesce(nullif(left(p_id, 24), ''), left(replace(gen_random_uuid()::text, '-', ''), 12)),
      'text', public.shop_clean_text(p_text), 'done', false));
  elsif p_op in ('done', 'undone') then
    select coalesce(jsonb_agg(case when e->>'id' = p_id then jsonb_set(e, '{done}', to_jsonb(p_op = 'done')) else e end order by n), '[]'::jsonb)
      into next_items from jsonb_array_elements(l.items) with ordinality as x(e, n);
  elsif p_op = 'remove' then
    select coalesce(jsonb_agg(e order by n), '[]'::jsonb) into next_items
      from jsonb_array_elements(l.items) with ordinality as x(e, n) where e->>'id' is distinct from p_id;
  elsif p_op = 'clear_done' then
    select coalesce(jsonb_agg(e order by n), '[]'::jsonb) into next_items
      from jsonb_array_elements(l.items) with ordinality as x(e, n) where not coalesce((e->>'done')::boolean, false);
  elsif p_op = 'rename' then
    next_title := left(coalesce(nullif(trim(p_text), ''), 'רשימת קניות'), 60);
    if next_title ~* '(https?://|www\.)' then raise exception 'no_links'; end if;
  else
    raise exception 'bad_op';
  end if;
  update public.shopping_lists set items = next_items, title = next_title, version = version + 1, updated_at = now()
   where code = p_code returning * into l;
  return public.shop_json(l);
end; $$;

revoke all on function public.shop_json(public.shopping_lists) from public, anon, authenticated;
revoke all on function public.shop_clean_text(text) from public, anon, authenticated;
revoke all on function public.shop_create(text) from public;
revoke all on function public.shop_get(text) from public;
revoke all on function public.shop_change(text, text, text, text) from public;
grant execute on function public.shop_create(text) to anon, authenticated;
grant execute on function public.shop_get(text) to anon, authenticated;
grant execute on function public.shop_change(text, text, text, text) to anon, authenticated;
