-- Weddings: guest lists of up to 400 names (was 80), and phone-like digit runs are dropped from
-- names, so a pasted contact line never puts a phone number on the public event page.
-- Safe to re-run: create or replace keeps the function's grants.
create or replace function public.rsvp_clean_invitees(p jsonb)
returns jsonb language sql immutable set search_path = public as $$
  select coalesce(jsonb_agg(to_jsonb(n) order by ord), '[]'::jsonb) from (
    select (array_agg(n order by ord))[1] n, min(ord) ord
    from (select gt_txt(trim(both ' -–:|' from regexp_replace(e, '\+?[0-9](?:[ ()-]{0,2}[0-9]){7,}', ' ', 'g')), 30) n, ord
          from jsonb_array_elements_text(case when jsonb_typeof(p) = 'array' then p else '[]'::jsonb end) with ordinality t(e, ord)
          where ord <= 1000) a
    where n is not null
    group by lower(n) order by min(ord) limit 400
  ) b;
$$;
