import test from 'node:test'
import assert from 'node:assert/strict'
import { buildLiveQuiz, detectLiveQuizPack, LIVE_QUIZ_TOPICS } from '../src/data/liveQuizPacks.js'
import { PURIM_LIVE_QUIZ_BANK, PURIM_SOURCE } from '../src/data/liveQuizPurim.js'
import { liveQuestionProblem } from '../src/utils/liveQuizDb.js'

test('Purim pack is listed right after Hanukkah', () => {
  const index = LIVE_QUIZ_TOPICS.findIndex(item => item.id === 'purim')
  assert.equal(index, LIVE_QUIZ_TOPICS.findIndex(item => item.id === 'hanukkah') + 1)
  assert.equal(LIVE_QUIZ_TOPICS[index].label, 'פורים')
})

test('Purim pack: 14 valid, distinct questions per level', () => {
  const allIds = []
  const allTexts = []
  for (const level of ['easy', 'medium', 'hard']) {
    const items = PURIM_LIVE_QUIZ_BANK[level]
    assert.equal(items.length, 14, level)
    const positions = new Set()
    for (const item of items) {
      assert.equal(item.options.length, 4, item.id)
      assert.equal(new Set(item.options).size, 4, item.id)
      assert.ok(item.options.every(text => text.trim() && !/כל התשובות/.test(text)), item.id)
      assert.ok(Number.isInteger(item.correct) && item.correct >= 0 && item.correct < 4, item.id)
      assert.ok(item.q.endsWith('?'), item.id)
      positions.add(item.correct)
    }
    assert.equal(positions.size, 4, `correct answers spread in ${level}`)
    allIds.push(...items.map(item => item.id))
    allTexts.push(...items.map(item => item.q))
  }
  assert.equal(new Set(allIds).size, 42)
  assert.equal(new Set(allTexts).size, 42)
})

test('Purim games build with the Megillah source and are detected as Purim', () => {
  assert.ok(PURIM_SOURCE.url.startsWith('https://'))
  for (const level of ['easy', 'medium', 'hard']) {
    const game = buildLiveQuiz('purim', level, 8, [], () => 0.3)
    assert.ok(game.title.startsWith('פורים'))
    assert.equal(game.poolSize, 14)
    assert.equal(liveQuestionProblem(game.questions), '')
    assert.ok(game.questions.every(item => item.packTopicId === 'purim' && item.source === PURIM_SOURCE))
    assert.equal(detectLiveQuizPack(game.questions).topicId, 'purim')
  }
  // Hanukkah keeps its own source after the holiday map refactor.
  const hanukkah = buildLiveQuiz('hanukkah', 'easy', 6, [], () => 0.3)
  assert.ok(hanukkah.questions.every(item => item.source.url.includes('chanukah')))
})
