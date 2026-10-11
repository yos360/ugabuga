// Grade-level spokes: gifted-test grade pages, reading comprehension by grade,
// the first-grade preparation booklet and the five-letter word game.
import { test } from 'node:test'
import assert from 'node:assert/strict'
const { GRADE_SETS, ADV_SERIES, ADV_VERBAL, ADV_LOGIC, ADVANCED } = await import('../src/learn/gifted/giftedGrades.js')
const { GRADE_TEXT } = await import('../src/learn/gifted/giftedGradeText.js')
const { GRADED_READING, GRADE_WORDS, READING_GRADE_PAGES } = await import('../src/learn/readingGrades.js')
const { READING } = await import('../src/learn/learnData.js')
const { BOOKLET_PAGES, FIND_ROWS, FIND_TARGET_COUNT, COUNT_BOXES } = await import('../src/components/classroom/firstGradeBookletData.js')
const five = await import('../src/arcade/logic/fiveWords.js')

// ── gifted test by grade ──
test('every gifted grade page has at least 25 fitting questions, each with exactly one correct option', () => {
  assert.deepEqual(GRADE_SETS.map(g => g.slug), ['grade-2', 'grade-3', 'grade-6', 'stage-b'])
  for (const g of GRADE_SETS) {
    assert.ok(g.pool.length >= 25, `${g.slug}: ${g.pool.length} questions`)
    assert.ok(GRADE_TEXT[g.slug], `${g.slug} has page copy`)
    const t = GRADE_TEXT[g.slug]
    assert.ok(t.faq.length >= 3 && t.faq.length <= 5, g.slug)
    assert.ok(t.intro.includes(g.keyword.replace(/ ([בגו])$/, ' $1׳')) || t.intro.includes(g.keyword), `${g.slug}: keyword in the first paragraph`)
    const ids = new Set()
    for (const { type, item } of g.pool) {
      assert.ok(!ids.has(item.id), `${g.slug}: duplicate ${item.id}`); ids.add(item.id)
      assert.ok(g.levels.includes(item.level), `${g.slug}: ${item.id} level ${item.level}`)
      assert.equal(item.options.length, 4, item.id)
      assert.equal(new Set(item.options.map(o => JSON.stringify(o))).size, 4, `${item.id}: options distinct`)
      assert.ok(Number.isInteger(item.answer) && item.answer >= 0 && item.answer < 4, item.id)
      assert.ok(['verbal', 'series', 'matrices', 'logic'].includes(type))
    }
    // all four types appear where the levels allow it
    assert.ok(new Set(g.pool.map(p => p.type)).size >= 3, g.slug)
  }
})

function nth(rule, i) { // independent re-implementation
  if (rule.k === 'cycle') { let x = rule.a; for (let j = 0; j < i; j++) { const [o, n] = rule.ops[j % rule.ops.length]; x = { '+': x + n, '-': x - n, '*': x * n, '/': x / n }[o] } return x }
  if (rule.k === 'grow') return rule.a + Array.from({ length: i }, (_, j) => rule.d + j * rule.dd).reduce((s, v) => s + v, 0)
  if (rule.k === 'fib') { let a = rule.a, b = rule.b; for (let j = 0; j < i; j++) [a, b] = [b, a + b]; return a }
  if (rule.k === 'squares') return (rule.from + i) * (rule.from + i)
  if (rule.k === 'affine') { let x = rule.a; for (let j = 0; j < i; j++) x = rule.m * x + rule.c; return x }
  if (rule.k === 'inter') { const s = i % 2 === 0 ? rule.x : rule.y; return s.a + s.d * Math.floor(i / 2) }
  throw new Error(rule.k)
}
test('advanced (grade 6) questions: series answers follow the rule; written questions have one answer and an explanation', () => {
  assert.equal(ADVANCED.length, ADV_SERIES.length + ADV_VERBAL.length + ADV_LOGIC.length)
  for (const s of ADV_SERIES) {
    s.seq.forEach((v, i) => assert.equal(v, nth(s.rule, i), `${s.id} term ${i}`))
    const next = nth(s.rule, s.seq.length)
    assert.equal(s.options[s.answer], next, s.id)
    assert.equal(s.options.filter(o => o === next).length, 1, s.id)
    for (const o of s.options) assert.ok(Number.isInteger(o) && o > 0, s.id)
  }
  for (const it of [...ADV_VERBAL, ...ADV_LOGIC]) {
    assert.ok(it.exp.length > 20, it.id)
    assert.equal(new Set(it.options).size, 4, it.id)
  }
  for (const it of ADV_VERBAL) assert.ok(!it.options.includes(it.ask) && !it.options.includes(it.pair[0]), `${it.id}: an option repeats the question`)
  const pos = new Set(ADVANCED.map(a => a.item.answer))
  assert.ok(pos.size >= 3, 'answers spread over positions')
})

