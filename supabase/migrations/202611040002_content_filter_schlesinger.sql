-- Content filter false positive: an RSVP for a synagogue on רח' שלזינגר (Schlesinger St.) was rejected,
-- because ש + לזינ matched a blocked stem. לזינ is now a whole word only. Same pattern as
-- src/utils/contentFilter.js (tests/content-filter.test.mjs checks they match). Safe to run more than once.

create or replace function public.gt_bad_text(p text)
returns boolean language sql immutable set search_path = public as $f$
  select gt_filter_norm(p) ~ $re$(^|[^א-תa-z0-9])((?:מ?ה|[ולשכ]){0,2}(זונה|זונות|שרמוט|זיונ|מזדינ|תזדינ|הזדינ|כוסאמא|כוסאמק|כוסעמק|כוס אמא|כוס אמק|כוס עמק|פורנו|חרמנ|ציצימ|מניאק|קוקסינל|ערבוש|אהרוג אות)|(?:מ?ה|[ולשכ]){0,2}(סקס|סקסי|סקסית|חרא|כושי|כושימ|מפגר|מפגרת|מפגרימ|תמות|תמותי|שמוק|שמוקימ|לזינ)(?=$|[^א-תa-z0-9])|(fuck|fuk|fck|shit(?!rit)|sh1t|bitch|cunt|porn|nigg|faggot|retard|asshole|whore|slut|pussy)|(sex|sexy|dick|dicks|fag|fags|bastard)(?=$|[^א-תa-z0-9]))$re$
$f$;
