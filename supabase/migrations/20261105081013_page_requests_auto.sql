-- Page requests handled by the daily requests task (scripts/requests-inbox.mjs). Safe to run again.
update public.page_requests set status = 'done', public_title = 'דפי עבודה במדעים לכיתה ה׳: משאבי טבע, משאבים מתחדשים ומתכלים', result_path = '/booklets/science-grade-5-natural-resources', done_at = coalesce(done_at, now()) where id = 30 and status in ('new', 'planned');
