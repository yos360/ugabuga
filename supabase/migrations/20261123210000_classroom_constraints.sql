-- Google Classroom share channel, step 1 of 3: the check constraints (split out so a lock problem on the
-- (Re-applied 23.11.2026 after the combined file failed.)
-- busy owner_site_activity table cannot block the report function). NOT VALID: old rows are not rescanned.
set lock_timeout = '20s';
alter table public.owner_site_activity drop constraint if exists owner_site_activity_channel_check;
alter table public.owner_site_activity add constraint owner_site_activity_channel_check
  check (channel is null or channel in ('whatsapp','facebook','native','copy','email','native_done','from_share','classroom')) not valid;

alter table public.owner_site_activity drop constraint if exists owner_site_activity_source_check;
alter table public.owner_site_activity add constraint owner_site_activity_source_check
  check (source is null or source in ('direct','internal','google','bing','facebook','instagram','whatsapp','tiktok','youtube','email','qr','other','classroom')) not valid;
