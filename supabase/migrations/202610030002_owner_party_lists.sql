-- Owner report: see the "מי מביא מה" lists people created (title, details, items and
-- who is bringing what). Owner account only; claim/owner tokens are never returned.
create or replace function public.owner_party_lists(p_limit int default 200)
returns table (share_code text, title text, items jsonb, details jsonb, created_at timestamptz, updated_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then
    raise exception 'not_owner';
  end if;
  return query
    select pl.share_code, pl.title, public.party_items_public(pl.items), pl.details, pl.created_at, pl.updated_at
    from public.party_lists pl
    order by pl.updated_at desc
    limit least(greatest(coalesce(p_limit, 200), 1), 500);
end;
$$;
revoke execute on function public.owner_party_lists(int) from public, anon;
grant execute on function public.owner_party_lists(int) to authenticated;
