-- Page requests handled by the daily requests task (scripts/requests-inbox.mjs). Safe to run again.
update public.page_requests set status = 'done', public_title = 'דפי עבודה לחנוכה לכיתה ה׳', result_path = '/holidays/hanukkah/grade/grade-5', done_at = coalesce(done_at, now()) where id = 48 and status in ('new', 'planned');
