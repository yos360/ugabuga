import test from 'node:test'
import assert from 'node:assert/strict'
import { BANDS, ALL_QUESTIONS, DAYS, PLANETS, scaleCm } from '../src/data/spaceWeek.js'

test('four bands, six questions each, unique ids and valid answers', () => {
  assert.deepEqual(BANDS.map(b => b.id), ['gan', 'g12', 'g34', 'g56'])
  assert.equal(new Set(ALL_QUESTIONS.map(q => q.id)).size, ALL_QUESTIONS.length)
  for (const b of BANDS) {
    assert.equal(b.quiz.length, 6, b.id)
    for (const q of b.quiz) {
      assert.ok(q.id.startsWith(b.id + '-'), q.id)
      assert.ok(q.answer >= 0 && q.answer < q.options.length, q.id)
      assert.equal(new Set(q.options).size, q.options.length, q.id)
      assert.ok(q.explain, q.id)
    }
  }
})

test('lesson minutes add up and every band has a worksheet with answers and a craft', () => {
  for (const b of BANDS) {
    assert.equal(b.lesson.reduce((s, x) => s + x.min, 0), b.minutes, b.id)
    assert.ok(b.sheet.tf.length >= 4 && b.sheet.tf.every(t => typeof t.a === 'boolean'), b.id)
    for (const f of b.sheet.fill || []) {
      assert.equal(f.s.split('________').length, 2, f.s)
      assert.ok(b.sheet.bank.includes(f.a), f.a)
    }
    assert.ok(b.craft.materials.length && b.craft.steps.length, b.id)
    for (const l of b.links) assert.ok(l.href.startsWith('/'), l.href)
  }
  assert.equal(DAYS.length, 5)
})

test('scale model keeps the planets in order and Neptune past 3 metres', () => {
  for (let i = 1; i < PLANETS.length; i++) assert.ok(PLANETS[i].au > PLANETS[i - 1].au)
  assert.equal(scaleCm(1), 10)
  assert.equal(scaleCm(PLANETS.at(-1).au), 301)
})
