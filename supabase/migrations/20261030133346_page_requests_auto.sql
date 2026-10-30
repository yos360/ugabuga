-- Page requests handled by the daily requests task (scripts/requests-inbox.mjs). Safe to run again.
update public.page_requests set status = 'done', public_title = 'חוברת חשבון 1–10 — צביעה, מדבקות וגזירה', result_path = '/booklets/math-special-ed', done_at = coalesce(done_at, now()) where id = 15 and status in ('new', 'planned');
