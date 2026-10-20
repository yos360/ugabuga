-- A safe public social-proof counter for the home page. It reveals exactly one aggregate:
-- total A4 sheets sent to the print dialog or successfully exported as PDF; no visitor, URL or
-- activity rows are exposed. Older activity rows count as one sheet when they predate page counts.
create or replace function public.public_total_printed_sheets()
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(sum(coalesce(pages, 1)), 0)::bigint
  from public.owner_site_activity
  where action in ('print', 'download');
$$;

revoke all on function public.public_total_printed_sheets() from public;
grant execute on function public.public_total_printed_sheets() to anon, authenticated;

notify pgrst, 'reload schema';
