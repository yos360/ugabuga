// /speech/language/grammar: the singular/plural list (checked against a hand-verified table),
// gender/tense/possessive/connector gap sentences, and the route/sitemap/search/menu entries.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  PLURALS, PLURAL_KINDS, GENDER_VERBS, ADJECTIVES, COLORS, TENSE_VERBS, TIMES, POSSESSIVE_WORDS, LADDERS, LADDER_STEPS,
  GAP_SECTIONS, gapsFor, fill, gapShown, gapSpoken, pluralsOf, tenseSentence,
} from '../src/data/speech/grammar.js'

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const NIKUD = /[֑-ׇ]/
const PATH = '/speech/language/grammar'

// Every plural form, verified by hand (standard Hebrew, full spelling).
const VERIFIED = {
  כלב: 'כלבים', חתול: 'חתולים', דג: 'דגים', בלון: 'בלונים', פרח: 'פרחים', ילד: 'ילדים', ספר: 'ספרים', תפוח: 'תפוחים', פרפר: 'פרפרים',
  מטוס: 'מטוסים', עכבר: 'עכברים', עץ: 'עצים', כדור: 'כדורים', ענן: 'עננים', תות: 'תותים',
  פרה: 'פרות', עוגה: 'עוגות', מכונית: 'מכוניות', חולצה: 'חולצות', בננה: 'בננות', סירה: 'סירות', שמלה: 'שמלות', משאית: 'משאיות',
  כפית: 'כפיות', גלידה: 'גלידות', רכבת: 'רכבות', ילדה: 'ילדות', דלת: 'דלתות', תרנגולת: 'תרנגולות',
  עיפרון: 'עפרונות', שולחן: 'שולחנות', חלון: 'חלונות', תינוק: 'תינוקות', מפתח: 'מפתחות', כיסא: 'כיסאות', אריה: 'אריות', ארון: 'ארונות',
  ביצה: 'ביצים', ציפור: 'ציפורים', נמלה: 'נמלים', דבורה: 'דבורים', יונה: 'יונים', צפרדע: 'צפרדעים', אבן: 'אבנים', עיר: 'ערים',
  עין: 'עיניים', אוזן: 'אוזניים', יד: 'ידיים', רגל: 'רגליים', נעל: 'נעליים', שן: 'שיניים',
  אישה: 'נשים', איש: 'אנשים', בית: 'בתים',
}

test('plurals match the verified table, with a picture and a consistent kind', () => {
  assert.deepEqual(Object.fromEntries(PLURALS.map(x => [x.s, x.p])), VERIFIED)
  const kinds = new Set(PLURAL_KINDS.map(k => k.id))
  for (const x of PLURALS) {
    assert.ok(kinds.has(x.kind), x.s)
    assert.ok(x.e || x.i, `${x.s} has no picture`)
    assert.ok(!NIKUD.test(x.s + x.p), x.s)
    if (x.kind === 'im') assert.ok(x.g === 'm' && x.p.endsWith('ים'), x.s)
    if (x.kind === 'ot') assert.ok(x.g === 'f' && x.p.endsWith('ות'), x.s)
    if (x.kind === 'mOt') assert.ok(x.g === 'm' && x.p.endsWith('ות'), x.s)
    if (x.kind === 'fIm') assert.ok(x.g === 'f' && x.p.endsWith('ים') && !x.p.endsWith('יים'), x.s)
    if (x.kind === 'pair') assert.ok(x.p.endsWith('יים'), x.s)
  }
  for (const k of PLURAL_KINDS) assert.ok(PLURALS.filter(x => x.kind === k.id).length >= 3, k.id)
  assert.ok(pluralsOf('regular').length >= 16 && pluralsOf('tricky').length >= 16)
})

test('gender, adjective and tense forms are complete and distinct', () => {
  for (const v of GENDER_VERBS) {
    assert.equal(new Set([v.m, v.f, v.mp, v.fp]).size, 4, v.m)
    assert.ok(v.mp.endsWith('ים') && v.fp.endsWith('ות'), v.m)
  }
  for (const a of [...ADJECTIVES, ...COLORS]) {
    assert.ok(a.n.startsWith('ה') && a.e && ['m', 'f'].includes(a.g), a.n)
    assert.ok(a.f.endsWith('ה') && a.f !== a.m, a.m)
  }
  for (const v of TENSE_VERBS) for (const g of ['m', 'f']) {
    assert.equal(v[g].length, 3)
    assert.equal(new Set(v[g]).size, 3, `${v.id} ${g}`)
    assert.ok(g === 'm' ? v.m[2].startsWith('י') : v.f[2].startsWith('ת'), `${v.id} future ${g}`)
  }
  assert.equal(tenseSentence(TENSE_VERBS[0], 'f', 2), 'מחר נועה תאכל גלידה.')
  assert.deepEqual(TIMES.map(t => t.word), ['אתמול', 'עכשיו', 'מחר'])
})

test('gap sentences: one gap, the answer among distinct options, niqqud only in שֶׁלְּךָ / שֶׁלָּךְ', () => {
  for (const [sec] of GAP_SECTIONS) {
    const items = gapsFor(sec)
    assert.ok(items.length >= 10, `${sec}: ${items.length}`)
    for (const x of items) {
      assert.equal(x.text.split('_').length, 2, x.text)
      assert.ok(x.opts.includes(x.ans), x.text)
      assert.equal(new Set(x.opts).size, x.opts.length, x.text)
      assert.ok(x.pics.length >= 1, x.text)
      const full = fill(x.text, x.ans)
      assert.ok(!full.includes('_') && /[.”]$/.test(full), full)
      if (NIKUD.test(full)) assert.ok(POSSESSIVE_WORDS.includes(x.ans) && NIKUD.test(x.ans), full)
      assert.ok(!gapShown(x.text).includes('_ ') || gapShown(x.text).includes('___'), x.text)
      assert.ok(gapSpoken(x.text).includes('...'), x.text)
    }
  }
  assert.equal(fill('קנינו תפוחים _בננות.', 'ו'), 'קנינו תפוחים ובננות.')
  assert.equal(gapShown('קנינו תפוחים _בננות.'), 'קנינו תפוחים ___ בננות.')
  const mixed = gapsFor('gender').find(x => x.text.startsWith('הילדים '))
  assert.ok(mixed && mixed.ans.endsWith('ים') && mixed.pics.includes('👧'), 'mixed group uses the masculine plural')
})

test('sentence ladders grow step by step', () => {
  for (const l of LADDERS) {
    assert.equal(l.steps.length, LADDER_STEPS.length)
    l.steps.forEach((s, i) => { if (i) assert.ok(s.length > l.steps[i - 1].length, s) })
  }
})

test('route, sitemap, search, menu and the workbook link', () => {
  const app = read('src/App.jsx'), sitemap = read('public/sitemap-static.xml'), search = read('src/data/searchStatic.js'), menu = read('src/data/siteMenu.js')
  assert.ok(app.includes(`path="${PATH}"`))
  assert.ok(sitemap.includes(`https://ugabuga.co.il${PATH}<`))
  assert.ok(search.includes(`to: '${PATH}'`))
  assert.ok(menu.includes(`to: '${PATH}'`))
  const page = read('src/pages/speech/language/Grammar.jsx')
  assert.ok(page.includes("'/printables/singular-plural-verbs-workbook'"))
  assert.ok(app.includes('path="/printables/singular-plural-verbs-workbook"'))
})
