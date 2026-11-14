-- Page requests handled by the daily requests task (scripts/requests-inbox.mjs). Safe to run again.
update public.page_requests set status = 'done', public_title = 'חוברת לימוד תווים למתחילים', result_path = '/booklets/music-notes', done_at = coalesce(done_at, now()) where id = 39 and status in ('new', 'planned');
