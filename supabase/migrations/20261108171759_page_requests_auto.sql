-- Page requests handled by the daily requests task (scripts/requests-inbox.mjs). Safe to run again.
update public.page_requests set status = 'done', public_title = 'משחק חינוך פיננסי לכיתות ה–ו', result_path = '/online-games/money-wise', done_at = coalesce(done_at, now()) where id = 33 and status in ('new', 'planned');
