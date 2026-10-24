import test from 'node:test'
import assert from 'node:assert/strict'

const M = await import('../src/data/sensoryCards.js')
// A doubled yod in plain spelling is one yod with niqqud (ידיים = יָדַיִם, עייף = עָיֵף).
const strip = s => s.replace(/[֑-ׇ]/g, '').replace(/יי/g, 'י')

// Every { t, n } text in the module, with its path (a path ending in .b is the "צריך/ה" form).
const texts = []
const walk = (x, path) => {
  if (!x || typeof x !== 'object') return
  if (typeof x.t === 'string' && typeof x.n === 'string') texts.push([path, x])
  else for (const k of Object.keys(x)) walk(x[k], `${path}.${k}`)
}
walk({ ...M }, 'M')

test('the vocalised text spells the same letters as the plain text', () => {
  assert.ok(texts.length > 100)
  const wrong = texts.filter(([p, x]) => !p.endsWith('.b') && strip(x.n) !== strip(x.t)).map(([p, x]) => `${p}: ${x.t} ≠ ${strip(x.n)}`)
  assert.deepEqual(wrong, [])
  for (const [path, x] of texts) {
    if (path.endsWith('.b')) {
      // Both forms: "צָרִיךְ/צְרִיכָה" — the letters of both genders, joined by a slash.
      assert.ok(x.t.includes('/') || strip(x.n).includes('/') || x.t === strip(x.n), path)
      continue
    }
    assert.equal(strip(x.n), strip(x.t), path)
    assert.ok(/[\u05B0-\u05BC]/.test(x.n), `${path} has niqqud`)
  }
})

test('gendered texts pick the requested form', () => {
  const happy = M.FEELINGS[0].label
  assert.equal(M.pick(happy, { nikud: false, gender: 'm' }), 'שמח')
  assert.equal(M.pick(happy, { nikud: false, gender: 'f' }), 'שמחה')
  assert.equal(M.pick(happy, { nikud: false, gender: 'b' }), 'שמח/ה')
  assert.equal(M.pick(M.NEEDS[1].label, { nikud: true, gender: 'f' }), 'עֶזְרָה')
})

test('six sets with unique card ids and the cards the page promises', () => {
  assert.deepEqual(M.SETS.map(s => s.id), ['regulation', 'senses', 'communication', 'schedule', 'help', 'animals'])
  for (const s of M.SETS) assert.equal(new Set(s.items.map(i => i.id)).size, s.items.length, s.id)
  assert.equal(M.SENSES.length, 6)
  assert.equal(M.NEEDS.length, 10)
  assert.equal(M.FEELINGS.length, 6)
  assert.ok(M.ANIMALS.every(a => a.hint))
  for (const id of ['circle', 'free-play', 'meal', 'yard', 'art', 'story', 'rest', 'goodbye']) assert.ok(M.SCHEDULE.some(x => x.id === id), id)
})
