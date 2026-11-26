-- Founding-supplier program: the first 50 suppliers to open a card become "ספק מייסד" automatically
-- and get a reduced price for life once paid plans open. Safe to run again.

-- Existing approved suppliers (אלוף המצגות, פרופטה צילום) are founders.
update public.suppliers set founder = true where status = 'approved' and not founder;

-- New cards: founder while fewer than 50 founders exist.
create or replace function public.sup_auto_founder() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not new.founder and (select count(*) from public.suppliers where founder) < 50 then
    new.founder := true;
  end if;
  return new;
end; $$;
drop trigger if exists suppliers_auto_founder on public.suppliers;
create trigger suppliers_auto_founder before insert on public.suppliers
  for each row execute function public.sup_auto_founder();

-- Public counter for the offer: how many founding places are taken.
create or replace function public.founding_suppliers_status() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('limit', 50, 'taken', least(50, (select count(*) from public.suppliers where founder)));
$$;
revoke all on function public.founding_suppliers_status() from public;
grant execute on function public.founding_suppliers_status() to anon, authenticated;
revoke all on function public.sup_auto_founder() from public, anon, authenticated;
