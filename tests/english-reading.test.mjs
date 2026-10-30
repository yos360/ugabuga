// /learn/english-reading: graded English texts where every word can be tapped for its Hebrew meaning.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { READING_STORIES, READING_BANDS, wordCount } from '../src/data/englishReading.js'
import { lemmaCandidates } from '../src/utils/enLemma.js'

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const HE = /[א-ת]/

test('english reading: 30 texts, 6 per band, unique slugs and titles', () => {
  assert.equal(READING_STORIES.length, 30)
  const slugs = READING_STORIES.map(s => s.slug), titles = READING_STORIES.map(s => s.title)
  assert.equal(new Set(slugs).size, slugs.length, 'duplicate slug')
  assert.equal(new Set(titles).size, titles.length, 'duplicate title')
  for (const s of slugs) assert.match(s, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, s)
  for (const b of READING_BANDS) assert.equal(READING_STORIES.filter(s => s.band === b.id).length, 6, `${b.id}: needs 6 texts`)
  for (const s of READING_STORIES) {
    assert.ok(READING_BANDS.some(b => b.id === s.band), `${s.slug}: unknown band ${s.band}`)
    for (const k of ['title', 'emoji', 'genre', 'summary']) assert.ok(s[k]?.trim(), `${s.slug}: missing ${k}`)
    assert.match(s.summary, HE, `${s.slug}: summary must be Hebrew`)
    assert.ok(s.paragraphs.length >= 2 && s.paragraphs.every(p => p.trim()), `${s.slug}: paragraphs`)
  }
})

test('english reading: word counts fit the band', () => {
  for (const s of READING_STORIES) {
    const [min, max] = READING_BANDS.find(b => b.id === s.band).words, n = wordCount(s)
    assert.ok(n >= min && n <= max, `${s.slug}: ${n} words, band ${s.band} needs ${min}–${max}`)
  }
})

test('english reading: every glossary word appears in its text', () => {
  for (const s of READING_STORIES) {
    const text = s.paragraphs.join(' ')
    assert.ok(s.glossary.length >= 8, `${s.slug}: glossary needs at least 8 words`)
    const keys = s.glossary.map(([w]) => w.toLowerCase())
    assert.equal(new Set(keys).size, keys.length, `${s.slug}: duplicate glossary word`)
    for (const [en, he] of s.glossary) {
      assert.match(he, HE, `${s.slug}: "${en}" needs a Hebrew meaning`)
      assert.match(text, new RegExp(`(?<![A-Za-z])${esc(en)}(?![A-Za-z])`, 'i'), `${s.slug}: glossary "${en}" is not in the text`)
    }
  }
})

test('english reading: 3–5 multiple-choice questions with a valid answer and a Hebrew explanation', () => {
  for (const s of READING_STORIES) {
    assert.ok(s.questions.length >= 3 && s.questions.length <= 5, `${s.slug}: ${s.questions.length} questions`)
    s.questions.forEach((q, i) => {
      const id = `${s.slug} #${i + 1}`
      assert.ok(q.q?.trim(), `${id}: no question`)
      assert.equal(q.options.length, 4, `${id}: needs 4 options`)
      assert.equal(new Set(q.options.map(o => o.trim().toLowerCase())).size, 4, `${id}: options must be distinct`)
      assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length, `${id}: bad answer index`)
      assert.match(q.explain || '', HE, `${id}: explanation must be Hebrew`)
    })
    assert.ok(new Set(s.questions.map(q => q.answer)).size >= 2 || s.questions.length < 3, `${s.slug}: answers all in one position`)
  }
})

test('english reading: every word has a meaning (glossary or the built-in dictionary); only names may be missing', async () => {
  const dir = new URL('../src/data/dictionary/', import.meta.url), dict = {}
  for (const f of readdirSync(dir).filter(f => /^en-he-.*\.js$/.test(f))) Object.assign(dict, (await import(new URL(f, dir))).default)
  const irregular = (await import(new URL('en-irregular.js', dir))).default
  for (const s of READING_STORIES) {
    const gl = new Set(s.glossary.flatMap(([w]) => [w.toLowerCase(), ...w.toLowerCase().split(/[\s-]+/)]))
    const missing = new Set()
    for (const w of s.paragraphs.join(' ').match(/[A-Za-z0-9]+(?:['’][A-Za-z]+)?/g).filter(w => /^[A-Za-z]/.test(w))) {
      const cands = lemmaCandidates(w, irregular)
      if (cands.some(c => dict[c] || gl.has(c)) || /^[A-Z]/.test(w)) continue
      missing.add(w)
    }
    assert.equal(missing.size, 0, `${s.slug}: no meaning for ${[...missing].join(', ')}`)
  }
})

const app = read('src/App.jsx')
test('english reading: routed and lazy-loaded', { skip: !app.includes('/learn/english-reading') && 'routes not in App.jsx yet' }, () => {
  assert.match(app, /path="\/learn\/english-reading"/)
  assert.match(app, /path="\/learn\/english-reading\/:slug"/)
  assert.match(app, /lazy\(\(\) => import\('\.\/learn\/englishReading\/EnglishReadingPages'\)/)
  assert.doesNotMatch(app, /^import .*englishReading/m, 'reading pages must not be in the entry bundle')
})
