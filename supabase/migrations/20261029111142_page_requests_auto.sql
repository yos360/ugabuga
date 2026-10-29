-- Page requests handled by the daily requests task (scripts/requests-inbox.mjs). Safe to run again.
update public.page_requests set status = 'done', public_title = 'דפי צביעה לסיגד — להדפסה בחינם', result_path = '/holidays/sigd/coloring', done_at = coalesce(done_at, now()) where id = 2 and status in ('new', 'planned');
