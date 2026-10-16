-- Explicitly keep owner inbox functions out of the anonymous API role.
revoke execute on function public.site_chat_owner_list(int) from public, anon;
revoke execute on function public.site_chat_owner_reply(uuid, text) from public, anon;
revoke execute on function public.site_chat_owner_status(uuid, text) from public, anon;
grant execute on function public.site_chat_owner_list(int) to authenticated;
grant execute on function public.site_chat_owner_reply(uuid, text) to authenticated;
grant execute on function public.site_chat_owner_status(uuid, text) to authenticated;
