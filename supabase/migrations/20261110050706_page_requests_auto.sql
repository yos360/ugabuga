-- Page requests handled by the daily requests task (scripts/requests-inbox.mjs). Safe to run again.
update public.page_requests set status = 'done', public_title = 'סביבון וירטואלי — משחק חנוכה למשפחה', result_path = '/holidays/hanukkah/sevivon', done_at = coalesce(done_at, now()) where id = 38 and status in ('new', 'planned');