// ── reading comprehension by grade ──
const words = r => r.text.join(' ').split(/\s+/).filter(Boolean).length
test('reading: at least 4 original passages per grade 2–6, in the grade word range, with 5–7 questions', () => {
  const slugs = new Set(READING.map(r => r.slug))
  for (const g of [2, 3, 4, 5, 6]) {
    const list = GRADED_READING.filter(r => r.level === g)
    assert.ok(list.length >= 4, `grade ${g}: ${list.length} passages`)
    const [lo, hi] = GRADE_WORDS[g]
    for (const r of list) {
      assert.ok(!slugs.has(r.slug), `duplicate slug ${r.slug}`); slugs.add(r.slug)
      assert.match(r.slug, /^[a-z0-9-]+$/)
      const w = words(r)
      assert.ok(w >= lo && w <= hi, `${r.slug}: ${w} words, expected ${lo}–${hi}`)
      const n = r.q.length + r.open.length
      assert.ok(n >= 5 && n <= 7, `${r.slug}: ${n} questions`)
      assert.ok(r.q.length >= 4 && r.open.length >= 1, `${r.slug}: closed and open questions`)
      for (const [q, opts, c] of r.q) {
        assert.equal(opts.length, 4, q)
        assert.equal(new Set(opts).size, 4, q)
        assert.ok(Number.isInteger(c) && c >= 0 && c < 4, q)
      }
      for (const [q, a] of r.open) assert.ok(q.length > 10 && a && a.length > 10, `${r.slug}: open question needs a model answer`)
      assert.ok(!/[a-zA-Z]/.test(r.text.join(' ')), `${r.slug}: Hebrew only`)
    }
    // lengths grow with the grade
    if (g > 2) assert.ok(Math.min(...list.map(words)) > Math.max(...GRADED_READING.filter(r => r.level === g - 1).map(words)) * 0.9, `grade ${g} is longer than grade ${g - 1}`)
    const page = READING_GRADE_PAGES[g]
    assert.ok(page && page.faq.length >= 3 && page.faq.length <= 5 && page.intro.startsWith('הבנת הנקרא כיתה'), `grade ${g} page copy`)
  }
  // correct answers are not always in the same position
  assert.ok(new Set(GRADED_READING.flatMap(r => r.q.map(q => q[2]))).size >= 3)
})

// ── first-grade booklet ──
test('first-grade booklet: 12–16 pages; find-the-letter rows have exactly 3 targets; counting answers distinct', () => {
  assert.ok(BOOKLET_PAGES.length >= 12 && BOOKLET_PAGES.length <= 16, `${BOOKLET_PAGES.length} pages`)
  for (const [t, row] of FIND_ROWS) {
    assert.equal([...row].length, 8, t)
    assert.equal([...row].filter(ch => ch === t).length, FIND_TARGET_COUNT, `row ${t}`)
  }
  const answers = COUNT_BOXES.map(b => b[1])
  assert.equal(new Set(answers).size, answers.length)
  for (const n of answers) assert.ok(n >= 1 && n <= 10)
})

// ── 5 אותיות ──
test('five-letter words: 5 Hebrew letters, final forms only (and always) at the end, no duplicates', () => {
  const { FIVE_WORDS } = five
  assert.ok(FIVE_WORDS.length >= 150)
  assert.equal(new Set(FIVE_WORDS).size, FIVE_WORDS.length)
  for (const w of FIVE_WORDS) {
    const l = [...w]
    assert.equal(l.length, 5, w)
    assert.match(w, /^[א-ת]+$/, w)
    assert.doesNotMatch(l.slice(0, -1).join(''), /[ךםןףץ]/, w)
    assert.doesNotMatch(l[4], /[כמנפצ]/, `${w}: last letter should be final`)
    assert.equal(five.shown(five.norm(l[4]), 4), l[4], w)
  }
})
test('five-letter scoring: hits, nears and repeated letters', () => {
  const { scoreGuess } = five
  assert.deepEqual(scoreGuess('שולחן', 'שולחן'), ['hit', 'hit', 'hit', 'hit', 'hit'])
  assert.deepEqual(scoreGuess('ספרים', 'ספרות'), ['hit', 'hit', 'hit', 'miss', 'miss'])
  // final and regular forms are the same letter
  assert.deepEqual(scoreGuess('שולחנ', 'שולחן'), ['hit', 'hit', 'hit', 'hit', 'hit'])
  // repeated guess letter: only as many "near" as the answer has
  assert.deepEqual(scoreGuess('ממממם', 'שולחן'), ['miss', 'miss', 'miss', 'miss', 'miss'])
  assert.deepEqual(scoreGuess('בבקשה', 'ביצים'), ['hit', 'miss', 'miss', 'miss', 'miss'])
  assert.deepEqual(scoreGuess('ילדים', 'דלתות'), ['miss', 'hit', 'near', 'miss', 'miss'])
  const ks = five.keyStates(['ילדים'], 'דלתות')
  assert.equal(ks['ל'], 'hit'); assert.equal(ks['ד'], 'near'); assert.equal(ks['י'], 'miss'); assert.equal(ks['מ'], 'miss')
})
test('word of the day: deterministic, from the list, and changes from day to day', () => {
  const { dailyWord, FIVE_WORDS } = five
  const days = Array.from({ length: 30 }, (_, i) => 20372 + i)
  for (const d of days) { assert.equal(dailyWord(d), dailyWord(d)); assert.ok(FIVE_WORDS.includes(dailyWord(d))) }
  for (let i = 1; i < days.length; i++) assert.notEqual(dailyWord(days[i]), dailyWord(days[i - 1]))
  assert.equal(new Set(days.map(dailyWord)).size, 30, 'no repeats within a month')
})
