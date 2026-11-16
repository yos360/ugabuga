-- Page requests handled by the daily requests task (scripts/requests-inbox.mjs). Safe to run again.
update public.page_requests set status = 'done', public_title = 'אנזימים — חוברת מדעים לכיתה ט׳', result_path = '/booklets/enzymes-grade-9', done_at = coalesce(done_at, now()) where id = 42 and status in ('new', 'planned');
