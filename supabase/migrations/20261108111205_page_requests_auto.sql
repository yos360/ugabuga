-- Page requests handled by the daily requests task (scripts/requests-inbox.mjs). Safe to run again.
update public.page_requests set status = 'done', public_title = 'חוברת תרגול לחיזוק שרירי הפה', result_path = '/booklets/oral-motor', done_at = coalesce(done_at, now()) where id = 32 and status in ('new', 'planned');
