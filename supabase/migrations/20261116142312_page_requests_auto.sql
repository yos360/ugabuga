-- Page requests handled by the daily requests task (scripts/requests-inbox.mjs). Safe to run again.
update public.page_requests set status = 'done', public_title = 'דפי עבודה לכיתה ה׳ — חוברת משולבת בכל המקצועות', result_path = '/booklets/worksheets-grade-5', done_at = coalesce(done_at, now()) where id = 40 and status in ('new', 'planned');
