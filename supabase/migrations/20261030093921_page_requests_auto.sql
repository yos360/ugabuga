-- Page requests handled by the daily requests task (scripts/requests-inbox.mjs). Safe to run again.
update public.page_requests set status = 'declined' where id in (6, 7, 8) and status in ('new', 'planned');
