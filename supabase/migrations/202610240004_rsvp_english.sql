-- RSVP on the English site (/en/rsvp, guest links /en/r/<code>). Same tables and RPCs as the Hebrew
-- RSVP; this only (1) lets an event's extras keep the currency of its participation fee, and
-- (2) counts guests who open /en/r/<code> in the owner report, exactly like /r/<code>, with the two
-- English "before you go" cards (/en/birthday, /en/games/memory) next to the Hebrew ones.
-- Functions are replaced in place (create or replace); no table changes. Safe to run twice.
-- Applied automatically by .github/workflows/apply-migrations.yml.

-- 1) Extras: the same known keys as in 202610200002_rsvp_extras.sql, plus `currency`.
create or replace function public.rsvp_clean_extras(p jsonb)
returns jsonb language plpgsql immutable set search_path = '' as $$
declare o jsonb := '{}'::jsonb; v text; n numeric;
begin
  if p is null or jsonb_typeof(p) <> 'object' then return o; end if;
  v := p->>'type'; if v ~ '^[a-z0-9-]{1,40}$' then o := o || jsonb_build_object('type', v); end if;
  v := p->>'lang'; if v in ('he', 'ar', 'ru', 'en') then o := o || jsonb_build_object('lang', v); end if;
  v := btrim(coalesce(p->>'parking', '')); if v <> '' then o := o || jsonb_build_object('parking', left(v, 300)); end if;
  if jsonb_typeof(p->'price') = 'number' then n := (p->>'price')::numeric; if n > 0 and n <= 10000 then o := o || jsonb_build_object('price', round(n, 2)); end if; end if;
  v := p->>'currency'; if v in ('ILS', 'USD', 'GBP', 'EUR', 'CAD', 'AUD') then o := o || jsonb_build_object('currency', v); end if;
  v := btrim(coalesce(p->>'pay_link', '')); if v ~* '^https://[^\s<>"]{3,}$' and length(v) <= 300 then o := o || jsonb_build_object('pay_link', v); end if;
  if jsonb_typeof(p->'tables') = 'number' then n := (p->>'tables')::numeric; if n >= 1 and n <= 200 then o := o || jsonb_build_object('tables', n::int); end if; end if;
  if (p->>'show_table') = 'true' then o := o || jsonb_build_object('show_table', true); end if;
  return o;
end; $$;
revoke all on function public.rsvp_clean_extras(jsonb) from public, anon, authenticated;

-- 2) Owner report RSVP funnel (from 202610240003_owner_rsvp_funnel.sql): an invitation link is
-- /r/<code> or /en/r/<code>. Counts only — no names, answers or codes. Owner-only.
create or replace function public.owner_rsvp_funnel(p_from timestamptz, p_to timestamptz)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  return (
    with a as (
      select visitor, path, action, created_at, (created_at at time zone 'Asia/Jerusalem')::date d,
        (path like '/r/%' or path like '/en/r/%') invite
      from public.owner_site_activity
      where created_at >= p_from and created_at < p_to + interval '6 hours' and visitor is not null and action = 'open'
    ), r as (
      -- A guest: opened an invitation that day without having browsed the site before it.
      select r0.visitor, r0.d, r0.first_r from (
        select visitor, d, min(created_at) first_r from a
        where invite and created_at < p_to group by 1, 2
      ) r0
      where r0.first_r >= p_from
        and not exists (select 1 from a x where x.visitor = r0.visitor and x.d = r0.d and not x.invite and x.created_at < r0.first_r)
    )
    select jsonb_build_object(
      'events_created', (select count(*) from public.rsvp_events e where e.created_at >= p_from and e.created_at < p_to),
      'guests_opened', (select count(*) from r),
      'responses', (select count(*) from public.rsvp_responses x where x.created_at >= p_from and x.created_at < p_to),
      'to_birthday_famous', (select count(*) from r where exists (select 1 from a x where x.visitor = r.visitor and x.d = r.d and x.path in ('/tools/birthday-famous', '/en/birthday') and x.created_at > r.first_r)),
      'to_trick_questions', (select count(*) from r where exists (select 1 from a x where x.visitor = r.visitor and x.d = r.d and x.path in ('/trick-questions', '/en/games/memory') and x.created_at > r.first_r)),
      'to_any_page', (select count(*) from r where exists (select 1 from a x where x.visitor = r.visitor and x.d = r.d and not x.invite and x.created_at > r.first_r))
    )
  );
