-- Homework: two more task types — questions from the site's banks ('bank') and a short game from
-- the site ('game'). Same checks as before otherwise. Safe to run twice.
-- Applied automatically by .github/workflows/apply-migrations.yml when pushed to main.
create or replace function public.hw_clean_tasks(p jsonb)
returns jsonb language plpgsql immutable set search_path = '' as $$
declare e jsonb;
begin
  if p is null or jsonb_typeof(p) <> 'array' or jsonb_array_length(p) < 1 or jsonb_array_length(p) > 12 then raise exception 'bad_tasks'; end if;
  if length(p::text) > 60000 then raise exception 'bad_tasks'; end if;
  for e in select * from jsonb_array_elements(p) loop
    if jsonb_typeof(e) <> 'object' or coalesce(e->>'type', '') not in ('math', 'reading', 'dictation', 'questions', 'bank', 'game') then raise exception 'bad_tasks'; end if;
  end loop;
  return p;
end; $$;
revoke all on function public.hw_clean_tasks(jsonb) from public, anon, authenticated;
