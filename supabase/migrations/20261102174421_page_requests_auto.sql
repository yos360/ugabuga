-- Page requests handled by the daily requests task (scripts/requests-inbox.mjs). Safe to run again.
update public.page_requests set status = 'done', public_title = 'לשון לכיתה ה׳ — שיעורים וחוברת עבודה להדפסה', result_path = '/learn/lashon/grade-5', done_at = coalesce(done_at, now()) where id = 27 and status in ('new', 'planned');
