import { test } from 'node:test'
import assert from 'node:assert/strict'
import { KG_STORIES, storyWords, splitForPrint } from '../src/data/hanukkahKindergartenStories.js'
import { CIRCLE_PLANS, planMinutes } from '../src/data/hanukkahCircleTime.js'

test('kindergarten stories: length, questions, activity, print split', () => {
  assert.ok(KG_STORIES.length >= 4)
  for (const s of KG_STORIES) {
    const w = storyWords(s.paragraphs)
    assert.ok(w >= 240 && w <= 420, `${s.id} has ${w} words`)
    assert.ok(s.questions.length >= 4 && s.questions.length <= 5, s.id)
    assert.ok(s.activity.length > 30 && s.drawPrompt, s.id)
    const [a, b] = splitForPrint(s.paragraphs)
    assert.deepEqual([...a, ...b], s.paragraphs)
    assert.ok(a.length && b.length)
  }
  assert.equal(new Set(KG_STORIES.map(s => s.id)).size, KG_STORIES.length)
})

test('circle-time plans: 20 minutes, all fields present', () => {
  assert.ok(CIRCLE_PLANS.length >= 5)
  for (const p of CIRCLE_PLANS) {
    assert.equal(planMinutes(p), 20, p.id)
    for (const k of ['goal', 'question', 'mixed', 'student', 'title']) assert.ok(p[k], `${p.id}.${k}`)
    assert.ok(p.materials.length && p.steps.length >= 3, p.id)
  }
  for (const id of ['light-dark', 'oil', 'sevivon', 'sufganiyah', 'hanukkiah']) assert.ok(CIRCLE_PLANS.some(p => p.id === id), id)
})
