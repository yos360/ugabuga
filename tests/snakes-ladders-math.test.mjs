import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { LADDERS, SNAKES, LEVELS, makeBoard, cellOf } from '../src/pages/printables/snakesLaddersMath.js'

// The printable board must keep the same snakes and ladders as the online game.
test('snakes & ladders math: layout matches the online game', () => {
  const game = readFileSync(new URL('../src/boardgames/classic/SnakesLadders.jsx', import.meta.url), 'utf8')
  const obj = name => Object.fromEntries([...game.match(new RegExp(`const ${name} = \\{([^}]+)\\}`))[1].matchAll(/(\d+): (\d+)/g)].map(m => [m[1], +m[2]]))
  assert.deepEqual(obj('LADDERS'), Object.fromEntries(Object.entries(LADDERS)))
  assert.deepEqual(obj('SNAKES'), Object.fromEntries(Object.entries(SNAKES)))
  for (const [a, b] of Object.entries(LADDERS)) assert.ok(+a < b)
  for (const [a, b] of Object.entries(SNAKES)) assert.ok(+a > b)
  const used = [...Object.keys(LADDERS), ...Object.keys(SNAKES)]
  assert.equal(new Set(used).size, used.length)
})

test('snakes & ladders math: every board is correct, unique and inside its level', () => {
  for (const level of Object.keys(LEVELS)) {
    const L = LEVELS[level]
    for (let seed = 1; seed <= 60; seed++) {
      const { ladders, snakes } = makeBoard(level, seed)
      assert.equal(ladders.length, 8)
      assert.equal(snakes.length, 10)
      const facts = new Set()
      for (const l of ladders) {
        assert.equal(l.answer, l.a * l.b)
        assert.ok((L.a.includes(l.a) && L.b.includes(l.b)) || (L.a.includes(l.b) && L.b.includes(l.a)), `${level} ${l.a}x${l.b}`)
        facts.add(`${Math.min(l.a, l.b)}x${Math.max(l.a, l.b)}`)
      }
      for (const s of snakes) {
        assert.ok(s.divisor > 1)
        assert.equal(s.dividend, s.divisor * s.answer)
        facts.add(`${Math.min(s.divisor, s.answer)}x${Math.max(s.divisor, s.answer)}`)
      }
      assert.equal(facts.size, 18, `${level} seed ${seed}: a fact repeats`)
    }
  }
  assert.deepEqual(makeBoard('full', 7), makeBoard('full', 7))
})

test('snakes & ladders math: zig-zag numbering', () => {
  assert.deepEqual(cellOf(1), [0, 0])
  assert.deepEqual(cellOf(10), [9, 0])
  assert.deepEqual(cellOf(11), [9, 1])
  assert.deepEqual(cellOf(100), [0, 9])
})
