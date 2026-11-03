-- Page requests handled by the daily requests task (scripts/requests-inbox.mjs). Safe to run again.
update public.page_requests set status = 'done', public_title = 'חוברת חשבון קלה: שאלות מילוליות לכיתה ה׳ — חינוך מיוחד', result_path = '/booklets/word-problems-grade5-special-ed', done_at = coalesce(done_at, now()) where id = 28 and status in ('new', 'planned');
