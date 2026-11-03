-- Page requests handled by the daily requests task (scripts/requests-inbox.mjs). Safe to run again.
update public.page_requests set status = 'done', public_title = 'חוברת טקסטים קצרים בניקוד — פתח, קמץ, שווא וחיריק', result_path = '/booklets/nikud-short-texts', done_at = coalesce(done_at, now()) where id = 29 and status in ('new', 'planned');
