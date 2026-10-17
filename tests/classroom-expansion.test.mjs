import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { cleanRosterNames } from '../src/utils/classRoster.js'
import { bugaPediaSearchTerms, findBugaPediaKnowledge } from '../src/data/bugapediaKnowledge.js'

test('class roster trims, de-duplicates and caps names', () => {
  assert.deepEqual(cleanRosterNames(' נועה\nאורי\nנועה\n\nמיה '), ['נועה', 'אורי', 'מיה'])
  assert.equal(cleanRosterNames(Array.from({ length: 120 }, (_, i) => `ילד ${i}`)).length, 100)
})

test('BugaPedia answers the pirate eye-patch question truthfully', () => {
  const answer = findBugaPediaKnowledge('למה שודדי ים שמים רטיה?')
  assert.ok(answer?.verified)
  assert.match(answer.extract, /אין הוכחות היסטוריות/)
  assert.deepEqual(bugaPediaSearchTerms('איך דב קוטב שומר על חום?'), ['דב', 'קוטב', 'שומר', 'על', 'חום'])
})

test('new classroom, English live and QR hunt routes are connected', () => {
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
  for (const path of ['/classroom/roster', '/en/live', '/en/play/:code', '/treasure-hunt/qr', '/treasure-hunt/qr/play']) assert.ok(app.includes(`path="${path}"`), path)
})

test('BugaPedia analytics table is private and owner read is authenticated', () => {
  const sql = readFileSync(new URL('../supabase/migrations/202610160005_bugapedia_query_analytics.sql', import.meta.url), 'utf8')
  assert.match(sql, /enable row level security/i)
  assert.match(sql, /revoke all on table public\.bugapedia_queries from anon, authenticated/i)
  assert.match(sql, /grant execute on function public\.record_bugapedia_query[^;]+to anon, authenticated/is)
  assert.match(sql, /grant execute on function public\.bugapedia_owner_queries[^;]+to authenticated/is)
  assert.doesNotMatch(sql, /grant execute on function public\.bugapedia_owner_queries[^;]+to anon/is)
})
