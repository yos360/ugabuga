-- Payment links on RSVP invitations: besides Bit, PayBox and PayPal, allow the common international
-- services used on the English site (Venmo, Revolut, Cash App, Monzo, Wise, Stripe and Square payment
-- links, Google Pay, Ko-fi, Buy Me a Coffee). Still an allowlist of payment services only, so an
-- invitation can't carry an arbitrary link. Same function as 202610220001_content_filter.sql with the
-- longer list. Safe to run twice. Applied automatically by .github/workflows/apply-migrations.yml.

create or replace function public.gt_filter_row()
returns trigger language plpgsql set search_path = public as $f$
declare r jsonb := to_jsonb(new); spec text; col text; kid boolean := tg_argv[0] = 'kid'; v jsonb; pay text; i int;
begin
  for i in 1 .. tg_nargs - 1 loop
    spec := tg_argv[i]; col := split_part(spec, ':', 2);
    if col = '' then col := spec; end if;
    v := r -> col;
    if v is null or v = 'null'::jsonb then continue; end if;
    -- Updates re-check only what changed (a live game updates its row every few seconds).
    if tg_op = 'UPDATE' and (to_jsonb(old) -> col) is not distinct from v then continue; end if;
    if spec like 'q:%' then
      perform gt_check_text(gt_json_text(v, true), kid);
      perform gt_check_text((select string_agg(o #>> '{}', ' ') from jsonb_array_elements(case when jsonb_typeof(v) = 'array' then v else '[]'::jsonb end) e,
        jsonb_array_elements(case when jsonb_typeof(e -> 'options') = 'array' then e -> 'options' else '[]'::jsonb end) o), kid);
    elsif spec like 'extras:%' then
      pay := v ->> 'pay_link';
      if pay is not null and pay <> '' and pay !~* '^https://([a-z0-9-]+\.)*(paypal\.me|paypal\.com|payboxapp\.com|payboxapp\.page\.link|bitpay\.co\.il|venmo\.com|revolut\.me|revolut\.com|cash\.app|monzo\.me|wise\.com|buy\.stripe\.com|square\.link|checkout\.square\.site|pay\.google\.com|ko-fi\.com|buymeacoffee\.com)(/|$)' then raise exception 'bad_pay_link'; end if;
      perform gt_check_text(gt_json_text(v - 'pay_link'), kid);
    elsif spec like 'json:%' then
      perform gt_check_text(gt_json_text(v), kid);
    else
      perform gt_check_text(v #>> '{}', kid);
    end if;
  end loop;
  return new;
end; $f$;
