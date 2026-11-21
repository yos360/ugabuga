-- Page requests handled by the daily requests task (scripts/requests-inbox.mjs). Safe to run again.
update public.page_requests set status = 'done', public_title = 'חנויות — חוברת קריאה וחשבון לכיתה ב׳', result_path = '/booklets/stores-grade-2', done_at = coalesce(done_at, now()) where id = 44 and status in ('new', 'planned');
