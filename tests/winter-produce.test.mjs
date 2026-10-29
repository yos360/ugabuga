import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { WINTER_PRODUCE, WINTER_FRUITS, WINTER_VEGETABLES, WINTER_PRODUCE_FAQ } from '../src/data/winterProduce.js'

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const PATH = '/printables/winter-fruits-vegetables'

test('winter produce: six fruits and six vegetables, each with Hebrew, English and a pronunciation', () => {
  assert.equal(WINTER_FRUITS.length, 6)
  assert.equal(WINTER_VEGETABLES.length, 6)
  assert.equal(new Set(WINTER_PRODUCE.map(p => p.id)).size, WINTER_PRODUCE.length)
  for (const p of WINTER_PRODUCE) {
    for (const k of ['he', 'en', 'say', 'note']) assert.ok(p[k], `${p.id}: ${k}`)
    assert.match(p.en, /^[a-z ]+$/, p.en)
    assert.match(p.he, /^[א-ת ]+$/, p.he)
  }
  assert.ok(WINTER_PRODUCE_FAQ.length >= 3)
})

test('every produce item has a drawing, and the sheets cover all of them', () => {
  const art = read('src/components/winterproduce/WinterProduceArt.jsx')
  const map = art.slice(art.indexOf('export const PRODUCE_ART'))
  for (const p of WINTER_PRODUCE) assert.match(map, new RegExp(`\\b${p.id}: [A-Z]`), `drawing for ${p.id}`)
  const sortOrder = art.match(/SORT_ORDER = \[([^\]]+)\]/)[1]
  for (const p of WINTER_PRODUCE) assert.ok(sortOrder.includes(`'${p.id}'`), `sort sheet: ${p.id}`)
})

test('the page is routed, in the sitemap and in site search, and linked from the hubs', () => {
  assert.ok(read('src/App.jsx').includes(`path="${PATH}"`))
  assert.ok(read('public/sitemap-static.xml').includes(`https://ugabuga.co.il${PATH}</loc>`))
  assert.ok(read('src/data/searchStatic.js').includes(`to: '${PATH}'`))
  assert.ok(read('src/pages/printables/WinterPrintables.jsx').includes(PATH))
  assert.ok(read('src/pages/english/EnglishPages.jsx').includes(PATH))
})
