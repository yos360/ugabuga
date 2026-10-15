import test from 'node:test'
import assert from 'node:assert/strict'
import { triviaPrintPages, topicPrintQuestions } from '../src/utils/triviaPrint.js'
import { quizPrintPlan } from '../src/utils/parashaQuiz.js'

test('printed answers follow shuffled options and the exact dealt round', () => {
  const dealt = [{ q: 'שאלה א?', options: ['לא', 'כן', 'אולי'], answer: 1, explain: 'הסבר א' }, { q: 'שאלה ב?', options: ['נכון', 'שגוי'], answer: 0 }]
  const print = topicPrintQuestions(dealt)
  assert.deepEqual(print.map(q => q.a), ['כן', 'נכון'])
  assert.deepEqual(print.map(q => q.q), dealt.map(q => q.q))
  assert.deepEqual(print[0].options, dealt[0].options)
  assert.notEqual(print[0].options, dealt[0].options)
  assert.equal(print[0].explain, 'הסבר א')
})

test('pagination preserves every question and continuous numbering across answer keys and copies', () => {
  for (const count of [0, 1, 6, 7, 12, 20, 160]) {
    const questions = Array.from({ length: count }, (_, i) => ({ q: `Question ${i}`, a: String(i) }))
    const pages = triviaPrintPages(questions)
    assert.deepEqual(pages.flatMap(p => p.questions), questions)
    assert.equal(pages.length, Math.ceil(count / 6))
    pages.forEach((p, i) => assert.equal(p.start, i * 6))
  }
  const pages = triviaPrintPages(Array(12).fill({ q: 'Question', a: 'Answer' }))
  const plan = quizPrintPlan('pack', 30)
  assert.equal(plan.filter(p => p.kind === 'students').length * pages.length, 60)
  assert.equal(plan.filter(p => p.kind === 'teacher').length * pages.length, 2)
})
