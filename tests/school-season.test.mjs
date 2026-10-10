// School-season pages: staff gifts, graduations, supplies list, gan birthdays.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const S = await import('../src/data/schoolSeason.js')

test('page meta: unique paths, titles and h1s, descriptions 120–160 chars', () => {
  const pages = Object.values(S.SCHOOL_PAGES)
  assert.equal(pages.length, 6)
  for (const k of ['path', 'title', 'h1', 'description']) assert.equal(new Set(pages.map(p => p[k])).size, 6, k)
  for (const p of pages) {
    assert.match(p.path, /^\/[a-z0-9-]+\/[a-z0-9-]+$/, p.path)
    assert.ok(p.description.length >= 120 && p.description.length <= 160, `${p.path} description ${p.description.length}`)
    assert.ok(!/UGABUGA/.test(p.title), `${p.path} title has no site suffix`)
  }
})

test('the new paths do not collide with existing explicit routes or sitemap entries', () => {
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
  const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
  for (const p of Object.values(S.SCHOOL_PAGES)) {
    assert.ok(!sitemap.includes(`ugabuga.co.il${p.path}</loc>`) || app.includes(`path="${p.path}"`), `${p.path} already in sitemap but not wired`)
  }
})

test('splitByWeights: whole shekels that always add up to the total', () => {
  assert.deepEqual(S.splitByWeights(500, [2, 1]), [333, 167])
  assert.deepEqual(S.splitByWeights(100, [1, 1, 1]), [34, 33, 33])
  assert.deepEqual(S.splitByWeights(0, [1, 2]), [0, 0])
  assert.deepEqual(S.splitByWeights(90, [1, 0, 2]), [30, 0, 60])
  assert.deepEqual(S.splitByWeights(50, []), [])
  for (let t = 0; t < 400; t += 7) for (const w of [[2, 1], [1.5, 1, 1], [1, 1, 0.5, 2]]) {
    const parts = S.splitByWeights(t, w)
    assert.equal(parts.reduce((a, b) => a + b, 0), t)
    assert.ok(parts.every(Number.isInteger))
  }
})

test('groupGift: total, enabled recipients only, clamped inputs', () => {
  const r = S.groupGift({ families: 25, perFamily: 20, recipients: S.TEACHER_RECIPIENTS })
  assert.equal(r.total, 500)
  assert.equal(r.shares.length, S.TEACHER_RECIPIENTS.filter(x => x.on).length)
  assert.equal(r.shares.reduce((a, s) => a + s.amount, 0), 500)
  assert.ok(r.shares[0].amount > r.shares[1].amount, 'teacher gets the bigger share by default')
  const c = S.groupGift({ families: 999, perFamily: -5, recipients: S.GAN_RECIPIENTS })
  assert.equal(c.families, S.MAX_FAMILIES)
  assert.equal(c.total, 0)
  assert.equal(S.groupGift({ families: 'x', perFamily: 10, recipients: [] }).shares.length, 0)
  const msg = S.groupGiftMessage(r)
  assert.match(msg, /25 משפחות × 20 ₪ = 500 ₪/)
})

test('perFamilyFor rounds up', () => {
  assert.equal(S.perFamilyFor(600, 25), 24)
  assert.equal(S.perFamilyFor(601, 25), 25)
  assert.equal(S.perFamilyFor(0, 25), 0)
})

test('names: cleaned, capped, list parsing de-duplicates', () => {
  assert.equal(S.cleanName('  <b>נועה</b>  '), 'bנועה/b')
  assert.equal(S.cleanName('א'.repeat(50)).length, S.MAX_NAME)
  assert.deepEqual(S.parseNames('נועה כהן\nאורי, נועה כהן\n\n  דנה '), ['נועה כהן', 'אורי', 'דנה'])
  assert.equal(S.parseNames(Array.from({ length: 60 }, (_, i) => `ילד ${i}`).join('\n')).length, S.MAX_CERTS)
})

test('timelines: kindergarten 45–60 minutes, 6th grade up to an hour, clock times advance', () => {
  const kg = S.timelineMinutes(S.KG_TIMELINE), g6 = S.timelineMinutes(S.G6_TIMELINE)
  assert.ok(kg >= 45 && kg <= 60, `kg ${kg}`)
  assert.ok(g6 >= 45 && g6 <= 60, `g6 ${g6}`)
  const sch = S.scheduleFrom('17:30', S.KG_TIMELINE)
  assert.equal(sch[0].at, '17:30')
  assert.equal(sch[1].at, '17:35')
  assert.equal(S.scheduleFrom('bad', S.KG_TIMELINE)[0].at, '17:00')
  assert.equal(S.scheduleFrom('23:58', [{ min: 5 }, { min: 1 }])[1].at, '00:03')
})

