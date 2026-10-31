-- Page requests handled by the daily requests task (scripts/requests-inbox.mjs). Safe to run again.
update public.page_requests set status = 'done', public_title = 'הבנת הנקרא — קטעים עם שאלות לכיתות א׳–ח׳', result_path = '/learn/reading', done_at = coalesce(done_at, now()) where id = 18 and status in ('new', 'planned');
