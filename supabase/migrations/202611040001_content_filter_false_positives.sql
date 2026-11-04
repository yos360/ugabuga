-- Content filter false positives: a guest who wrote only an address ("באולם שמוקם ליד…") was told the
-- text is not suitable for children. שמוק is now a whole word only (it caught שמוקם/שמוקף/שמוקדש), a bare
-- מ or ב prefix no longer counts (מזונות, מציצים, בזיון), פורנ became פורנו (פורנזיקה), and the
-- surname Shitrit passes. Same pattern as
-- src/utils/contentFilter.js (tests/content-filter.test.mjs checks they match). Safe to run more than once.

create or replace function public.gt_bad_text(p text)
returns boolean language sql immutable set search_path = public as $f$
  select gt_filter_norm(p) ~ $re$(^|[^א-תa-z0-9])((?:מ?ה|[ולשכ]){0,2}(זונה|זונות|שרמוט|זיונ|לזינ|מזדינ|תזדינ|הזדינ|כוסאמא|כוסאמק|כוסעמק|כוס אמא|כוס אמק|כוס עמק|פורנו|חרמנ|ציצימ|מניאק|קוקסינל|ערבוש|אהרוג אות)|(?:מ?ה|[ולשכ]){0,2}(סקס|סקסי|סקסית|חרא|כושי|כושימ|מפגר|מפגרת|מפגרימ|תמות|תמותי|שמוק|שמוקימ)(?=$|[^א-תa-z0-9])|(fuck|fuk|fck|shit(?!rit)|sh1t|bitch|cunt|porn|nigg|faggot|retard|asshole|whore|slut|pussy)|(sex|sexy|dick|dicks|fag|fags|bastard)(?=$|[^א-תa-z0-9]))$re$
$f$;
