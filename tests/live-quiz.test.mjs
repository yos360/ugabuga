import test from 'node:test'
import assert from 'node:assert/strict'
import { buildLiveQuiz, LIVE_QUIZ_DIFFICULTIES, LIVE_QUIZ_TOPICS } from '../src/data/liveQuizPacks.js'
import { cleanCode, liveQuestionProblem, liveSecondsRemaining } from '../src/utils/liveQuizDb.js'

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

test('live countdown is unknown until it has a valid server timestamp', () => {
  assert.equal(liveSecondsRemaining(null, 1_000), null)
  assert.equal(liveSecondsRemaining('not-a-date', 1_000), null)
  assert.equal(liveSecondsRemaining('1970-01-01T00:00:06.100Z', 1_000), 6)
  assert.equal(liveSecondsRemaining('1970-01-01T00:00:00.500Z', 1_000), 0)
})

test('ready games cover every topic and difficulty with valid questions', () => {
  assert.equal(LIVE_QUIZ_TOPICS.length, 6)
  assert.deepEqual(LIVE_QUIZ_DIFFICULTIES.map(item => item.id), ['easy','medium','hard'])
  for (const topic of LIVE_QUIZ_TOPICS) for (const difficulty of LIVE_QUIZ_DIFFICULTIES) {
    const game = buildLiveQuiz(topic.id, difficulty.id, 8, '', () => 0.42)
    assert.equal(game.questions.length, 8)
    assert.equal(liveQuestionProblem(game.questions), '')
  }
})

test('automatic game avoids returning the exact previous question order', () => {
  const first = buildLiveQuiz('science', 'medium', 6, '', () => 0.5)
  const second = buildLiveQuiz('science', 'medium', 6, first.signature, () => 0.5)
  assert.notEqual(second.signature, first.signature)
})
