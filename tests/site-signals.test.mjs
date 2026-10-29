import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { signalPath, internalTarget, scrollable, scrollRatio, newMilestones, searchBucket, safeSearchTerm, errorClass } from '../src/utils/liveActivity.js'
import { feedbackEligible } from '../src/utils/feedbackPages.js'

test('signalPath drops query/hash, lowercases and masks ids and tokens', () => {
  assert.equal(signalPath('/Tools/Dice/?name=Dana#x'), '/tools/dice')
  assert.equal(signalPath('/rsvp/3f2504e0-4f89-11d3-9a0c-0305e82c3301'), '/rsvp/_id')
  assert.equal(signalPath('/x/a8f3k29dj4h2q'), '/x/_id')
  assert.equal(signalPath('/learn/grade-1-reading-comprehension'), '/learn/grade-1-reading-comprehension')
  assert.equal(signalPath('/t/secretcode123'), '/shared-space')
  assert.equal(signalPath('/%D7%A9%D7%9C%D7%95%D7%9D'), null)
  assert.equal(signalPath('/'), '/')
})

test('internalTarget keeps only same-site pages', () => {
  const o = 'https://ugabuga.co.il'
  assert.equal(internalTarget('/tools/dice?x=1#a', o), '/tools/dice')
  assert.equal(internalTarget('https://ugabuga.co.il/games/memory', o), '/games/memory')
  assert.equal(internalTarget('https://example.com/tools/dice', o), null)
  assert.equal(internalTarget('mailto:a@b.co', o), null)
  assert.equal(internalTarget('tel:+972500000000', o), null)
})

test('scroll reach: only long pages, 50 and 90 once each', () => {
  assert.equal(scrollable(800, 900), false)
  assert.equal(scrollable(800, 3000), true)
  assert.equal(scrollRatio(0, 800, 3200), 0.25)
  assert.equal(scrollRatio(5000, 800, 3200), 1)
  const done = new Set()
  assert.deepEqual(newMilestones(0.4, done), [])
  assert.deepEqual(newMilestones(0.55, done), [50])
  done.add(50)
  assert.deepEqual(newMilestones(0.6, done), [])
  assert.deepEqual(newMilestones(0.95, done), [90])
  assert.deepEqual(newMilestones(1, new Set()), [50, 90])
})

test('search buckets', () => {
  assert.equal(searchBucket(0), 'r0'); assert.equal(searchBucket(1), 'r1_5'); assert.equal(searchBucket(5), 'r1_5'); assert.equal(searchBucket(6), 'r6p')
  assert.equal(searchBucket(-1), null); assert.equal(searchBucket(NaN), null); assert.equal(searchBucket('3'), null)
})

test('only plain 1-3 word searches may be stored', () => {
  assert.equal(safeSearchTerm('  משחק   זיכרון '), 'משחק זיכרון')
  assert.equal(safeSearchTerm('Origami'), 'origami')
  for (const bad of ['a', 'x'.repeat(31), 'dana@gmail.com', 'כיתה 3', '0501234567', 'a b c d', 'https://x.co', 'שלום!', 'שם-משפחה', '', null, undefined]) assert.equal(safeSearchTerm(bad), null, String(bad))
})

test('errorClass sends a class only and ignores network noise', () => {
  assert.equal(errorClass(new TypeError('x is undefined')), 'type')
  assert.equal(errorClass(new ReferenceError('y')), 'ref')
  assert.equal(errorClass(new RangeError('z')), 'range')
  assert.equal(errorClass(new Error('Failed to fetch dynamically imported module: https://x/a.js')), 'chunk')
  assert.equal(errorClass(new TypeError('Failed to fetch')), null)
  assert.equal(errorClass({ name: 'AbortError', message: 'aborted' }), null)
  assert.equal(errorClass(undefined, 'Script error.'), 'other')
  assert.equal(errorClass('boom'), 'other')
})

test('feedback row: tool/printable/game/learn pages only, never guest pages or the home page', () => {
  for (const ok of ['/tools/dice', '/printables/mazes', '/games/memory', '/learn/zodiac', '/online-games/snake', '/learn/reading/grade-2/']) assert.equal(feedbackEligible(ok), true, ok)
  for (const no of ['/', '/tools', '/games', '/rsvp/birthday', '/tools/bring-list', '/bring-list', '/secret-friend', '/tools/secret-friend', '/t/abc', '/en/tools/dice', '/admin/activity', '/search', '/about']) assert.equal(feedbackEligible(no), false, no)
})

test('the signals tables hold no visitor id and are closed to direct access', () => {
  const sql = readFileSync(new URL('../supabase/migrations/202610290001_site_signals.sql', import.meta.url), 'utf8')
  const tables = sql.match(/create table if not exists public\.\w+ \([\s\S]*?\n\);/g) || []
  assert.equal(tables.length, 2)
  for (const t of tables) assert.doesNotMatch(t, /visitor|ip\b|email|user_id/i)
  assert.equal((sql.match(/enable row level security/g) || []).length, 2)
  assert.match(sql, /revoke all on table public\.site_signal_events from anon, authenticated/)
  assert.match(sql, /revoke all on table public\.site_search_misses from anon, authenticated/)
  assert.match(sql, /yos300@gmail\.com/)
})
