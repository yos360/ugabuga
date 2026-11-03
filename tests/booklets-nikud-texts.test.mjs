import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/booklets/nikudTexts.jsx', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const data = src.slice(src.indexOf('export const TEXTS'), src.indexOf('const MARKS')).replace(/stage: '[^']*'/g, '') // stage labels are teacher-facing
const pointed = [...data.matchAll(/'([^']*[ְ-ׇ][^']*)'/g)].map(m => m[1])

test('nikud texts: only patach, kamatz, shva, chirik (plus dagesh and shin/sin dot)', () => {
  assert.ok(pointed.length > 80)
  for (const w of pointed) assert.doesNotMatch(w, /[ֱ-ֳֵֶֹ-ֻֽ-׀ׇ]/, w) // hataf, tzere, segol, cholam, kubutz, etc.
  for (const w of pointed) for (const word of w.split(/[^א-תְ-ׇ]+/).filter(Boolean)) if (word !== 'ו') assert.match(word, /[ְִַָ]/, word)
  // all four marks occur, and every word contains no bare vav-as-vowel (cholam/shuruk spellings)
  for (const mark of ['ַ', 'ָ', 'ְ', 'ִ']) assert.ok(data.includes(mark), mark)
})

test('nikud texts: eight texts, three questions each, answer index valid and options distinct', () => {
  const blocks = [...data.matchAll(/qs: \[(.*)\] \},?\n/g)].map(m => m[1])
  assert.equal(blocks.length, 8)
  for (const b of blocks) {
    const qs = [...b.matchAll(/\['[^']+', \[('[^']+'(?:, '[^']+'){2})\], ([012])\]/g)]
    assert.equal(qs.length, 3)
    for (const q of qs) assert.equal(new Set(q[1].match(/'[^']+'/g)).size, 3)
  }
})

test('nikud texts: registry pages, search and sitemap', () => {
  const reg = readFileSync(new URL('../src/booklets/registry.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
  const entry = reg.slice(reg.indexOf("slug: 'nikud-short-texts'"))
  assert.match(entry.slice(0, 200), /onRequest: true/)
  const pages = entry.slice(entry.indexOf('pages: ['), entry.indexOf('],', entry.indexOf('pages: ['))).match(/'[^']+'/g)
  assert.equal(pages.length, 12)
  assert.ok(readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8').includes('/booklets/nikud-short-texts<'))
  assert.ok(readFileSync(new URL('../src/data/searchStatic.js', import.meta.url), 'utf8').includes("to: '/booklets/nikud-short-texts'"))
})
