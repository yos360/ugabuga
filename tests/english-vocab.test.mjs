import test from 'node:test'
import assert from 'node:assert/strict'
import { VOCAB_GRADES, vocabGrade, vocabUnit, vocabHref } from '../src/data/englishVocab.js'

const shape = n => (n <= 2 ? [6, 10] : n <= 6 ? [6, 12] : n <= 9 ? [6, 14] : [6, 15])

test('12 grades, numbered 1 to 12', () => {
  assert.deepEqual(VOCAB_GRADES.map(g => g.n), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
})

test('unit and word counts follow the band of each grade', () => {
  for (const g of VOCAB_GRADES) {
    const [units, words] = shape(g.n)
    assert.equal(g.units.length, units, `grade ${g.n} units`)
    for (const u of g.units) assert.equal(u.words.length, words, `grade ${g.n} / ${u.slug}`)
  }
})

test('unit slugs are unique and URL-safe within a grade; every unit has titles and an emoji', () => {
  for (const g of VOCAB_GRADES) {
    const slugs = g.units.map(u => u.slug)
    assert.equal(new Set(slugs).size, slugs.length, `grade ${g.n} slugs`)
    for (const u of g.units) {
      assert.match(u.slug, /^[a-z0-9-]+$/)
      assert.match(u.title, /[א-ת]/)
      assert.ok(u.en && u.emoji, `${g.n}/${u.slug}`)
    }
  }
})

test('no English word appears twice in the same grade', () => {
  for (const g of VOCAB_GRADES) {
    const seen = new Map()
    for (const u of g.units) for (const [en] of u.words) {
      const k = en.toLowerCase()
      assert.ok(!seen.has(k), `grade ${g.n}: "${en}" in ${seen.get(k)} and ${u.slug}`)
      seen.set(k, u.slug)
    }
  }
})

test('every word has three parts, a Hebrew meaning and an example that uses it', () => {
  for (const g of VOCAB_GRADES) for (const u of g.units) for (const w of u.words) {
    assert.equal(w.length, 3, `${g.n}/${u.slug}: ${w.join(' | ')}`)
    const [en, he, ex] = w
    assert.match(en, /^[A-Za-z][A-Za-z '-]*$/, `${g.n}/${u.slug}: "${en}"`)
    assert.match(he, /[א-ת]/, `${g.n}/${u.slug}: "${en}" Hebrew`)
    assert.doesNotMatch(ex, /[א-ת]/, `${g.n}/${u.slug}: "${en}" example is English`)
    assert.ok(ex.toLowerCase().includes(en.toLowerCase().slice(0, 4)), `${g.n}/${u.slug}: "${en}" not in "${ex}"`)
  }
})

test('helpers find grades and units', () => {
  assert.equal(vocabGrade(7).n, 7)
  assert.equal(vocabGrade('3').n, 3)
  assert.equal(vocabGrade(13), undefined)
  assert.equal(vocabUnit(1, 'colors').words[0][0], 'red')
  assert.equal(vocabUnit(1, 'nope'), undefined)
  assert.equal(vocabHref(7), '/learn/english/grade-7/vocabulary')
  assert.equal(vocabHref(7, 'media'), '/learn/english/grade-7/vocabulary/media')
})
