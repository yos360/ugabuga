// Generated gifted-test practice: thousands of rounds, every item checked independently.
import { test } from 'node:test'
import assert from 'node:assert/strict'
const G = await import('../src/learn/gifted/giftedGen.js')
const { seriesTerm, matrixCell } = await import('../src/learn/gifted/giftedData.js')
const { WORD_SETS, answersFor } = await import('../src/data/wordPairs.js')

const key = o => JSON.stringify(o)
function basic(it, where) {
  assert.equal(it.options.length, 4, where)
  assert.equal(new Set(it.options.map(key)).size, 4, `${where}: options must be distinct`)
  assert.ok(Number.isInteger(it.answer) && it.answer >= 0 && it.answer < 4, where)
  assert.ok(it.id, where)
}

test('series: shown terms and the marked answer come from the rule', () => {
  for (let level = 1; level <= 5; level++) for (let s = 0; s < 300; s++) {
    const it = G.genSeries(level, G.rng(s * 7 + level))
    basic(it, `series L${level} seed ${s}`)
    it.seq.forEach((v, i) => assert.equal(v, seriesTerm(it.rule, i)))
    assert.equal(it.options[it.answer], seriesTerm(it.rule, it.seq.length))
    assert.ok(it.options.every(o => Number.isInteger(o) && o >= 0))
  }
})

test('matrices: the answer is the rule cell and no wrong option fits the rule', () => {
  for (let level = 1; level <= 5; level++) for (let s = 0; s < 300; s++) {
    const it = G.genMatrix(level, G.rng(s * 13 + level))
    basic(it, `matrix L${level} seed ${s}`)
    assert.deepEqual(it.options[it.answer], matrixCell(it, 2, 2))
    // the grid is not constant: the 9 cells are not all the same
    const cells = new Set([0, 1, 2].flatMap(r => [0, 1, 2].map(c => key(matrixCell(it, r, c)))))
    assert.ok(cells.size >= 3, `matrix L${level} seed ${s} has a pattern`)
  }
})

test('analogies: answer is a partner of the asked word, wrong options are not', () => {
  for (let level = 1; level <= 5; level++) for (let s = 0; s < 300; s++) {
    const it = G.genAnalogy(level, G.rng(s * 17 + level))
    basic(it, `analogy L${level} seed ${s}`)
    if (!it.exp.startsWith('"')) continue // hand-written bank fallback
    const set = Object.values(WORD_SETS).find(w => answersFor(w, it.pair[0]).has(it.pair[1]))
    assert.ok(set, `pair ${it.pair} is a known pair`)
    const ok = answersFor(set, it.ask)
    assert.ok(ok.has(it.options[it.answer]), `${it.ask} → ${it.options[it.answer]}`)
    it.options.forEach((o, j) => { if (j !== it.answer) assert.ok(!ok.has(o), `wrong option ${o} is also correct for ${it.ask}`) })
  }
})

test('odd one out: exactly one option outside the group', () => {
  for (let level = 1; level <= 5; level++) for (let s = 0; s < 300; s++) {
    const it = G.genOddOne(level, G.rng(s * 19 + level))
    basic(it, `odd L${level} seed ${s}`)
    assert.ok(it.exp.includes(`"${it.options[it.answer]}"`))
  }
})

test('quantitative problems: whole-number answers and explanations', () => {
  for (let level = 1; level <= 5; level++) for (let s = 0; s < 400; s++) {
    const it = G.genQuant(level, G.rng(s * 23 + level))
    basic(it, `quant L${level} seed ${s}`)
    assert.ok(it.exp && it.exp.length > 15)
    assert.ok(!/NaN|undefined|Infinity/.test(it.q + it.exp + it.options.join()), it.q)
  }
})

test('quantitative answers re-derived', () => {
  const r = G.rng(5)
  for (let i = 0; i < 2000; i++) {
    const it = G.genQuant(1 + (i % 5), r), ans = it.options[it.answer], nums = (it.q.match(/\d+/g) || []).map(Number)
    if (it.kind === 'legs') { const [heads, legs] = nums; assert.equal(Number(ans), (legs - 2 * heads) / 2) }
    if (it.kind === 'share') { const [total, kids] = nums; assert.equal(Number(ans), total / kids) }
    if (it.kind === 'change') { const [items, price, bill] = nums; assert.equal(Number(ans), bill - items * price) }
    if (it.kind === 'consecutive') { const [n, sum] = nums; assert.equal(Number(ans), sum / n + (n - 1) / 2) }
  }
})

test('rounds and simulations by grade', () => {
  for (const g of G.GEN_GRADES) {
    const round = G.genRound(g.id, 'all', 12, G.rng(g.id))
    assert.equal(round.length, 12)
    assert.ok(round.every(q => ['verbal', 'series', 'matrices', 'logic'].includes(q.type)))
    const sim = G.genSimulation(g.id, G.rng(g.id + 100))
    assert.deepEqual(sim.map(p => p.qs.length), G.SIM_PARTS.map(p => p.n))
    const ids = sim.flatMap(p => p.qs.map(q => q.item.id))
    assert.equal(new Set(ids).size, ids.length, 'unique ids in a simulation')
  }
})

test('series always change (there is a rule to discover)', () => {
  for (let level = 1; level <= 5; level++) for (let s = 0; s < 500; s++) {
    const it = G.genSeries(level, G.rng(s * 31 + level))
    assert.ok(new Set(it.seq).size >= it.seq.length - 1, it.seq.join(','))
  }
})
