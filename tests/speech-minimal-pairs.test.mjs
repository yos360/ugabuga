// Data checks for /speech/minimal-pairs: every pair is two different plain words, no pair repeats,
// every contrast and process label is a known one, and substitution pairs carry the sounds they claim.
import test from 'node:test'
import assert from 'node:assert/strict'
import { PAIRS, CONTRASTS, PROCESSES, contrastById, processById } from '../src/data/speech/minimalPairs.js'

const NIKUD = /[֑-ׇ]/
const DELETION = new Set(['final', 'syllable', 'cluster'])

test('a sensible number of pairs, with unique ids', () => {
  assert.ok(PAIRS.length >= 40 && PAIRS.length <= 70, `${PAIRS.length} pairs`)
  assert.equal(new Set(PAIRS.map(p => p.id)).size, PAIRS.length)
  assert.ok(PAIRS.filter(p => p.pictured).length >= 12, 'enough pairs with pictures for the game')
})

test('contrast and process labels are known, and every contrast is used at least twice', () => {
  assert.equal(new Set(CONTRASTS.map(c => c.id)).size, CONTRASTS.length)
  assert.equal(new Set(PROCESSES.map(p => p.id)).size, PROCESSES.length)
  for (const c of CONTRASTS) {
    assert.ok(processById[c.process], `${c.id}: unknown process ${c.process}`)
    assert.equal(c.sides.length, 2, c.id)
    assert.ok(PAIRS.filter(p => p.contrast === c.id).length >= 2, `${c.id} has fewer than 2 pairs`)
  }
  for (const p of PAIRS) assert.ok(contrastById[p.contrast], `${p.id}: unknown contrast`)
  for (const pr of PROCESSES) assert.ok(CONTRASTS.some(c => c.process === pr.id), `${pr.id} has no contrast`)
})

test('the two words of a pair differ, are plain Hebrew and no pair repeats', () => {
  const seen = new Set()
  for (const p of PAIRS) {
    for (const x of [p.a, p.b]) {
      assert.match(x.w, /^[א-ת]+$/, `${p.id}: "${x.w}" must be plain letters (no niqqud)`)
      if (x.say) assert.ok(NIKUD.test(x.say), `${p.id}: say should add niqqud`)
      if (x.e !== null) assert.ok(typeof x.e === 'string' && x.e.length > 0, p.id)
      if (x.hint) assert.ok(x.hint.length <= 24, `${p.id}: hint too long`)
    }
    assert.notEqual(p.a.w, p.b.w, p.id)
    const key = [p.a.w, p.b.w].sort().join('|')
    assert.ok(!seen.has(key), `duplicate pair ${key}`)
    seen.add(key)
    assert.equal(p.pictured, !!(p.a.e && p.b.e))
  }
})

test('substitution pairs contain the letters of their sounds; deletion pairs drop a sound', () => {
  for (const p of PAIRS) {
    const c = contrastById[p.contrast]
    if (DELETION.has(c.process)) {
      // The shorter form never has more letters than the full word (spelling can add a silent ה/א).
      assert.ok(p.b.w.length <= p.a.w.length, `${p.id}: ${p.b.w} should be the shorter word`)
      continue
    }
    const [la, lb] = c.letters
    assert.ok([...p.a.w].some(ch => la.includes(ch)), `${p.id}: ${p.a.w} lacks ${la}`)
    assert.ok([...p.b.w].some(ch => lb.includes(ch)), `${p.id}: ${p.b.w} lacks ${lb}`)
  }
})
