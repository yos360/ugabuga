import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const src = read('src/booklets/binyanimGrade6.jsx')
// The data section is plain JS (no JSX) up to the first style constant, so it can be evaluated directly.
const dataSrc = src.slice(src.indexOf('export const BINYANIM'), src.indexOf('const box ')).replace(/export const /g, 'const ')
const names = ['BINYANIM', 'PAST', 'PRESENT', 'ROOTS', 'ACTIVE', 'PASSIVE', 'HITPAEL', 'SWAPS', 'ROOT_BINYAN', 'PASSAGE', 'PASSAGE_ANSWERS', 'SEARCH', 'QUIZ', 'TABLE']
const d = new Function(`${dataSrc}; return { ${names.join(', ')} }`)()

test('binyanim grade 6: every binyan label is one of the seven', () => {
  assert.equal(d.BINYANIM.length, 7)
  for (const [v, b] of [...d.PAST, ...d.PRESENT]) assert.ok(d.BINYANIM.includes(b), v)
  for (const [v, , b] of d.ROOT_BINYAN) assert.ok(d.BINYANIM.includes(b), v)
  for (const b of d.PASSAGE_ANSWERS) assert.ok(d.BINYANIM.includes(b), b)
  assert.deepEqual(d.TABLE.map(r => r[0]), d.BINYANIM)
})

test('binyanim grade 6: past and present signs match the binyan', () => {
  const sign = { נפעל: v => v.startsWith('נ'), הפעיל: v => v.startsWith('ה') && v.at(-2) === 'י', הופעל: v => v.startsWith('הו'), התפעל: v => v.startsWith('הת') }
  for (const [v, b] of d.PAST) if (sign[b]) assert.ok(sign[b](v), `${v} ${b}`)
  for (const [v, b] of d.PRESENT) {
    if (b === 'הופעל') assert.ok(v.startsWith('מו'), v)
    if (b === 'התפעל') assert.ok(v.startsWith('מת'), v)
    if (b === 'הפעיל') assert.ok(v.startsWith('מ') && v.at(-2) === 'י', v)
  }
  assert.equal(d.PAST.length, 12)
  assert.equal(new Set(d.PAST.map(p => p[0])).size, 12)
  assert.equal(d.PAST.length + d.PRESENT.length, 24)
  // every binyan appears in the recognition pages
  for (const b of d.BINYANIM) assert.ok(d.PAST.some(p => p[1] === b), `past: ${b}`)
})

test('binyanim grade 6: sentences, active and passive', () => {
  for (const r of d.ROOTS) for (const [s, a] of r.rows) { assert.ok(s.includes('___'), s); assert.ok(a.length > 2) }
  assert.equal(d.ACTIVE.length, 12)
  assert.equal(d.ACTIVE.filter(a => a[1] === 'פעיל').length, 6)
  assert.equal(d.ACTIVE.filter(a => a[1] === 'סביל').length, 6)
  for (const [, , a] of d.PASSIVE) assert.match(a, /^(בושל|תוקן|הוזמנ|הודלק|סודר|נוקת|הוכתב|הולבש)/, a)
  for (const [a, p] of d.PASSIVE) { assert.ok(p.includes('___')); assert.ok(a.endsWith('.')) }
})

test('binyanim grade 6: hitpael, swaps, passage, quiz', () => {
  for (const [v, t] of d.HITPAEL) { assert.ok(v.startsWith('הת') || v.startsWith('הס') || v.startsWith('הש'), v); assert.ok('אבג'.includes(t), v) }
  for (const [root, opts, a] of d.SWAPS) { assert.ok(opts.includes(a), root); assert.equal(opts.length, 3); assert.match(root, /^[סשצז]/) }
  const marked = d.PASSAGE.filter(p => typeof p !== 'string')
  assert.equal(marked.length, d.PASSAGE_ANSWERS.length)
  assert.equal(d.QUIZ.length, 10)
  for (const [q, opts, a] of d.QUIZ) { assert.ok(opts.includes(a), q); assert.equal(new Set(opts).size, 3) }
  for (const w of d.SEARCH) assert.ok(d.PAST.some(p => p[0] === w.word), w.word)
})

test('binyanim grade 6: registry pages, sitemap and search', () => {
  const reg = read('src/booklets/registry.js')
  const entry = reg.slice(reg.indexOf("slug: 'binyanim-grade-6'"))
  assert.match(entry.slice(0, 120), /onRequest: true/)
  const pages = entry.slice(entry.indexOf('pages: ['), entry.indexOf('],', entry.indexOf('pages: ['))).match(/'[^']+'/g)
  assert.equal(pages.length, 15)
  assert.ok(read('public/sitemap-static.xml').includes('/booklets/binyanim-grade-6<'))
  assert.ok(read('src/data/searchStatic.js').includes("to: '/booklets/binyanim-grade-6'"))
})
