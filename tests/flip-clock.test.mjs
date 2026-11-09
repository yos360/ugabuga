import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// FlipClock.jsx imports CSS and React, so check the Hebrew-numeral helper by evaluating its source alone.
const src = readFileSync(new URL('../src/pages/tools/FlipClock.jsx', import.meta.url), 'utf8')
const body = src.slice(src.indexOf('export function gematriya'), src.indexOf('let hebFmt'))
const gematriya = new Function(body.replace('export ', '') + '; return gematriya')()

test('gematriya writes Hebrew dates the usual way', () => {
  assert.equal(gematriya(29), 'כ״ט')
  assert.equal(gematriya(1), 'א׳')
  assert.equal(gematriya(10), 'י׳')
  assert.equal(gematriya(15), 'ט״ו')
  assert.equal(gematriya(16), 'ט״ז')
  assert.equal(gematriya(5787), 'תשפ״ז')
  assert.equal(gematriya(5785), 'תשפ״ה')
  assert.equal(gematriya(5800), 'ת״ת')
})

test('flip clock page is registered', () => {
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
  assert.match(app, /path="\/tools\/flip-clock"/)
  const news = readFileSync(new URL('../src/data/whatsNew.js', import.meta.url), 'utf8')
  assert.match(news, /\/tools\/flip-clock/)
})
