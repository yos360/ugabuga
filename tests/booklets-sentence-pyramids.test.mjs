import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/booklets/sentencePyramids.jsx', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const data = src.slice(src.indexOf('export const PYRAMIDS'), src.indexOf('export const OWN'))
const pyramids = [...data.matchAll(/lines: \[([^\]]+)\],\s*q1: \{ q: '[^']+', options: \[([^\]]+)\], answer: '([^']+)' \}, q2: \{ q: '[^']+', answer: '([^']+)' \}/g)]
const strings = m => m.match(/'[^']+'/g).map(s => s.slice(1, -1))
const words = s => s.replace(/[.,!?]/g, '').split(' ')

test('sentence pyramids: 16 pyramids, up to 4 growing lines, every word pointed', () => {
  assert.equal(pyramids.length, 16)
  for (const [, lines] of pyramids) {
    const ls = strings(lines)
    assert.ok(ls.length >= 2 && ls.length <= 4, ls[0])
    for (let i = 1; i < ls.length; i++) assert.ok(words(ls[i]).length > words(ls[i - 1]).length, ls[i])
    for (const w of ls.flatMap(words)) assert.match(w, /[ְ-ׇ]/, w)
  }
})

test('sentence pyramids: answers fit the options and the text, pages match the registry', () => {
  for (const [, lines, options, a1, a2] of pyramids) {
    assert.ok(strings(options).includes(a1), a1)
    // dagesh dropped: "קָטָן" is the answer to "הַקָּטָן"
    const plain = s => s.replace(/ּ/g, ''), last = plain(strings(lines).at(-1))
    assert.ok(last.includes(plain(a1)), a1)
    assert.ok(last.includes(plain(a2)), a2)
  }
  const reg = readFileSync(new URL('../src/booklets/registry.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
  const entry = reg.slice(reg.indexOf("slug: 'sentence-pyramids'"))
  const pages = entry.slice(entry.indexOf('pages: ['), entry.indexOf('],', entry.indexOf('pages: ['))).match(/'[^']+'/g)
  assert.equal(pages.length, 12)
  assert.ok(readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8').includes('/booklets/sentence-pyramids<'))
})
