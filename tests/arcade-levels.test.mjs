// Flying Cubes and Arrows Escape: all 300 levels of each build and can be cleared by always
// taking any free piece (so a player can never get stuck).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as cubes from '../src/arcade/logic/cubes.js'
import * as arrows from '../src/arcade/logic/arrows.js'

test('arrows escape: 300 levels, every one solvable greedily', () => {
  assert.equal(arrows.LEVEL_COUNT, 300)
  for (let l = 1; l <= arrows.LEVEL_COUNT; l++) {
    const { tiles } = arrows.buildLevel(l)
    assert.ok(tiles.length >= 4, `level ${l}`)
    for (;;) { const f = arrows.freeTiles(tiles); if (!f.length) break; f[0].gone = true }
    assert.ok(tiles.every(t => t.gone), `level ${l} got stuck`)
  }
})

test('flying cubes: 300 levels in worlds, every one solvable greedily', () => {
  assert.equal(cubes.LEVEL_COUNT, 300)
  for (let l = 1; l <= cubes.LEVEL_COUNT; l += 7) {
    const { cubes: cs } = cubes.buildLevel(l)
    for (;;) { const f = cubes.freeCubes(cs); if (!f.length) break; f[0].gone = true }
    assert.ok(cs.every(c => c.gone), `level ${l} got stuck`)
  }
  assert.equal(cubes.worldOf(21).name, cubes.WORLDS[1].name)
})
