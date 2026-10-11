// The spin wheel lands where it says it lands: the planned slice is the one under the pointer
import { test } from 'node:test'
import assert from 'node:assert/strict'
const { sliceAtPointer, spinTo, planSpin } = await import('../src/utils/wheel.js')

test('no rotation: slice 0 is under the top pointer', () => {
  for (const n of [1, 2, 3, 5, 8, 12]) assert.equal(sliceAtPointer(0, n), 0)
  assert.equal(sliceAtPointer(0, 0), -1)
  assert.equal(sliceAtPointer(-1, 4), 0) // turned 1° counter-clockwise -> still the first slice
  assert.equal(sliceAtPointer(1, 4), 3) // turned 1° clockwise -> the last slice comes under the pointer
})

test('spinTo lands on every slice, moves forward and spins several turns', () => {
  for (const n of [2, 3, 4, 7, 10, 20]) {
    let from = 0
    for (let i = 0; i < n; i++) {
      for (const offset of [0, 0.5, 1]) {
        const r = spinTo(i, n, from, { turns: 5, offset })
        assert.equal(sliceAtPointer(r, n), i, `n=${n} i=${i} offset=${offset}`)
        assert.ok(r - from >= 5 * 360 && r - from < 6 * 360, `turns n=${n} i=${i}`)
        from = r
      }
    }
  }
})

test('planSpin result agrees with the pointer for random draws', () => {
  let seed = 7
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 }
  let from = 0
  const seen = new Set()
  for (let k = 0; k < 500; k++) {
    const { index, rotation } = planSpin(6, from, rand)
    assert.equal(sliceAtPointer(rotation, 6), index)
    assert.ok(rotation > from)
    seen.add(index); from = rotation
  }
  assert.equal(seen.size, 6)
})
