-- The planner became the teacher's diary: lesson notes and per-student marks for the whole year.
-- Room for that (about 1 MB per teacher instead of 200 KB). Safe to run again.
alter table public.planner_plans drop constraint if exists planner_plans_plan_check;
alter table public.planner_plans add constraint planner_plans_plan_check check (pg_column_size(plan) < 1000000);
