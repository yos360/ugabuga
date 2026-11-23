-- Consented teachers' mailing list (/teachers/join). Explicit opt-in, easy unsubscribe.
-- Visitors write only through narrow RPCs; the table is closed to direct access; only the owner reads (count + export).
-- Safe to run again: create if not exists / create or replace.

create table if not exists public.teacher_signups (
  id bigint generated always as identity primary key,
  email text not null unique check (email = lower(email) and char_length(email) <= 120),
  role text not null default 'מורה' check (role in ('מורה','גננת','הורה','אחר')),
  grades text[] not null default '{}',
  subjects text[] not null default '{}',
  consent boolean not null check (consent),
  consent_text text check (consent_text is null or char_length(consent_text) <= 500),
  source_path text check (source_path is null or char_length(source_path) <= 120),
  created_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  unsubscribe_token uuid not null default gen_random_uuid()
);
create unique index if not exists teacher_signups_token on public.teacher_signups(unsubscribe_token);
alter table public.teacher_signups enable row level security;
revoke all on table public.teacher_signups from anon, authenticated;
revoke all on sequence public.teacher_signups_id_seq from anon, authenticated;

-- Returns true when saved. A returning address is updated and re-subscribed (the visitor just agreed again).
create or replace function public.subscribe_teacher(p_email text, p_role text, p_grades text[], p_subjects text[],
  p_source_path text, p_consent_text text, p_consent boolean default true)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_role text := case when p_role in ('מורה','גננת','הורה','אחר') then p_role else 'אחר' end;
  v_grades text[] := coalesce((select array_agg(distinct left(g, 20)) from unnest(coalesce(p_grades, '{}')) g where char_length(btrim(g)) > 0), '{}');
  v_subjects text[] := coalesce((select array_agg(distinct left(s, 30)) from unnest(coalesce(p_subjects, '{}')) s where char_length(btrim(s)) > 0), '{}');
begin
  if coalesce(p_consent, false) is not true then return false; end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[a-z]{2,}$' or char_length(v_email) > 120 then return false; end if;
  if p_source_path is not null and p_source_path !~ '^/[a-z0-9/_-]{0,119}$' then p_source_path := null; end if;
  v_grades := v_grades[1:20]; v_subjects := v_subjects[1:20];
  -- Flood guard: at most 30 sign-ups a minute site-wide.
  if (select count(*) from (select 1 from public.teacher_signups where created_at > now() - interval '1 minute' limit 30) q) >= 30 then return false; end if;
  insert into public.teacher_signups(email, role, grades, subjects, consent, consent_text, source_path)
  values (v_email, v_role, v_grades, v_subjects, true, left(p_consent_text, 500), p_source_path)
  on conflict (email) do update set role = excluded.role, grades = excluded.grades, subjects = excluded.subjects,
    consent_text = excluded.consent_text, source_path = coalesce(excluded.source_path, public.teacher_signups.source_path),
    unsubscribed_at = null;
  return true;
end;
$$;

create or replace function public.unsubscribe_teacher(p_token uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_n int;
begin
  update public.teacher_signups set unsubscribed_at = coalesce(unsubscribed_at, now()) where unsubscribe_token = p_token;
  get diagnostics v_n = row_count;
  return v_n > 0;
end;
$$;

-- Owner only: counts, no emails.
create or replace function public.teacher_signups_owner_count()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  return jsonb_build_object(
    'active', (select count(*) from public.teacher_signups where unsubscribed_at is null),
    'unsubscribed', (select count(*) from public.teacher_signups where unsubscribed_at is not null),
    'last_7_days', (select count(*) from public.teacher_signups where created_at > now() - interval '7 days' and unsubscribed_at is null),
    'by_role', coalesce((select jsonb_object_agg(role, n) from (select role, count(*) n from public.teacher_signups where unsubscribed_at is null group by role) r), '{}'::jsonb));
end;
$$;

revoke all on function public.subscribe_teacher(text, text, text[], text[], text, text, boolean) from public;
revoke all on function public.unsubscribe_teacher(uuid) from public;
revoke all on function public.teacher_signups_owner_count() from public;
grant execute on function public.subscribe_teacher(text, text, text[], text[], text, text, boolean) to anon, authenticated;
grant execute on function public.unsubscribe_teacher(uuid) to anon, authenticated;
grant execute on function public.teacher_signups_owner_count() to authenticated;
