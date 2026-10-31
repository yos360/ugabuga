-- Page requests handled by the daily requests task (scripts/requests-inbox.mjs). Safe to run again.
update public.page_requests set status = 'done', public_title = 'חוברת חשבון — חיבור עד 20', result_path = '/booklets/add-to-20', done_at = coalesce(done_at, now()) where id = 19 and status in ('new', 'planned');
