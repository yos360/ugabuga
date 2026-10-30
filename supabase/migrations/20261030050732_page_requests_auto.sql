-- Page requests handled by the daily requests task (scripts/requests-inbox.mjs). Safe to run again.
update public.page_requests set status = 'done', public_title = 'חשבון לכל הכיתות – דפי עבודה ותרגול', result_path = '/math', done_at = coalesce(done_at, now()) where id = 3 and status in ('new', 'planned');
