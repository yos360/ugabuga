import { test } from 'node:test'
import assert from 'node:assert/strict'
import { adaptQuestion } from '../src/learn/subjects/adaptQuestion.js'

test('adapted exam keeps the right answer among three options', () => {
  for (let k = 0; k < 40; k++) {
    const q = { id: `t#${k}`, q: 'שאלה', options: ['א1', 'ב2', 'ג3', 'ד4'], answer: k % 4 }
    const a = adaptQuestion(q)
    assert.equal(a.options.length, 3)
    assert.equal(a.options[a.answer], q.options[q.answer])
    assert.deepEqual(adaptQuestion(q), a, 'same question → same three options')
  }
})

test('"all of the above" questions keep all four options', () => {
  const q = { id: 'x#1', q: 'שאלה', options: ['א', 'ב', 'ג', 'כל התשובות נכונות'], answer: 3 }
  assert.equal(adaptQuestion(q), q)
})
