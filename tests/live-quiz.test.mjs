import test from 'node:test'
import assert from 'node:assert/strict'
import { buildLiveQuiz, detectLiveQuizPack, LIVE_QUIZ_DIFFICULTIES, LIVE_QUIZ_TOPICS } from '../src/data/liveQuizPacks.js'
import { EXTRA_LIVE_QUIZ_BANK } from '../src/data/liveQuizExtraPacks.js'
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

test('ready game bank adds at least 100 reviewed questions with sources', () => {
  const extra = Object.values(EXTRA_LIVE_QUIZ_BANK).flatMap(levels => Object.values(levels).flat())
  assert.equal(extra.length, 108)
  for (const item of extra) {
    assert.ok(item.id)
    assert.equal(item.options.length, 4)
    assert.ok(item.correct >= 0 && item.correct < item.options.length)
    assert.ok(item.q.endsWith('?'))
  }
  for (const topic of LIVE_QUIZ_TOPICS) for (const difficulty of LIVE_QUIZ_DIFFICULTIES) {
    const game = buildLiveQuiz(topic.id, difficulty.id, 8, [], () => 0.37)
    assert.equal(game.poolSize, 14)
    assert.ok(game.questions.every(item => item.verified && item.source?.url?.startsWith('https://')))
  }
})

test('ready games do not repeat a question before that pool is exhausted', () => {
  for (const topic of LIVE_QUIZ_TOPICS) for (const difficulty of LIVE_QUIZ_DIFFICULTIES) {
    const first = buildLiveQuiz(topic.id, difficulty.id, 6, [], () => 0.21)
    const second = buildLiveQuiz(topic.id, difficulty.id, 6, first.history, () => 0.21)
    const firstIds = new Set(first.questions.map(item => item.id))
    assert.ok(second.questions.every(item => !firstIds.has(item.id)))
    assert.equal(new Set([...first.questions, ...second.questions].map(item => item.id)).size, 12)
  }
})

test('finished games can identify their ready-game topic for a fresh round', () => {
  const game = buildLiveQuiz('animals', 'hard', 6, [], () => 0.28)
  assert.deepEqual(detectLiveQuizPack(game.questions), { topicId: 'animals', difficultyId: 'hard', matches: 6 })
  assert.deepEqual(detectLiveQuizPack([{ id: 'legacy-random-id' }], game.title), { topicId: 'animals', difficultyId: 'hard', matches: 0 })
  assert.equal(detectLiveQuizPack([{ id: 'custom-question' }], 'החידון של הכיתה'), null)
})
