import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { SHAPES, DESIGNS, LEVELS, FAQ, findAxes, rotationOrder, fullGrid, isGiven, mirrorOf, checkMirror, designsFor } from '../src/data/symmetryMath.js'

test('shape ids are unique', () => {
  const ids = SHAPES.map(s => s.id)
  assert.equal(new Set(ids).size, ids.length)
})

test('the computed axes and rotation order match the known answers', () => {
  for (const s of SHAPES) {
    if (s.circle) { assert.equal(s.axes, Infinity); continue }
    assert.equal(findAxes(s.pts).angles.length, s.axes, `${s.id} axes`)
    assert.equal(rotationOrder(s.pts), s.rot, `${s.id} rotation`)
  }
})

test('textbook facts hold', () => {
  const by = Object.fromEntries(SHAPES.map(s => [s.id, s]))
  assert.equal(by.square.axes, 4)
  assert.equal(by.rectangle.axes, 2)
  assert.equal(by.equilateral.axes, 3)
  assert.equal(by.isosceles.axes, 1)
  assert.equal(by.scalene.axes, 0)
  assert.equal(by.parallelogram.axes, 0)
  assert.equal(by.parallelogram.rot, 2)
  assert.equal(by.pentagon.axes, 5)
  assert.equal(by.hexagon.axes, 6)
})

test('every grid design is symmetric and has a valid size', () => {
  const ids = new Set()
  for (const d of DESIGNS) {
    assert.ok(!ids.has(d.id), d.id); ids.add(d.id)
    assert.equal(d.rows.length, d.size, d.id)
    for (const r of d.rows) {
      assert.equal(r.length, d.size, d.id)
      assert.equal(r, [...r].reverse().join(''), `${d.id}: ${r}`)
    }
    // Both halves have something to complete.
    assert.ok(d.rows.join('').includes('#'), d.id)
  }
  for (const l of LEVELS) assert.ok(designsFor(l).length >= 3, l.id)
})

test('the turned (horizontal axis) grid is symmetric top to bottom', () => {
  for (const d of DESIGNS) {
    const g = fullGrid(d, 'h'), n = d.size
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) assert.equal(g[r][c], g[n - 1 - r][c], d.id)
  }
})

test('checkMirror accepts the exact mirror and flags mistakes', () => {
  for (const axis of ['v', 'h']) {
    const d = DESIGNS.find(x => x.id === 'house'), n = d.size, g = fullGrid(d, axis), right = new Set()
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (!isGiven(r, c, n, axis) && g[r][c]) right.add(`${r},${c}`)
    assert.equal(checkMirror(d, axis, right).ok, true)
    // A copied (not mirrored) half is wrong.
    const [r0, c0] = [...right][0].split(',').map(Number), [mr, mc] = mirrorOf(r0, c0, n, axis)
    assert.ok(isGiven(mr, mc, n, axis))
    const less = new Set(right); less.delete(`${r0},${c0}`)
    assert.deepEqual(checkMirror(d, axis, less).missing, [`${r0},${c0}`])
  }
})

test('page is wired: route, sitemap, search, blog', () => {
  assert.ok(FAQ.length >= 4)
  assert.match(readFileSync('src/App.jsx', 'utf8'), /path="\/math\/symmetry"/)
  assert.match(readFileSync('public/sitemap-static.xml', 'utf8'), /ugabuga\.co\.il\/math\/symmetry</)
  assert.match(readFileSync('src/data/searchStatic.js', 'utf8'), /to: '\/math\/symmetry'/)
  assert.match(readFileSync('src/data/whatsNew.js', 'utf8'), /to: '\/math\/symmetry'/)
})
