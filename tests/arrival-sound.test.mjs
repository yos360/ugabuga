import test from 'node:test'
import assert from 'node:assert/strict'
import { newArrivals } from '../src/utils/arrivalSound.js'

test('counts new visitors or page views between two refreshes', () => {
  assert.equal(newArrivals({ visitors: 5, pageviews: 20 }, { visitors: 7, pageviews: 21 }, 'visitor'), 2)
  assert.equal(newArrivals({ visitors: 5, pageviews: 20 }, { visitors: 5, pageviews: 23 }, 'pageview'), 3)
})
test('silent on the first load and when numbers drop', () => {
  assert.equal(newArrivals(null, { visitors: 9 }, 'visitor'), 0)
  assert.equal(newArrivals({ visitors: 9 }, { visitors: 3 }, 'visitor'), 0)
})
