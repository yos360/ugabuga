-- Page requests handled by the daily requests task (scripts/requests-inbox.mjs). Safe to run again.
update public.page_requests set status = 'done', public_title = 'חוברת חשבון ראשונה לגיל 4–5', result_path = '/booklets/first-math-age-4', done_at = coalesce(done_at, now()) where id = 24 and status in ('new', 'planned');
update public.page_requests set status = 'done', public_title = 'חוברת חשבון לכיתה א׳ — השוואה, חיבור וחיסור עד 20', result_path = '/booklets/math-grade-1-compare', done_at = coalesce(done_at, now()) where id = 25 and status in ('new', 'planned');
