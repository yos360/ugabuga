-- Page requests handled by the daily requests task (scripts/requests-inbox.mjs). Safe to run again.
update public.page_requests set status = 'done', public_title = 'חוברת תנועות וניקוד — עמוד לחיריק', result_path = '/booklets/nikud', done_at = coalesce(done_at, now()) where id = 17 and status in ('new', 'planned');
