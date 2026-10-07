-- Live owner report: send new rows of owner_site_activity over Supabase Realtime.
-- Realtime applies the table's RLS, so only the owner (policy owner_full_activity_report)
-- receives anything; anonymous visitors still can't read the table.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'owner_site_activity'
  ) then
    alter publication supabase_realtime add table public.owner_site_activity;
  end if;
end $$;
