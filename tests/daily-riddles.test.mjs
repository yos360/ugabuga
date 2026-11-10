// "החידה היומית" (/riddles/daily, /riddles/<id>): every riddle is complete, its id is unique and does not
// clash with a topic page, the list is newest first, and every page is in the sitemap.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { DAILY_RIDDLES, dailyRiddlePath } from '../src/data/dailyRiddles.js'
import { RIDDLE_PAGES } from '../src/data/content/riddles.js'

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const sitemap = read('public/sitemap-static.xml')

test('daily riddle ids and numbers are unique and do not clash with topic pages', () => {
  const ids = DAILY_RIDDLES.map(r => r.id)
  assert.equal(new Set(ids).size, ids.length)
  assert.equal(new Set(DAILY_RIDDLES.map(r => r.n)).size, ids.length)
  const topics = new Set([...RIDDLE_PAGES.map(p => p.slug), 'topics', 'daily'])
  for (const id of ids) {
    assert.match(id, /^[a-z0-9-]+$/)
    assert.ok(!topics.has(id), `${id} clashes with a riddle topic page`)
  }
})

test('every daily riddle has a question, an answer and an explanation', () => {
  for (const r of DAILY_RIDDLES) {
    assert.ok(['seq', 'eq', 'text', 'image'].includes(r.kind), r.id)
    if (r.kind === 'image') assert.ok(read(`public${r.image}`).trim(), `${r.id}: image`)
    assert.ok((r.kind === 'seq' ? r.items : r.lines)?.length >= 2, r.id)
    for (const k of ['title', 'ask', 'answer', 'why', 'type', 'date']) assert.ok(String(r[k] || '').trim(), `${r.id}: ${k}`)
    assert.match(r.date, /^\d{4}-\d{2}-\d{2}$/)
  }
})

test('a riddle video, when given, is a YouTube id (shown on the home page without the answer)', () => {
  for (const r of DAILY_RIDDLES) if (r.youtube !== undefined) assert.match(r.youtube, /^[\w-]{11}$/, r.id)
  const box = read('src/components/home/DailyRiddleBox.jsx')
  assert.match(box, /DAILY_RIDDLES\[0\]/)
  assert.match(box, /open\s*\n?\s*\?/, 'the answer is shown only after the visitor asks')
  assert.match(read('src/pages/Home.jsx'), /<DailyRiddleBox \/>/)
})

test('newest riddle first', () => {
  for (let i = 1; i < DAILY_RIDDLES.length; i++) {
    assert.ok(DAILY_RIDDLES[i - 1].n > DAILY_RIDDLES[i].n)
    assert.ok(DAILY_RIDDLES[i - 1].date >= DAILY_RIDDLES[i].date)
  }
})

test('the list and every riddle page are in the sitemap', () => {
  for (const path of ['/riddles/daily', ...DAILY_RIDDLES.map(dailyRiddlePath)]) assert.ok(sitemap.includes(`<loc>https://ugabuga.co.il${path}</loc>`), path)
})
