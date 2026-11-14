import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const src = read('src/booklets/musicNotes.jsx')
// The data section is plain JS (no JSX) from NAMES up to the page-list constant.
const dataSrc = src.slice(src.indexOf('export const NAMES'), src.indexOf('const PAGES')).replace(/export const /g, 'const ')
const names = ['NAMES', 'nameOf', 'placeOf', 'placesOfName', 'BEATS', 'beatsText', 'STAFF_Q', 'LINE_NOTES', 'SPACE_NOTES', 'DRAW', 'PIANO_Q', 'SEQS', 'DUR_Q', 'SUMS', 'BARS', 'ODE', 'SEARCH']
const d = new Function(`${dataSrc}; return { ${names.join(', ')} }`)()

test('music notes: staff facts — lines E G B D F, spaces F A C E, middle C on a ledger line', () => {
  assert.deepEqual([2, 4, 6, 8, 10].map(d.nameOf), ['מי', 'סול', 'סי', 'רה', 'פה'])
  assert.deepEqual([3, 5, 7, 9].map(d.nameOf), ['פה', 'לה', 'דו', 'מי'])
  assert.equal(d.nameOf(0), 'דו'); assert.equal(d.nameOf(7), 'דו')
  assert.equal(d.placeOf(4), 'קו 2') // the G clef curls around line 2
  assert.equal(d.placeOf(2), 'קו 1'); assert.equal(d.placeOf(3), 'רווח 1'); assert.equal(d.placeOf(10), 'קו 5')
  for (const s of d.LINE_NOTES) assert.ok(s % 2 === 0 && s >= 2 && s <= 10, `line note ${s}`)
  for (const s of d.SPACE_NOTES) assert.ok((s % 2 === 1 && s >= 3 && s <= 9) || s <= 1, `space note ${s}`)
  assert.equal(d.LINE_NOTES.length, 12); assert.equal(d.SPACE_NOTES.length, 12)
  for (const s of d.STAFF_Q) assert.ok(s >= 2 && s <= 10)
})

test('music notes: ladders, drawing and piano answers are consistent', () => {
  const up = [...d.NAMES, ...d.NAMES]
  for (const [seq, a] of d.SEQS) {
    const full = seq.map(v => v ?? a), i = up.indexOf(full[0])
    const asc = full.every((v, k) => up[i + k] === v), desc = full.every((v, k) => up[(i - k + 7) % 7] === v)
    assert.ok(asc || desc, full.join(' '))
    assert.equal(seq.filter(v => v === null).length, 1)
  }
  for (const name of d.DRAW) assert.ok(d.placesOfName(name).length >= 1, name)
  assert.deepEqual(d.placesOfName('דו'), ['קו עזר מתחת לחמשה', 'רווח 3'])
  for (const s of d.PIANO_Q) assert.ok(s >= 0 && s <= 7)
})

test('music notes: note lengths, sums and bars', () => {
  assert.deepEqual([d.BEATS.w, d.BEATS.h, d.BEATS.q, d.BEATS.e], [4, 2, 1, 0.5])
  assert.equal(d.beatsText(0.5), '½'); assert.equal(d.beatsText(1.5), '1½')
  const want = { שלם: 4, חצי: 2, רבע: 1 }
  for (const [list, a] of d.BARS) assert.equal(list.reduce((t, x) => t + d.BEATS[x], 0) + want[a], 4, a)
  for (const l of d.SUMS) assert.ok(l.every(x => x in d.BEATS))
})

test('music notes: Ode to Joy phrases are full 4/4 bars and the known melody', () => {
  assert.equal(d.ODE.length, 2)
  for (const phrase of d.ODE) {
    const beats = phrase.map(([, x]) => d.BEATS[x])
    assert.equal(beats.reduce((a, b) => a + b, 0), 16)
    let t = 0
    for (const b of beats) { t += b; assert.ok(t <= 16) }
  }
  assert.equal(d.ODE[0].map(([s]) => d.nameOf(s)).join(' '), 'מי מי פה סול סול פה מי רה דו דו רה מי מי רה רה')
  assert.equal(d.ODE[1].map(([s]) => d.nameOf(s)).join(' '), 'מי מי פה סול סול פה מי רה דו דו רה מי רה דו דו')
  for (const w of d.SEARCH) assert.ok(w.length <= 9, w)
})

test('music notes: registry entry, sitemap and search', () => {
  const reg = read('src/booklets/registry.js')
  const entry = reg.slice(reg.indexOf("slug: 'music-notes'"))
  assert.match(entry.slice(0, 120), /onRequest: true/)
  const pages = entry.slice(entry.indexOf('pages: ['), entry.indexOf('],', entry.indexOf('pages: ['))).match(/'[^']+'/g)
  assert.equal(pages.length, 15)
  assert.equal((src.match(/ n=\{\d+\}/g) || []).length, 13) // pages 2–14 (cover and certificate have no number)
  assert.match(src, /bookletBySlug\('music-notes'\)\.pages/)
  assert.ok(read('public/sitemap-static.xml').includes('/booklets/music-notes<'))
  assert.ok(read('src/data/searchStatic.js').includes("to: '/booklets/music-notes'"))
})
