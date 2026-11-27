import { test } from 'node:test'
import assert from 'node:assert/strict'
import { GAME_GRADES, gameTopics, makeGameQuestion, parseGamesGrade, gamesPath } from '../src/math/games.js'

test('every game grade has topics and valid four-option questions', () => {
  for (const g of GAME_GRADES) {
    assert.ok(gameTopics(g).length >= 5, `grade ${g} topics`)
    for (let s = 1; s <= 120; s++) {
      const q = makeGameQuestion(g, { level: 1 + (s % 3), seed: s })
      assert.ok(q, `grade ${g} seed ${s}`)
      assert.ok(q.options.includes(q.answer), `answer offered: grade ${g} seed ${s}`)
      assert.equal(new Set(q.options).size, q.options.length, `distinct options: grade ${g} seed ${s}`)
      assert.ok(q.options.length >= 2 && q.options.length <= 4)
    }
  }
})

test('one-topic games stay on that topic', () => {
  const t = gameTopics(2)[0]
  for (let s = 1; s <= 20; s++) assert.equal(makeGameQuestion(2, { seed: s, slugs: [t.slug] }).topic, t.slug)
})

test('grade slugs', () => {
  assert.equal(parseGamesGrade('grade-3'), 3)
  assert.equal(parseGamesGrade('grade-9'), null)
  assert.equal(gamesPath(4), '/math/games/grade-4')
})
