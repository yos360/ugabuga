-- Page requests handled by the daily requests task (scripts/requests-inbox.mjs). Safe to run again.
update public.page_requests set status = 'done', public_title = 'חוברת תנועות וניקוד — עמוד לכל תנועה', result_path = '/booklets/nikud', done_at = coalesce(done_at, now()) where id = 10 and status in ('new', 'planned');
update public.page_requests set status = 'done', public_title = 'חוברת צליל פותח — היגיינה אישית', result_path = '/booklets/hygiene-first-sound', done_at = coalesce(done_at, now()) where id = 13 and status in ('new', 'planned');
update public.page_requests set status = 'planned' where id in (9, 11, 12, 14) and status = 'new';
