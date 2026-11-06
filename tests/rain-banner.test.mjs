import test from 'node:test'
import assert from 'node:assert/strict'
import { isRaining } from '../functions/api/rain.js'

const city = (precipitation, weather_code) => ({ current: { precipitation, weather_code } })

test('rain in one city is enough', () => {
  assert.equal(isRaining([city(0, 3), city(0.3, 95), city(0, 3), city(0, 2)]), true)
})

test('a rain code counts even before any is measured', () => {
  assert.equal(isRaining([city(0, 61), city(0, 3)]), true)
})

test('a dry thunderstorm code and clouds are not rain', () => {
  assert.equal(isRaining([city(0, 95), city(0, 3), city(0, 0)]), false)
})

test('a broken answer is not rain', () => {
  assert.equal(isRaining(null), false)
  assert.equal(isRaining({ error: true }), false)
})
