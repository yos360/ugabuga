-- Shared wedding plan: two partners edit one plan through a secret link, no sign-up. Stored only when a
-- couple turns sharing on; a plan nobody touched for 400 days is removed. The table is closed: every
-- call needs the plan's code and its long secret token. Safe to run twice.
-- Applied automatically by .github/workflows/apply-migrations.yml.

create table if not exists public.wedding_plans (
  code text primary key,
  token text not null,
  data jsonb not null default '{}'::jsonb,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '400 days'
);
create index if not exists wedding_plans_expires on public.wedding_plans (expires_at);
alter table public.wedding_plans enable row level security;
revoke all on public.wedding_plans from public, anon, authenticated;

-- Internal: the plan for this code and token, or not_found (same answer for a wrong token).
create or replace function public.wedding_plan_find(p_code text, p_token text)
returns public.wedding_plans language plpgsql stable security definer set search_path = public as $$
declare w public.wedding_plans;
begin
  select * into w from public.wedding_plans where code = p_code and token = p_token and expires_at > now();
  if not found then raise exception 'not_found'; end if;
  return w;
end; $$;

create or replace function public.wedding_plan_create(p_token text, p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare c text; n int := 0;
begin
  if not gt_token_ok(p_token) then raise exception 'bad_token'; end if;
  if p is null or jsonb_typeof(p) <> 'object' then raise exception 'bad_number'; end if;
  if octet_length(p::text) > 30000 then raise exception 'too_many'; end if;
  perform gt_rate_check('wedding_create', 15, 600);
  if random() < 0.05 then delete from public.wedding_plans where expires_at < now(); end if;
  loop
    c := gt_code(10);
    exit when not exists (select 1 from public.wedding_plans where code = c);
    n := n + 1; if n > 20 then raise exception 'code_space_exhausted'; end if;
  end loop;
  insert into public.wedding_plans (code, token, data) values (c, p_token, p);
  return jsonb_build_object('code', c, 'version', 1);
end; $$;

create or replace function public.wedding_plan_get(p_code text, p_token text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare w public.wedding_plans := wedding_plan_find(p_code, p_token);
begin
  return jsonb_build_object('version', w.version, 'data', w.data);
end; $$;

-- Saves only on top of the version the caller last saw; otherwise nothing is written and the caller
-- gets the newer plan to merge with.
create or replace function public.wedding_plan_save(p_code text, p_token text, p jsonb, p_version int)
returns jsonb language plpgsql security definer set search_path = public as $$
declare w public.wedding_plans := wedding_plan_find(p_code, p_token); v int;
begin
  if p is null or jsonb_typeof(p) <> 'object' then raise exception 'bad_number'; end if;
  if octet_length(p::text) > 30000 then raise exception 'too_many'; end if;
  perform gt_rate_check('wedding_save', 600, 30000);
  update public.wedding_plans set data = p, version = version + 1, updated_at = now(), expires_at = now() + interval '400 days'
    where code = p_code and token = p_token and version = p_version returning version into v;
  if v is not null then return jsonb_build_object('ok', true, 'version', v); end if;
  select * into w from public.wedding_plans where code = p_code and token = p_token;
  return jsonb_build_object('ok', false, 'version', w.version, 'data', w.data);
end; $$;

create or replace function public.wedding_plan_delete(p_code text, p_token text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  delete from public.wedding_plans where code = p_code and token = p_token;
  if not found then raise exception 'not_found'; end if;
  return true;
end; $$;

revoke all on function public.wedding_plan_find(text, text) from public, anon, authenticated;
revoke all on function public.wedding_plan_create(text, jsonb), public.wedding_plan_get(text, text), public.wedding_plan_save(text, text, jsonb, int), public.wedding_plan_delete(text, text) from public;
grant execute on function public.wedding_plan_create(text, jsonb), public.wedding_plan_get(text, text), public.wedding_plan_save(text, text, jsonb, int), public.wedding_plan_delete(text, text) to anon, authenticated;

notify pgrst, 'reload schema';
