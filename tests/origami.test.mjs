// Origami guides (/origami): every model is a list of geometric fold operations that the engine
// simulates; these tests check the data and that every fold is physically sensible.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MODELS } from '../src/origami/models.js'
import { CONTENT, LEVELS } from '../src/origami/content.js'
import { modelStates, allDiagrams, applyFold, area, reflect, foldLine, dist, cross, sub } from '../src/origami/engine.js'

const inConvex = (poly, p, tol = 0.5) => {
  let sign = 0
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length]
    const c = cross(sub(b, a), sub(p, a)) / (dist(a, b) || 1)
    if (Math.abs(c) <= tol) continue
    if (!sign) sign = Math.sign(c)
    else if (Math.sign(c) !== sign) return false
  }
  return true
}
const onPaper = (faces, p) => faces.some(f => inConvex(f.pts, p))
const totalArea = faces => faces.reduce((s, f) => s + area(f.pts), 0)
const folds = op => op.op === 'multi' ? op.ops : [op]

test('origami: at least 12 models, unique slugs, each with content', () => {
  assert.ok(MODELS.length >= 12, `only ${MODELS.length} models`)
  const slugs = MODELS.map(m => m.slug)
  assert.equal(new Set(slugs).size, slugs.length, 'slugs must be unique')
  for (const m of MODELS) {
    assert.match(m.slug, /^[a-z0-9-]+$/)
    const c = CONTENT[m.slug]
    assert.ok(c, `content for ${m.slug}`)
    for (const k of ['keyword', 'h1', 'seoTitle', 'description', 'intro', 'paper', 'time']) assert.ok(c[k], `${m.slug}.${k}`)
    assert.ok(c.intro.includes(c.keyword) || c.h1.includes(c.keyword), `${m.slug}: keyword in intro`)
    assert.ok(c.faq.length >= 2 && c.tips.length >= 2, `${m.slug}: faq and tips`)
    for (const r of c.related) assert.ok(slugs.includes(r) && r !== m.slug, `${m.slug}: related ${r}`)
    assert.ok(LEVELS[m.level], `${m.slug}: level`)
  }
  assert.equal(Object.keys(CONTENT).length, MODELS.length, 'no content without a model')
})

test('origami: every model has ≥4 steps, each with text and diagram data', () => {
  for (const m of MODELS) {
    assert.ok(m.steps.length >= 4, `${m.slug}: ${m.steps.length} steps`)
    const dgs = allDiagrams(m)
    assert.equal(dgs.length, m.steps.length)
    m.steps.forEach((s, i) => {
      assert.ok(typeof s.text === 'string' && s.text.length > 10, `${m.slug} step ${i + 1}: text`)
      const dg = dgs[i]
      assert.ok(dg.items.some(it => it.t === 'face' || it.t === 'poly'), `${m.slug} step ${i + 1}: drawing`)
      assert.ok(dg.vb.every(Number.isFinite) && dg.vb[2] > 0 && dg.vb[3] > 0, `${m.slug} step ${i + 1}: viewBox`)
      if (s.op === 'fold' || s.op === 'crease' || s.op === 'multi') {
        assert.ok(dg.items.some(it => it.t === 'fold'), `${m.slug} step ${i + 1}: fold line`)
        assert.ok(dg.items.some(it => it.t === 'arrow'), `${m.slug} step ${i + 1}: arrow`)
      }
    })
    assert.equal(m.steps[m.steps.length - 1].op === 'done' || m.steps[m.steps.length - 1].op === 'set', true, `${m.slug}: ends with the finished model`)
  }
})

test('origami: folds keep the paper area, move something, and land on the paper', () => {
  for (const m of MODELS) {
    let faces = modelStates(m)[0]
    const states = modelStates(m)
    m.steps.forEach((s, i) => {
      faces = states[i]
      if (s.op === 'set') return
      const before = totalArea(faces)
      let cur = faces
      for (const f of folds(s)) {
        if (f.op !== 'fold') continue
        // the arrow's target is on the folded paper (or exactly where the folded point goes)
        if (f.to && !f.line) {
          const { a, b } = foldLine(f)
          assert.ok(dist(reflect(f.from, a, b), f.to) < 1e-6)
        }
        assert.ok(onPaper(cur, f.from), `${m.slug} step ${i + 1}: fold starts on the paper`)
        cur = applyFold(cur, f)
        const target = f.to || reflect(f.from, foldLine(f).a, foldLine(f).b)
        assert.ok(onPaper(cur, target), `${m.slug} step ${i + 1}: folded point lands on the paper`)
      }
      // folding never creates or loses paper (crease/turn/rotate keep it too)
      assert.ok(Math.abs(totalArea(states[i + 1]) - before) < 1e-3 * before, `${m.slug} step ${i + 1}: area`)
    })
  }
})

test('origami: a fold flips the moved layer to its other side', () => {
  const square = [{ pts: [[0, 0], [100, 0], [100, 100], [0, 100]], c: false, cr: [], tag: '' }]
  const out = applyFold(square, { op: 'fold', from: [0, 0], to: [100, 100] })
  assert.equal(out.length, 2)
  assert.equal(out[1].c, true, 'the moved half shows the coloured side')
  assert.ok(Math.abs(area(out[0].pts) - 5000) < 1e-6 && Math.abs(area(out[1].pts) - 5000) < 1e-6)
  const mountain = applyFold(square, { op: 'fold', from: [0, 50], to: [100, 50], mountain: true })
  assert.equal(mountain[1].c, false, 'a mountain fold puts the moved half behind')
})
