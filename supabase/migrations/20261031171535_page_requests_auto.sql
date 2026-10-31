-- Page requests handled by the daily requests task (scripts/requests-inbox.mjs). Safe to run again.
update public.page_requests set status = 'done', public_title = 'חוברת כלי תחבורה לגן חובה', result_path = '/booklets/transport-kindergarten', done_at = coalesce(done_at, now()) where id = 20 and status in ('new', 'planned');
