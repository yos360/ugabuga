-- Weddings: up to 1,000 answers per event (a 400-name list could not finish under the old 300), and a
-- wider limit per network so guests sharing one mobile carrier address aren't turned away.
-- Same function as 202610110001_group_tools.sql otherwise. Safe to run twice.
-- Applied automatically by .github/workflows/apply-migrations.yml.
create or replace function public.rsvp_answer(p_code text, p_device_token text, p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare e public.rsvp_events := rsvp_find(p_code); r public.rsvp_responses; v_status text := p->>'status'; v_name text;
        v_kids int; v_adults int;
begin
  if not gt_token_ok(p_device_token) then raise exception 'bad_token'; end if;
  v_name := gt_no_links(gt_txt(p->>'name', 40));
  if v_name is null then raise exception 'name_required'; end if;
  if v_status is null or v_status not in ('yes', 'no', 'maybe') then raise exception 'bad_status'; end if;
  v_kids := case when v_status = 'no' then 0 else greatest(0, least(20, coalesce((p->>'kids')::numeric::int, 0))) end;
  v_adults := case when v_status = 'no' then 0 else greatest(0, least(20, coalesce((p->>'adults')::numeric::int, 0))) end;
  perform gt_rate_check('rsvp_answer', 120, 10000);
  if not exists (select 1 from public.rsvp_responses where event_id = e.id and device_token = p_device_token)
     and (select count(*) from public.rsvp_responses where event_id = e.id) >= 1000 then
    raise exception 'event_full';
  end if;
  insert into public.rsvp_responses as x (event_id, device_token, name, status, kids, adults, allergies, pickup, note)
  values (e.id, p_device_token, v_name, v_status, v_kids, v_adults,
          gt_no_links(gt_txt(p->>'allergies', 200)), gt_no_links(gt_txt(p->>'pickup', 60)), gt_no_links(gt_txt(p->>'note', 200)))
  on conflict (event_id, device_token) do update set
    name = excluded.name, status = excluded.status, kids = excluded.kids, adults = excluded.adults,
    allergies = excluded.allergies, pickup = excluded.pickup, note = excluded.note, updated_at = now()
  returning * into r;
  return rsvp_response_json(r);
exception when invalid_text_representation or numeric_value_out_of_range then raise exception 'bad_number';
end; $$;
