-- Page requests handled by the daily requests task (scripts/requests-inbox.mjs). Safe to run again.
update public.page_requests set status = 'done', public_title = 'שאלות מילוליות בעשרת הראשונה — כיתה א׳ חינוך מיוחד', result_path = '/booklets/word-problems-special-ed', done_at = coalesce(done_at, now()) where id = 23 and status in ('new', 'planned');