test('FAQs: at least 5 per page, unique questions, real answers', () => {
  for (const faq of [S.TEACHER_FAQ, S.GAN_FAQ, S.KG_FAQ, S.G6_FAQ, S.SUPPLIES_FAQ, S.GAN_BIRTHDAY_FAQ]) {
    assert.ok(faq.length >= 5)
    assert.equal(new Set(faq.map(f => f.q)).size, faq.length)
    for (const f of faq) { assert.ok(f.q.endsWith('?'), f.q); assert.ok(f.a.length > 60, f.q) }
  }
})

test('card texts: both address forms, unique ids', () => {
  for (const list of [S.TEACHER_CARD_TEXTS, S.GAN_CARD_TEXTS]) {
    assert.equal(new Set(list.map(t => t.id)).size, list.length)
    for (const t of list) { assert.ok(t.f && t.m, t.id); assert.ok(!/[{}]/.test(t.f + t.m), t.id) }
  }
})

test('supplies: every level has unique items with sane quantities', () => {
  assert.deepEqual(S.SUPPLY_LEVELS.map(l => l.id), ['gan', 'a', 'b-c', 'd-f'])
  for (const l of S.SUPPLY_LEVELS) {
    assert.ok(l.items.length >= 8, l.id)
    assert.equal(new Set(l.items.map(i => i.id)).size, l.items.length, l.id)
    for (const i of l.items) assert.ok(Number.isInteger(i.qty) && i.qty >= 1 && i.qty <= S.MAX_QTY, `${l.id}.${i.id}`)
  }
  assert.equal(S.levelById('nope').id, 'a')
  assert.equal(S.normalizeQty('7'), 7)
  assert.equal(S.normalizeQty(500), S.MAX_QTY)
  assert.equal(S.normalizeQty(-3), 0)
  assert.equal(S.normalizeQty('abc'), 1)
})

test('supplies: state restore ignores junk, rows and share text', () => {
  const level = S.levelById('a')
  const st = S.restoreSupplyState(level, {
    items: { pencils: { qty: '12', done: 1 }, eraser: { removed: true, qty: 2 }, ghost: { qty: 3 } },
    custom: [{ id: 'c1', name: ' <i>מילון</i> ', qty: 2 }, { id: '', name: 'x' }, { id: 'c2', name: '' }],
  })
  assert.deepEqual(st.items.pencils, { qty: 12, done: true })
  assert.equal(st.items.ghost, undefined)
  assert.deepEqual(st.custom, [{ id: 'c1', name: 'iמילון/i', qty: 2, done: false }])
  const rows = S.supplyRows(level, st)
  assert.ok(!rows.some(r => r.id === 'eraser'), 'removed item hidden')
  assert.equal(rows.at(-1).id, 'c1')
  const text = S.supplyListText(level, st)
  assert.match(text, /✅ עפרונות × 12/)
  assert.match(text, /בית הספר/)
  const missing = S.supplyListText(level, st, { onlyMissing: true })
  assert.ok(!missing.includes('עפרונות'))
  assert.deepEqual(S.restoreSupplyState(level, 'junk'), S.initialSupplyState(level))
})

test('gan birthday: sections and questions text', () => {
  assert.ok(S.GAN_BIRTHDAY_SECTIONS.length >= 5)
  for (const s of S.GAN_BIRTHDAY_SECTIONS) assert.ok(s.paras.length >= 1 && s.paras.every(p => p.length > 60), s.id)
  const t = S.ganBirthdayQuestionsText('נועה')
  assert.match(t, /לנועה/)
  assert.equal(t.split('\n').length, S.GAN_BIRTHDAY_QUESTIONS.length + 1)
})

test('related links in the pages point to known routes', () => {
  const src = readFileSync(new URL('../src/pages/school/SchoolSeason.jsx', import.meta.url), 'utf8')
  const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
  const own = new Set(Object.values(S.SCHOOL_PAGES).map(p => p.path))
  const hrefs = new Set([...src.matchAll(/(?:href|to)[:=] ?['"](\/[^'"#?]*)['"]/g)].map(m => m[1]))
  assert.ok(hrefs.size > 20)
  for (const h of hrefs) {
    if (h === '/' || own.has(h)) continue
    assert.ok(sitemap.includes(`ugabuga.co.il${h}</loc>`), `link to unknown route ${h}`)
  }
})
