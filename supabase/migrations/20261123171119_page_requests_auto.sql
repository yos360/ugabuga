-- Page requests handled by the daily requests task (scripts/requests-inbox.mjs). Safe to run again.
update public.page_requests set status = 'done', public_title = 'דפי עבודה בממוצע ומספרים עשרוניים — כיתה ו׳', result_path = '/math/grade-6/average-decimals', done_at = coalesce(done_at, now()) where id = 46 and status in ('new', 'planned');
