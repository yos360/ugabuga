import test from 'node:test'
import assert from 'node:assert/strict'
import { LETTERS, CVC, DIGRAPHS, DIGRAPH_WORDS, SIGHT_WORDS, SENTENCES, STAGES, gapWord, vowelOf, practiceFor, worksheetFor } from '../src/data/englishPhonics.js'

test('26 letters, each key word starts with its letter (x: fox ends with it)', () => {
  assert.equal(LETTERS.length, 26)
  assert.equal(new Set(LETTERS.map(l => l.l)).size, 26)
  for (const l of LETTERS) assert.ok(l.l === 'x' ? l.word.endsWith('x') : l.word.startsWith(l.l), l.word)
})

test('CVC words are three letters with a vowel in the middle, five per vowel', () => {
  assert.equal(new Set(CVC.map(w => w.word)).size, CVC.length)
  for (const w of CVC) { assert.equal(w.word.length, 3, w.word); assert.match(vowelOf(w), /[aeiou]/) }
  for (const v of 'aeiou') assert.equal(CVC.filter(w => vowelOf(w) === v).length, 5, v)
})

test('every digraph word contains its team, and the gap hides exactly it', () => {
  for (const d of DIGRAPHS) for (const w of d.words) assert.ok(w.word.includes(d.dg), w.word)
  for (const w of DIGRAPH_WORDS) assert.equal(gapWord(w).replace('__', w.dg), w.word)
  assert.equal(new Set(DIGRAPH_WORDS.map(w => w.word)).size, DIGRAPH_WORDS.length)
})

test('sight words and sentences are unique; each sentence has 3 distinct pictures', () => {
  assert.equal(new Set(SIGHT_WORDS.map(s => s.w)).size, SIGHT_WORDS.length)
  assert.equal(new Set(SIGHT_WORDS.map(s => s.he)).size, SIGHT_WORDS.length)
  for (const s of SENTENCES) assert.equal(new Set(s.pics).size, 3, s.en)
})

test('practice questions: options are unique and the answer is among them, for many seeds', () => {
  for (const s of STAGES) for (let seed = 1; seed <= 20; seed++) {
    const qs = practiceFor(s.id, seed, 10)
    assert.equal(qs.length, 10, s.id)
    for (const q of qs) {
      assert.ok(q.answer >= 0 && q.answer < q.options.length, `${s.id} seed ${seed}`)
      assert.equal(new Set(q.options.map(o => o.t)).size, q.options.length, `${s.id} duplicate option`)
    }
  }
})

test('blend practice: the right picture matches the shown letters', () => {
  for (const q of practiceFor('blend', 3, 10)) assert.equal(q.options[q.answer].t, q.prompt.big.split(' · ').join(''))
})

test('worksheets have items with answers for every stage and set', () => {
  for (const s of STAGES) for (let set = 0; set < 9; set++) {
    const ws = worksheetFor(s.id, set)
    assert.ok(ws.items.length >= 8, s.id)
    for (const it of ws.items) assert.ok(it.answer, s.id)
    if (s.id === 'blend') for (const it of ws.items) { assert.ok(it.options.includes(it.answer)); assert.equal(new Set(it.options).size, 3) }
  }
})
