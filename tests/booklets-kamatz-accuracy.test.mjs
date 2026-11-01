import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/booklets/kamatzAccuracy.jsx', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const data = src.slice(src.indexOf('export const SYLLABLES'), src.indexOf('const Mark'))
const pointed = [...data.matchAll(/'([^']*[ְ-ׇ][^']*)'/g)].map(m => m[1])

test('kamatz booklet: every word is read with kamatz only', () => {
  assert.ok(pointed.length > 100)
  for (const w of pointed) {
    // kamatz, dagesh and the shin dot are the only marks allowed
    assert.doesNotMatch(w, /[ְ-ַֹ-ֻֽ-׀ׂ-ׇ]/, w)
    for (const word of w.match(/[א-תָּׁ]+/g)) assert.match(word, /[א-ת][ּׁ]?ָ/, word)
  }
})

test('kamatz booklet: answers come from the options and pages match the registry', () => {
  for (const m of data.matchAll(/options: \[([^\]]+)\], answer: '([^']+)'/g)) assert.ok(m[1].includes(`'${m[2]}'`), m[2])
  const reg = readFileSync(new URL('../src/booklets/registry.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
  const entry = reg.slice(reg.indexOf("slug: 'kamatz-accuracy'"))
  const pages = entry.slice(entry.indexOf('pages: ['), entry.indexOf('],', entry.indexOf('pages: ['))).match(/'[^']+'/g)
  assert.equal(pages.length, 13)
  assert.equal((src.match(/ n=\{\d+\}/g) || []).length, 11) // pages 2–12; the cover and certificate carry no number
  assert.ok(readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8').includes('/booklets/kamatz-accuracy<'))
})
