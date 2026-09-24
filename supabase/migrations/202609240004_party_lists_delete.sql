-- "מי מביא מה": the organizer can delete the whole list (owner token required).
create or replace function public.delete_party_list(p_share_code text, p_owner_token text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  delete from public.party_lists where share_code = p_share_code and owner_token = p_owner_token;
  if not found then raise exception 'not_owner'; end if;
  return true;
end; $$;

grant execute on function public.delete_party_list(text,text) to anon, authenticated;
