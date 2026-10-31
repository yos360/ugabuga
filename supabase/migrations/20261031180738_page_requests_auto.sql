-- Page requests handled by the daily requests task (scripts/requests-inbox.mjs). Safe to run again.
update public.page_requests set status = 'done', public_title = 'הבנת הנקרא — קטעי קריאה עם שאלות', result_path = '/learn/reading', done_at = coalesce(done_at, now()) where id = 21 and status in ('new', 'planned');
update public.page_requests set status = 'done', public_title = 'הבנת הנקרא לכיתה ב׳', result_path = '/learn/reading/grade-2', done_at = coalesce(done_at, now()) where id = 22 and status in ('new', 'planned');
