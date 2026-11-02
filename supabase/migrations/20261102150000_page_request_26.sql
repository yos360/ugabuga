-- Page request 26 (pointed sentence pyramids for grades 1–2 with two questions) is built. Safe to run again.
update public.page_requests set status = 'done', public_title = 'משפטי פירמידה — קריאה מנוקדת עם שאלות', result_path = '/booklets/sentence-pyramids', done_at = coalesce(done_at, now()) where id = 26 and status in ('new', 'planned');
