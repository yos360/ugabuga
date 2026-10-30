-- Page requests handled by the daily requests task (scripts/requests-inbox.mjs). Safe to run again.
update public.page_requests set status = 'done', public_title = 'זיכרון ופאזל פירות הדר עם ניקוד', result_path = '/online-games/memory-citrus', done_at = coalesce(done_at, now()) where id = 16 and status in ('new', 'planned');
