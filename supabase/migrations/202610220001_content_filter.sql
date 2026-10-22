-- Content filter for everything visitors write that other people see. Same rules as
-- src/utils/contentFilter.js (patterns generated from it; tests/content-filter.test.mjs checks they match).
-- Enforced by BEFORE INSERT/UPDATE triggers on the tables themselves, so every RPC (old and new versions)
-- and any direct call is covered. Errors: 'inappropriate' (words), 'no_links' (links, e-mail, @handles,
-- social networks), 'no_contact' (phone numbers, only where children write), 'bad_pay_link'.
-- Safe to run more than once.

create or replace function public.gt_filter_norm(p text)
returns text language sql immutable set search_path = public as $f$
  select regexp_replace(regexp_replace(regexp_replace(translate(
    regexp_replace(lower(coalesce(p, '')), '[\u0591-\u05C7\u200B-\u200F\u202A-\u202E]', '', 'g'),
    'ךםןףץ', 'כמנפצ'), $re$[.\-_*'"׳״|~`^+]+$re$, '', 'g'), '([א-ת])\1+', '\1', 'g'), '\s+', ' ', 'g')
$f$;

create or replace function public.gt_bad_text(p text)
returns boolean language sql immutable set search_path = public as $f$
  select gt_filter_norm(p) ~ $re$(^|[^א-תa-z0-9])([והבלמשכ]{0,2}(זונה|זונות|שרמוט|זיונ|לזינ|מזדינ|תזדינ|הזדינ|כוסאמא|כוסאמק|כוסעמק|כוס אמא|כוס אמק|כוס עמק|פורנ|חרמנ|ציצימ|מניאק|קוקסינל|ערבוש|שמוק|אהרוג אות)|[והבלמשכ]{0,2}(סקס|סקסי|סקסית|חרא|כושי|כושימ|מפגר|מפגרת|מפגרימ|תמות|תמותי)(?=$|[^א-תa-z0-9])|(fuck|fuk|fck|shit|sh1t|bitch|cunt|porn|nigg|faggot|retard|asshole|whore|slut|pussy)|(sex|sexy|dick|dicks|fag|fags|bastard)(?=$|[^א-תa-z0-9]))$re$
$f$;

create or replace function public.gt_has_link(p text)
returns boolean language sql immutable set search_path = public as $f$
  select coalesce(p, '') ~* $re$(https?:\/\/|www\.|[a-z0-9-]+\s*\.\s*(com|co\.il|co|net|org|io|xyz|info|gg|site|me|ly|app|link|ru|tk|top|shop|online|club|tv|live|biz)($|[^a-z])|נקודה\s*קום|דוט\s*קום|dot\s*com|[a-z0-9._-]+@[a-z0-9-]+|(^|\s)@[a-z0-9._]{3,}|(^|[^a-z])(טיקטוק|טיק טוק|tiktok|tik tok|אינסטגרמ|אינסטגרם|אינסטה|instagram|insta|פייסבוק|facebook|יוטיוב|יו טיוב|youtube|youtu|סנאפ|snapchat|snap|טלגרמ|טלגרם|telegram|דיסקורד|discord|וואטסאפ|ווטסאפ|whatsapp|טוויטר|twitter|threads|רובלוקס|roblox)(?![a-z]))$re$
$f$;

create or replace function public.gt_has_phone(p text)
returns boolean language sql immutable set search_path = public as $f$
  select coalesce(p, '') ~ $re$(\+?972|0)[\s-]?\d{1,2}[\s-]?\d{3}[\s-]?\d{4}|\d{3}[\s-]?\d{3}[\s-]?\d{4}$re$
$f$;

-- Kept for the RPCs that call it directly: links and inappropriate words.
create or replace function public.gt_no_links(p text)
returns text language plpgsql immutable set search_path = public as $f$
begin
  if gt_has_link(p) then raise exception 'no_links'; end if;
  if gt_bad_text(p) then raise exception 'inappropriate'; end if;
  return p;
end; $f$;

-- Every string inside a jsonb value (or only questions' q/options with 'q').
create or replace function public.gt_json_text(p jsonb, questions boolean default false)
returns text language sql immutable set search_path = public as $f$
  select coalesce(string_agg(x #>> '{}', ' '), '')
  from jsonb_path_query(coalesce(p, 'null'::jsonb),
    (case when questions then 'strict $[*].q' else 'strict $.**' end)::jsonpath) x
  where jsonb_typeof(x) = 'string'
$f$;

create or replace function public.gt_check_text(v text, kid boolean)
returns void language plpgsql immutable set search_path = public as $f$
begin
  if v is null or v = '' then return; end if;
  if gt_has_link(v) then raise exception 'no_links'; end if;
  if gt_bad_text(v) then raise exception 'inappropriate'; end if;
  if kid and gt_has_phone(v) then raise exception 'no_contact'; end if;
end; $f$;

-- Trigger args: first 'kid' or 'adult', then column specs: name, 'json:name' (all strings),
-- 'q:name' (quiz questions: q and options only), 'extras:name' (RSVP extras: pay_link checked apart).
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
      if pay is not null and pay <> '' and pay !~* '^https://([a-z0-9-]+\.)*(paypal\.me|paypal\.com|payboxapp\.com|payboxapp\.page\.link|bitpay\.co\.il)(/|$)' then raise exception 'bad_pay_link'; end if;
      perform gt_check_text(gt_json_text(v - 'pay_link'), kid);
    elsif spec like 'json:%' then
      perform gt_check_text(gt_json_text(v), kid);
    else
      perform gt_check_text(v #>> '{}', kid);
    end if;
  end loop;
  return new;
end; $f$;

-- Attach to every table that holds visitor text shown to others (skips tables that don't exist yet).
do $d$
declare t record;
begin
  for t in select * from (values
    ('party_lists', 'adult', array['title', 'json:items']),
    ('quizzes', 'adult', array['title', 'q:questions', 'json:names']),
    ('quiz_submissions', 'kid', array['name', 'student']),
    ('rsvp_events', 'adult', array['title', 'place', 'note', 'json:invitees']),
    ('rsvp_responses', 'adult', array['name', 'allergies', 'pickup', 'note']),
    ('rsvp_extras', 'adult', array['extras:data']),
    ('secret_draws', 'adult', array['title', 'note', 'budget']),
    ('secret_people', 'adult', array['name']),
    ('wall_boards', 'adult', array['teacher', 'place']),
    ('wall_notes', 'kid', array['child', 'message']),
    ('live_quizzes', 'adult', array['title', 'q:questions']),
    ('live_quiz_players', 'kid', array['nickname']),
    ('hw_assignments', 'adult', array['title']),
    ('hw_results', 'kid', array['student_name']),
    ('sg_spaces', 'adult', array['json:config']),
    ('sg_entries', 'adult', array['name']),
    ('sg_photos', 'adult', array['caption', 'name'])
  ) v(tbl, who, cols) loop
    if to_regclass('public.' || t.tbl) is null then continue; end if;
    execute format('drop trigger if exists gt_filter on public.%I', t.tbl);
    execute format('create trigger gt_filter before insert or update on public.%I for each row execute function public.gt_filter_row(%L, %s)',
      t.tbl, t.who, (select string_agg(quote_literal(c), ', ') from unnest(t.cols) c));
  end loop;
end $d$;

revoke all on function public.gt_filter_row() from public, anon, authenticated;
