import test from 'node:test'
import assert from 'node:assert/strict'
import { THEMES, LENGTHS, BANDS, POOLS, buildRoutine, mathExercise, seededRand, daySeed, suggestedTheme } from '../src/classroom/warmUp.js'

test('every theme and length builds a routine that fills the chosen minutes', () => {
  for (const { id } of THEMES) for (const len of LENGTHS) for (const { id: band } of BANDS) {
    const steps = buildRoutine({ theme: id, minutes: len.minutes, band }, seededRand(7))
    assert.equal(steps.length, Math.round(len.minutes * 60 / len.seconds), `${id} ${len.minutes}`)
    assert.ok(steps.every(s => s.seconds === len.seconds && s.title && s.text && s.emoji))
    assert.equal(new Set(steps.map(s => s.title)).size, steps.length, `no repeats in ${id} ${len.minutes}`)
  }
})

test('pools are big enough for the longest routine', () => {
  const most = Math.max(...LENGTHS.map(l => Math.round(l.minutes * 60 / l.seconds)))
  for (const [id, pool] of Object.entries(POOLS)) assert.ok(pool.length >= most, `${id} has ${pool.length}`)
})

test('sport and hanukkah routines end with a calming breath', () => {
  for (const theme of ['sport', 'hanukkah']) {
    const steps = buildRoutine({ theme, minutes: 3 }, seededRand(3))
    assert.match(steps.at(-1).title, /^ונרגעים/)
  }
})

test('math exercises are correct, whole and non-negative', () => {
  const rand = seededRand(11)
  for (const band of ['low', 'mid', 'high']) for (let i = 0; i < 500; i++) {
    const { text, answer, even } = mathExercise(band, rand)
    const [a, op, b] = text.split(' ')
    const x = Number(a), y = Number(b)
    const want = op === '+' ? x + y : op === '−' ? x - y : op === '×' ? x * y : x / y
    assert.equal(answer, want, text)
    assert.ok(Number.isInteger(answer) && answer >= 1, text)
    assert.equal(even, answer % 2 === 0)
    if (band === 'low') assert.ok(answer <= 20 && !['×', '÷'].includes(op), text)
  }
})

test('the day seed gives the same routine all day and a different one the next day', () => {
  const a = daySeed(new Date(2026, 10, 15, 8)), b = daySeed(new Date(2026, 10, 15, 20)), c = daySeed(new Date(2026, 10, 16, 8))
  assert.equal(a, b)
  assert.notEqual(a, c)
  const r1 = buildRoutine({ theme: 'sport' }, seededRand(a)).map(s => s.title)
  const r2 = buildRoutine({ theme: 'sport' }, seededRand(b)).map(s => s.title)
  assert.deepEqual(r1, r2)
})

test('Hanukkah theme is suggested only around Hanukkah 2026', () => {
  assert.equal(suggestedTheme(new Date(2026, 10, 1)), 'sport')
  assert.equal(suggestedTheme(new Date(2026, 10, 20)), 'hanukkah')
  assert.equal(suggestedTheme(new Date(2026, 11, 12)), 'hanukkah')
  assert.equal(suggestedTheme(new Date(2026, 11, 20)), 'sport')
})
