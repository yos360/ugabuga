import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { PARASHOT } from '../src/data/parashot.js'
import { readingForDate } from '../src/utils/parashaCalendar.js'
import { buildParashaQuiz, quizPrintPlan, sourceHref } from '../src/utils/parashaQuiz.js'

const counts = JSON.parse(readFileSync(new URL('./fixtures/torah-verse-counts.json', import.meta.url))).chapters
const point = (c, v) => c * 1000 + v
function range(ref) {
  const [, book, c, v, ec, ev] = ref.match(/^(\w+) (\d+):(\d+)(?:-(?:(\d+):)?(\d+))?$/) || []
  assert.ok(book, `invalid reference: ${ref}`)
  const start = [+c, +v], end = [+(ec || c), +(ev || v)]
  for (const [chapter, verse] of [start, end]) assert.ok(verse > 0 && verse <= counts[book]?.[chapter - 1], ref)
  assert.ok(point(...end) >= point(...start), ref)
  return { book, start: point(...start), end: point(...end) }
}

test('all 540 quiz questions have valid Hebrew-numbered verses within their own portion', () => {
  assert.equal(PARASHOT.length, 54)
  for (const p of PARASHOT) {
    const portion = range(p.ref)
    assert.equal(p.quizQuestions.length, 10, p.slug)
    assert.equal(new Set(p.quizQuestions.map(q => q.q)).size, 10, p.slug)
    for (const q of p.quizQuestions) {
      assert.ok(q.q.endsWith('?') || q.q.endsWith('.'), q.q)
      assert.ok(q.a.length > 1)
      assert.ok(q.sources.length > 0)
      for (const ref of q.sources) {
        const r = range(ref)
        assert.equal(r.book, portion.book)
        assert.ok(r.start >= portion.start && r.end <= portion.end, `${p.slug}: ${ref}`)
        assert.equal(new URL(sourceHref(ref)).hostname, 'www.sefaria.org')
      }
    }
  }
})

test('a classroom pack has 30 question-only sheets and exactly one final teacher key', () => {
  const plan = quizPrintPlan('pack', 30)
  assert.equal(plan.length, 31)
  assert.ok(plan.slice(0, 30).every(s => s.kind === 'students'))
  assert.equal(plan[30].kind, 'teacher')
  assert.equal(new Set(plan.map(s => s.key)).size, 31)
  assert.equal(quizPrintPlan('teacher', 30).length, 1)
  assert.equal(quizPrintPlan('students', '').length, 1)
  assert.equal(quizPrintPlan('upside', -5).length, 1)
  assert.equal(quizPrintPlan('inline', 400).length, 40)
})

test('single, doubled and holiday readings produce the right quiz', () => {
  assert.equal(buildParashaQuiz([PARASHOT[0]]).questions.length, 10)
  assert.equal(buildParashaQuiz([PARASHOT[0]], true).questions.length, 5)
  const double = readingForDate('2024-09-28')
  const quiz = buildParashaQuiz(double.portions)
  assert.equal(quiz.questions.length, 10)
  assert.deepEqual(quiz.questions.map(q => q.portion), [...Array(5).fill(double.portions[0].name), ...Array(5).fill(double.portions[1].name)])
  assert.equal(buildParashaQuiz(double.portions, true).questions.length, 6)
  assert.equal(buildParashaQuiz(readingForDate('2024-04-27').portions), null)
})
