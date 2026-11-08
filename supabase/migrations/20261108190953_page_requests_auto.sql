-- Page requests handled by the daily requests task (scripts/requests-inbox.mjs). Safe to run again.
update public.page_requests set status = 'done', public_title = 'בוחן לוח הכפל — כפולות 1 עד 6', result_path = '/learn/multiplication-table/quiz', done_at = coalesce(done_at, now()) where id = 37 and status in ('new', 'planned');
