import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { BLESSINGS } from '../src/data/hanukkahSongs.js'
import { HANEIROT_HALALU, MAOZ_TZUR, LIGHTING_STEPS, lightingBlessings, visibleLength, wrapLines } from '../src/data/hanukkahLighting.js'

test('the blessing wording changes only in the first blessing', () => {
  assert.deepEqual(lightingBlessings('ner'), BLESSINGS)
  const shel = lightingBlessings('shel')
  assert.ok(shel[0].text.includes('נֵר שֶׁל חֲנֻכָּה'))
  assert.equal(shel[1].text, BLESSINGS[1].text)
  assert.equal(shel[2].text, BLESSINGS[2].text)
})

test('wrapping keeps every word and the width the card was laid out for', () => {
  for (const [text, max] of [...lightingBlessings('shel').map(b => [b.text, 56]), ...lightingBlessings('shel').map(b => [b.text, 52]), ...lightingBlessings('shel').map(b => [b.text, 45]), [HANEIROT_HALALU, 80]]) {
    const lines = wrapLines(text, max)
    assert.equal(lines.join(' '), text)
    for (const line of lines) assert.ok(visibleLength(line) <= max, line)
  }
})

test('the full card holds its text inside the 270-high sheet', () => {
  assert.ok(wrapLines(HANEIROT_HALALU, 80).length <= 5)
  assert.ok(lightingBlessings('shel').every(b => wrapLines(b.text, 56).length <= 2))
  assert.ok(lightingBlessings('shel').every(b => wrapLines(b.text, 45).length <= 2))
  assert.equal(MAOZ_TZUR[0].lines.length, 4)
})

test('the steps are short enough for one printed line each', () => {
  assert.equal(LIGHTING_STEPS.length, 5)
  for (const step of LIGHTING_STEPS) assert.ok(visibleLength(step) <= 80, step)
})

test('the page is wired into the site', () => {
  const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
  const route = '/holidays/hanukkah/candle-lighting'
  assert.ok(read('src/App.jsx').includes(`path="${route}"`))
  assert.ok(read('public/sitemap-static.xml').includes(`${route}<`))
  assert.ok(read('src/data/searchStatic.js').includes(`to: '${route}'`))
  assert.ok(read('src/data/whatsNew.js').includes(`to: '${route}'`))
  assert.ok(read('src/pages/holidays/HanukkahHub.jsx').includes(`'${route}'`))
})
