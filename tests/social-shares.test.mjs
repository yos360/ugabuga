// Share clicks carry their channel; private links never get the share menu; the report is owner-only.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const sql = readFileSync(new URL('../supabase/migrations/202610210003_social_shares.sql', import.meta.url), 'utf8')
const fab = readFileSync(new URL('../src/components/layout/WhatsAppShare.jsx', import.meta.url), 'utf8')

test('social report is owner-only and the event function keeps its public grant', () => {
  assert.match(sql, /grant execute on function public\.record_site_event_v3\([^)]*text\) to anon, authenticated/)
  assert.match(sql, /owner_social_report[\s\S]*'yos300@gmail\.com'[\s\S]*raise exception 'not_owner'/)
  assert.doesNotMatch(sql, /grant execute on function public\.owner_social_report[^;]+anon/)
})

test('the share menu stays off private links', () => {
  const HIDDEN = new Function(`return ${fab.match(/^const HIDDEN = (.+)$/m)[1]}`)()
  for (const p of ['/r/abc', '/t/x', '/g/x', '/w/x', '/hw/abc', '/play/123', '/en/play/9', '/live/5/host', '/classroom/quiz/abc', '/teachers/homework/abc', '/admin/activity', '/embed/dice'])
    assert.ok(HIDDEN.test(p), p)
  for (const p of ['/', '/games/buga-xo', '/printables/coloring', '/stories/snail-and-sparrow', '/learn/history', '/rsvp/wedding', '/classroom/quiz', '/embed', '/live'])
    assert.ok(!HIDDEN.test(p), p)
})

test('every share option in the menu reports its channel', () => {
  for (const ch of ['facebook', 'copy', 'email']) assert.ok(fab.includes(`countShare('${ch}')`), ch)
  assert.match(fab, /facebook\.com\/sharer\/sharer\.php/)
})