end;
$$;
revoke all on function public.owner_rsvp_funnel(timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.owner_rsvp_funnel(timestamptz, timestamptz) to authenticated;

-- 3) Owner report "created things" (from 202610190003_owner_created_things.sql): an RSVP event's
-- opens include its English guest link.
create or replace function public.owner_created_things(p_from timestamptz, p_to timestamptz)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  return coalesce((select jsonb_agg(x order by x->>'last' desc) from (select x from (
    -- RSVP events: guests' page /r/<code> (or /en/r/<code>)
    select jsonb_build_object('kind', 'rsvp', 'title', e.title, 'created', e.created_at, 'date', e.event_date,
      'opens', (select count(*) from public.owner_site_activity a where a.action = 'open' and a.path in ('/r/' || e.code, '/en/r/' || e.code)),
      'yes', count(r.id) filter (where r.status = 'yes'), 'maybe', count(r.id) filter (where r.status = 'maybe'),
      'no', count(r.id) filter (where r.status = 'no'),
      'people', coalesce(sum(r.kids + r.adults) filter (where r.status = 'yes'), 0),
      'last', greatest(e.created_at, max(r.updated_at))) x
    from public.rsvp_events e left join public.rsvp_responses r on r.event_id = e.id
    group by e.id having greatest(e.created_at, max(r.updated_at)) >= p_from and e.created_at < p_to
    union all
    -- Thank-you walls: /w/<code>
    select jsonb_build_object('kind', 'wall', 'title', 'קיר ברכות ל' || w.teacher || coalesce(' · ' || w.place, ''), 'created', w.created_at,
      'opens', (select count(*) from public.owner_site_activity a where a.action = 'open' and a.path = '/w/' || w.code),
      'answers', count(n.id), 'last', greatest(w.created_at, max(n.updated_at)))
    from public.wall_boards w left join public.wall_notes n on n.board_id = w.id
    group by w.id having greatest(w.created_at, max(n.updated_at)) >= p_from and w.created_at < p_to
    union all
    -- Secret-friend draws: each participant gets a personal link
    select jsonb_build_object('kind', 'secret', 'title', d.title, 'created', d.created_at,
      'opens', coalesce(sum(p.opens), 0), 'people', count(p.id), 'answers', count(p.id) filter (where p.opened_at is not null),
      'last', greatest(d.created_at, max(p.opened_at)))
    from public.secret_draws d left join public.secret_people p on p.draw_id = d.id
    group by d.id having greatest(d.created_at, max(p.opened_at)) >= p_from and d.created_at < p_to
    union all
    -- Online quizzes: /q/<code>
    select jsonb_build_object('kind', 'quiz', 'title', q.title, 'created', q.created_at,
      'opens', (select count(*) from public.quiz_starts s where s.quiz_id = q.id),
      'answers', count(s.id), 'avg', round(avg(100.0 * s.score / nullif(s.total, 0))),
      'last', greatest(q.created_at, max(s.created_at)))
    from public.quizzes q left join public.quiz_submissions s on s.quiz_id = q.id
    group by q.id having greatest(q.created_at, max(s.created_at)) >= p_from and q.created_at < p_to
    union all
    -- Live class quizzes
    select jsonb_build_object('kind', 'live', 'title', l.title, 'created', l.created_at,
      'answers', count(p.id), 'last', greatest(l.created_at, max(p.joined_at)))
    from public.live_quizzes l left join public.live_quiz_players p on p.quiz_id = l.id
    group by l.id having greatest(l.created_at, max(p.joined_at)) >= p_from and l.created_at < p_to
    union all
    -- Homework: /hw/<code>
    select jsonb_build_object('kind', 'homework', 'title', h.title || coalesce(' · ' || h.class_name, ''), 'created', h.created_at,
      'opens', (select count(*) from public.owner_site_activity a where a.action = 'open' and a.path = '/hw/' || h.code),
      'people', count(distinct lower(r.student_name)), 'answers', count(r.id),
      'last', greatest(h.created_at, max(r.updated_at)))
    from public.hw_assignments h left join public.hw_results r on r.assignment_id = h.id
    group by h.id having greatest(h.created_at, max(r.updated_at)) >= p_from and h.created_at < p_to
  ) u(x) order by x->>'last' desc limit 150) items), '[]'::jsonb);
end; $$;
revoke all on function public.owner_created_things(timestamptz, timestamptz) from public, anon;
grant execute on function public.owner_created_things(timestamptz, timestamptz) to authenticated;

notify pgrst, 'reload schema';
