// Content filter: clear cases are blocked, ordinary words are not, and the database migration uses
// exactly the same patterns as src/utils/contentFilter.js.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const { isInappropriate, hasLink, hasPhone, SQL_PATTERNS } = await import('../src/utils/contentFilter.js')
const { LIVE_QUIZ_TOPICS, LIVE_QUIZ_DIFFICULTIES, LIVE_QUIZ_MODES, buildLiveQuiz } = await import('../src/data/liveQuizPacks.js')

test('inappropriate words are blocked, including spaced, dotted, vocalized and repeated spellings', () => {
  for (const s of ['את זונה', 'שרמוטההה', 'ס.ק.ס', 'תזדיין', 'כוס אמק', 'בן זונה', 'fuck you', 'F*U*C*K', 'כושים', 'שַׁרְמוּטָה', 'מניאק', 'אני אהרוג אותך'])
    assert.ok(isInappropriate(s), s)
})

test('ordinary words are not blocked', () => {
  for (const s of ['כוס מים', 'כוס תה', 'סקסופון', 'כושר גופני', 'עמק יזרעאל', 'הצבא המזוין', 'כלי זין', 'פורים שמח', 'night', 'sussex', 'assassin', 'dickens', 'תמונה', 'שלום חברים'])
    assert.ok(!isInappropriate(s), s)
})

test('links, e-mails, @handles and social networks are blocked; plain text is not', () => {
  for (const s of ['www.x.com', 'evil.com.', 'site . io', 'נקודה קום', 'a@b.com', '@cool_kid12', 'תעקבו בטיקטוק', 'my insta', 'יוטיוב שלי', 'instagram', 'http://x'])
    assert.ok(hasLink(s), s)
  for (const s of ['שלום מה קורה', '3.5 נקודות', 'co-op', 'instant', 'install', 'tefillinstart', 'כל הכבוד!'])
    assert.ok(!hasLink(s), s)
  assert.ok(hasPhone('050-1234567') && hasPhone('+972 50 123 4567') && !hasPhone('תשובה 12'))
})

test('the database migration uses the same patterns', () => {
  const sql = readFileSync(new URL('../supabase/migrations/202610220001_content_filter.sql', import.meta.url), 'utf8')
  for (const [name, re] of Object.entries(SQL_PATTERNS)) assert.ok(sql.includes(`$re$${re}$re$`), `${name} pattern differs between JS and SQL`)
})

test('no ready-made Buga Live question would be rejected by the filter', () => {
  const seen = new Set()
  for (const t of LIVE_QUIZ_TOPICS) for (const d of LIVE_QUIZ_DIFFICULTIES) for (const m of LIVE_QUIZ_MODES) for (let k = 0; k < 30; k++) {
    let g; try { g = buildLiveQuiz(t.id, d.id, 8, [...seen], Math.random, m.id) } catch { break }
    for (const q of g.questions) { seen.add(q.id); for (const s of [q.q, ...q.options]) assert.ok(!hasLink(s) && !isInappropriate(s), s) }
  }
  assert.ok(seen.size > 500)
})
