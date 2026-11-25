-- Page requests handled by the daily requests task (scripts/requests-inbox.mjs). Safe to run again.
update public.page_requests set status = 'done', public_title = 'כפל שבר בשבר ומספר מעורב בשבר — תרגילים ובעיות מילוליות לכיתה ו׳', result_path = '/math/grade-6/fraction-mixed-number-multiplication', done_at = coalesce(done_at, now()) where id = 47 and status in ('new', 'planned');
