-- Owner report: everything visitors set up on the site (RSVP events, thank-you walls, secret-friend
-- draws, quizzes, live quizzes, homework) with how many opened it and how many answered.
-- Owner only (same e-mail check as the rest of the owner report). Counts only: no guest names,
-- answers, allergies or tokens leave the database. Safe to run twice.
-- Applied automatically by .github/workflows/apply-migrations.yml when pushed to main.
create or replace function public.owner_created_things(p_from timestamptz, p_to timestamptz)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'yos300@gmail.com' then raise exception 'not_owner'; end if;
  return coalesce((select jsonb_agg(x order by x->>'last' desc) from (select x from (
    -- RSVP events: guests' page /r/<code>
    select jsonb_build_object('kind', 'rsvp', 'title', e.title, 'created', e.created_at, 'date', e.event_date,
      'opens', (select count(*) from public.owner_site_activity a where a.action = 'open' and a.path = '/r/' || e.code),
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
