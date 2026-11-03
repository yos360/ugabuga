import test from 'node:test'
import assert from 'node:assert/strict'
import * as D from '../src/booklets/wordProblemsGrade5Data.js'

test('grade 5 word problems: numbers appear in the story, results are whole and positive', () => {
  for (const name of ['ADDSUB', 'MULDIV', 'MONEY', 'MEASURE', 'MIXED']) {
    for (const [story, q, a, b, op, unit] of D[name]) {
      assert.ok(story.includes(String(a)) && story.includes(String(b)), story)
      assert.ok(q.endsWith('?') && unit, story)
      const r = D.result(a, b, op)
      assert.ok(Number.isInteger(r) && r > 0, story)
      assert.ok(op !== '÷' || a % b === 0, story)
    }
  }
})

test('grade 5 word problems: choice pages have three options and one valid answer', () => {
  for (const it of [...D.ASKS, ...D.TRUE_FALSE]) { assert.equal(it.o.length, 3); assert.ok(it.a >= 0 && it.a < 3); assert.equal(new Set(it.o).size, 3) }
  assert.ok(new Set([...D.ASKS, ...D.TRUE_FALSE].map(it => it.a)).size > 1)
})

test('grade 5 word problems: the unneeded number is in the story and the others are used', () => {
  for (const it of D.EXTRA) {
    const text = [...it.t, it.q].join(' ')
    for (const n of it.n) assert.ok(text.includes(String(n)), text)
    assert.ok(it.n.includes(it.x))
    assert.ok(!it.ex.includes(String(it.x)) || it.n.filter(n => it.ex.includes(String(n))).length > 2, it.ex)
    assert.equal(it.n.length, 3)
  }
})

test('grade 5 word problems: table answers and enough/not-enough answers are computed', () => {
  assert.deepEqual(D.TABLE_QS.map(q => q.a), ['מיכל', '8', '27', 'יואב', '7'])
  assert.equal(D.enoughAnswer(D.ENOUGH[1]), 'לא מספיק (חסרים 2 מקומות)')
  assert.equal(D.enoughAnswer(D.ENOUGH[0]), 'מספיק (נשארים 5 שקלים)')
  assert.ok(D.ENOUGH.some(r => r[1] >= r[2]) && D.ENOUGH.some(r => r[1] < r[2]))
  for (const [, op] of D.OPS) assert.ok(D.OP_NAME[op])
})
