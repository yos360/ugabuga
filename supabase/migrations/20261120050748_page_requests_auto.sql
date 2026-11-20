-- Page requests handled by the daily requests task (scripts/requests-inbox.mjs). Safe to run again.
update public.page_requests set status = 'done', public_title = 'תרגילי היגוי — מילים, כרטיסיות ומשחקים לפי צליל', result_path = '/speech', done_at = coalesce(done_at, now()) where id = 43 and status in ('new', 'planned');
