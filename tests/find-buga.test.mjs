import test from 'node:test'
import assert from 'node:assert/strict'
import { build, levelSpec, starsFor, LEVEL_COUNT, SCENES } from '../src/arcade/logic/findBuga.js'

test('find-buga: same level, same picture', () => {
  assert.deepEqual(build(5), build(5))
  assert.notDeepEqual(build(5).buga, build(6).buga)
})

test('find-buga: Buga is inside the scene and never buried in the crowd', () => {
  for (let lv = 1; lv <= LEVEL_COUNT; lv++) {
    const { buga, items } = build(lv)
    const spec = levelSpec(lv)
    assert.ok(buga.x >= 8 && buga.x <= 92 && buga.y >= 10 && buga.y <= 90, `level ${lv} position`)
    assert.ok(items.length >= spec.count, `level ${lv} crowd`)
    const onTop = items.filter(it => Math.hypot(it.x - buga.x, it.y - buga.y) < buga.s * 0.5)
    assert.equal(onTop.length, 0, `level ${lv}: something hides Buga's middle`)
  }
})

test('find-buga: levels get harder and walk through every scene', () => {
  assert.ok(levelSpec(LEVEL_COUNT).buga < levelSpec(1).buga)
  assert.ok(levelSpec(LEVEL_COUNT).count > levelSpec(1).count)
  const seen = new Set(Array.from({ length: LEVEL_COUNT }, (_, i) => levelSpec(i + 1).scene.id))
  assert.equal(seen.size, SCENES.length)
})

test('find-buga: stars', () => {
  assert.equal(starsFor(10, false, 0), 3)
  assert.equal(starsFor(10, true, 0), 2)
  assert.equal(starsFor(200, false, 0), 1)
})
