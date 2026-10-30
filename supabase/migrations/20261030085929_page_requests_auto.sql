-- Page requests handled by the daily requests task (scripts/requests-inbox.mjs). Safe to run again.
update public.page_requests set status = 'done', public_title = 'חוקי החשבון וסדר פעולות — חילוף, קיבוץ ופילוג (כיתה ו׳)', result_path = '/math/grade-6/arithmetic-laws', done_at = coalesce(done_at, now()) where id = 4 and status in ('new', 'planned');
update public.page_requests set status = 'done', public_title = 'חוברת שגיאות כתיב', result_path = '/booklets/spelling', done_at = coalesce(done_at, now()) where id = 5 and status in ('new', 'planned');
