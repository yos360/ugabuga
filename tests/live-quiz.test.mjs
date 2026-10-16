import test from 'node:test'
import assert from 'node:assert/strict'
import { cleanCode, liveQuestionProblem } from '../src/utils/liveQuizDb.js'

test('live quiz codes are normalised for QR and manual entry', () => {
  assert.equal(cleanCode(' ab-c 12!z '), 'ABC12Z')
  assert.equal(cleanCode('abcdefgh'), 'ABCDEF')
})

test('live quiz validation protects playable question payloads', () => {
  const good = [{ q: 'כמה?', options: ['אחד', 'שניים'], correct: 1 }]
  assert.equal(liveQuestionProblem(good), '')
  assert.match(liveQuestionProblem([{ ...good[0], correct: null }]), /סמנו/)
  assert.match(liveQuestionProblem([{ ...good[0], options: ['אחד', ''] }]), /2–4/)
  assert.match(liveQuestionProblem([]), /שאלה אחת/)
})
