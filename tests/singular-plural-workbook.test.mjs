// The graded workbook "יחיד ורבים והטיית פעלים" (/printables/singular-plural-verbs-workbook):
// sheet structure, answer validity, verb forms checked against the regular patterns, and links both ways.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const W = await import('../src/data/singularPluralWorkbook.js')
const { SHEETS, LEVELS, questionsOf, isCorrect, shown, normalize } = W
const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const PATH = '/printables/singular-plural-verbs-workbook'

test('21 sheets: seven per level, each level ends with a self-check summary', () => {
  assert.equal(SHEETS.length, 21)
  assert.equal(new Set(SHEETS.map(s => s.id)).size, 21)
  for (const l of LEVELS) {
    const list = SHEETS.filter(s => s.level === l.id)
    assert.equal(list.length, 7, l.id)
    assert.ok(list.at(-1).summary && list.at(-1).rubric.length >= 3, `${l.id} summary`)
  }
})

test('every sheet has an instruction, a worked example and well-formed items', () => {
  for (const s of SHEETS) {
    assert.ok(s.title && s.instr.length > 10, s.id)
    assert.ok(s.example || s.exampleNote, `${s.id} example`)
    if (s.kind === 'pick') for (const it of [s.example, ...s.items]) {
      assert.equal(new Set(it.options).size, it.options.length, `${s.id} duplicate option`)
      assert.ok(Number.isInteger(it.a) && it.a >= 0 && it.a < it.options.length, `${s.id} answer index`)
    }
    if (s.kind === 'match') assert.deepEqual([...s.order].sort(), s.pairs.map((_, i) => i), s.id)
    if (s.kind === 'table') for (const r of s.rows) assert.equal(r.length, s.head.length, s.id)
    if (s.kind === 'sentence') for (const it of [s.example, ...s.items]) assert.equal(it.q.split('___').length, 2, it.q)
    const qs = questionsOf(s)
    assert.ok(qs.length >= 6, `${s.id} has ${qs.length} questions`)
    assert.equal(new Set(qs.map(q => q.key)).size, qs.length)
  }
})

test('typed answers ignore niqqud and spaces, and accept the listed alternatives', () => {
  assert.ok(isCorrect(' כּוֹתֶבֶת ', 'כותבת'))
  assert.ok(!isCorrect('כותב', 'כותבת'))
  assert.ok(!isCorrect('', 'כותבת'))
  assert.ok(isCorrect('תסגורנה', ['יסגרו', 'תסגורנה']))
  assert.equal(shown(['יסגרו', 'תסגורנה']), 'יסגרו')
})

// Final letters back to their regular form, so suffixes can be added.
const unfinal = w => w.replace(/[ךםןףץ]$/, c => ({ 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' })[c])
const cell = c => (typeof c === 'string' ? c : shown(c.a))

test('present tense: -ת / -ים / -ות on the masculine form', () => {
  const s = SHEETS.find(x => x.id === 'present-table')
  for (const row of [s.exampleRow, ...s.rows]) {
    const [m, f, mp, fp] = row.map(cell)
    const b = unfinal(m)
    assert.deepEqual([f, mp, fp], [b + 'ת', b + 'ים', b + 'ות'], m)
  }
})

test('past tense of regular verbs follows the base form', () => {
  const s = SHEETS.find(x => x.id === 'past-table')
  const SUF = { 'אני': 'תי', 'אתה': 'ת', 'את': 'ת', 'הוא': '', 'היא': 'ה', 'אנחנו': 'נו', 'הם': 'ו', 'הן': 'ו' }
  const base = s.rows.find(r => r[0] === 'הוא')
  for (const row of s.rows) for (let j = 1; j < row.length; j++) assert.equal(cell(row[j]), cell(base[j]) + SUF[row[0]], `${row[0]} ${s.head[j]}`)
})

test('future tense of the -o- verbs (אכתוב, תכתבי, יכתבו)', () => {
  const s = SHEETS.find(x => x.id === 'future-table')
  const root = { 'לכתוב': 'כתב', 'לסגור': 'סגר', 'לשמור': 'שמר' }
  const form = (p, r) => {
    const [a, b, c] = r
    return { 'אני': `א${a}${b}ו${c}`, 'אתה': `ת${a}${b}ו${c}`, 'את': `ת${a}${b}${c}י`, 'הוא': `י${a}${b}ו${c}`, 'היא': `ת${a}${b}ו${c}`, 'אנחנו': `נ${a}${b}ו${c}`, 'הם': `י${a}${b}${c}ו`, 'הן': `י${a}${b}${c}ו` }[p]
  }
  for (const row of s.rows) for (let j = 1; j < row.length; j++) assert.equal(cell(row[j]), form(row[0], root[s.head[j]]), `${row[0]} ${s.head[j]}`)
})

test('the irregular plurals are the standard ones', () => {
  const pairs = Object.fromEntries([
    ...SHEETS.filter(s => s.kind === 'match').flatMap(s => s.pairs.map(p => [p[0], p[1]])),
    ...SHEETS.filter(s => s.kind === 'write' && s.id !== 'plural-to-singular').flatMap(s => s.items.map(it => [it.q, shown(it.a)])),
    ...SHEETS.find(s => s.id === 'plural-to-singular').items.map(it => [shown(it.a), it.q]),
  ])
  const expect = { 'איש': 'אנשים', 'אישה': 'נשים', 'עיר': 'ערים', 'בית': 'בתים', 'יום': 'ימים', 'בת': 'בנות', 'שולחן': 'שולחנות', 'לילה': 'לילות', 'מילה': 'מילים', 'שנה': 'שנים', 'ביצה': 'ביצים', 'אבן': 'אבנים', 'עין': 'עיניים', 'שם': 'שמות', 'אב': 'אבות' }
  for (const [k, v] of Object.entries(expect)) assert.equal(normalize(pairs[k]), normalize(v), k)
})

test('the page is routed, listed, and linked with the singular-plural lesson both ways', () => {
  assert.match(read('src/App.jsx'), new RegExp(`<Route path="${PATH}" element={<SingularPluralWorkbook />}`))
  assert.ok(read('public/sitemap-static.xml').includes(`https://ugabuga.co.il${PATH}<`))
  assert.ok(read('src/data/searchStatic.js').includes(`to: '${PATH}'`))
  const lashon = read('src/learn/subjects/data/lashon.js')
  const lesson = lashon.slice(lashon.indexOf("slug: 'singular-plural'"), lashon.indexOf("slug: 'verb-tenses'"))
  assert.ok(lesson.includes(PATH))
  assert.ok(read('src/pages/printables/SingularPluralWorkbook.jsx').includes("'/learn/lashon/singular-plural'"))
})
