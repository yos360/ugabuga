// Generated printable pages (/printables/coloring/:subject/:n, /printables/name-coloring/:name) must each
// carry their own computed text, so Google doesn't see them as near-duplicates of their siblings.
import test from 'node:test'
import assert from 'node:assert/strict'
import { COLORING_SUBJECTS } from '../src/data/coloringSubjects.js'
import { COLORING_DRAWINGS, coloringDrawingGuide, coloringSubjectSummary, parseAges, coloringDrawingPath } from '../src/data/coloringDrawings.js'
import { NAME_PAGES, nameColoringGuide, similarNamePages } from '../src/pages/printables/nameColoringData.js'

const words = s => s.split(/\s+/).filter(w => /\p{L}/u.test(w)).length

test('ages parse into a range', () => {
  assert.deepEqual(parseAges('4–7'), { min: 4, max: 7 })
  assert.deepEqual(parseAges('12 ומעלה'), { min: 12, max: null })
})

test('every coloring drawing page has its own guide, distinct from its siblings', () => {
  const intros = new Set(), faqs = new Set()
  for (const s of COLORING_SUBJECTS) {
    for (const d of COLORING_DRAWINGS[s.slug]) {
      const g = coloringDrawingGuide(s.slug, d.n)
      assert.ok(g, `${s.slug}/${d.n}`)
      const text = [g.intro, g.tools, d.description, d.tip, d.activity, ...g.faq.flatMap(f => [f.q, f.a])].join(' ')
      assert.ok(words(text) >= 110, `${s.slug}/${d.n}: ${words(text)} words`)
      assert.ok(g.intro.includes(d.name) && !intros.has(g.intro), `${s.slug}/${d.n} intro`)
      intros.add(g.intro)
      const faqKey = g.faq.map(f => f.a).join('|')
      assert.ok(!faqs.has(faqKey), `${s.slug}/${d.n} faq`)
      faqs.add(faqKey)
      // Links point at real, different drawings.
      assert.equal(g.cross.length, 3)
      for (const c of g.cross) assert.ok(c.subject.slug !== s.slug && COLORING_DRAWINGS[c.subject.slug].includes(c.drawing))
      for (const x of [g.simpler, g.harder, ...g.sameAge].filter(Boolean)) assert.ok(x.n !== d.n && coloringDrawingPath(s.slug, x.n))
      if (g.simpler) assert.ok(g.simpler.range.min < g.ages.min)
      if (g.harder) assert.ok(g.harder.range.min > g.ages.min)
    }
  }
  assert.equal(coloringDrawingGuide('cat', 99), null)
  assert.equal(coloringDrawingGuide('missing', 1), null)
})

test('every coloring subject page gets its own computed summary and FAQ', () => {
  const seen = new Set()
  for (const s of COLORING_SUBJECTS) {
    const sum = coloringSubjectSummary(s.slug)
    assert.equal(sum.total, s.items.length)
    assert.ok(sum.spread.includes(s.name) && !seen.has(sum.spread), s.slug)
    seen.add(sum.spread)
    assert.equal(sum.faq.length, 2)
  }
})

test('every name coloring page has its own letter guide and its own link sets', () => {
  const sheets = new Set()
  for (const n of NAME_PAGES) {
    const g = nameColoringGuide(n)
    const text = [g.about, g.length, g.sheet, g.practice, ...g.breakdown, ...g.faq.flatMap(f => [f.q, f.a])].join(' ')
    assert.ok(words(text) >= 120, `${n.name}: ${words(text)} words`)
    assert.ok(!sheets.has(g.sheet), n.name)
    sheets.add(g.sheet)
    assert.equal(g.breakdown.length, g.facts.count)
    assert.ok(g.faq.some(f => f.a.includes(n.meaning)))
    const similar = new Set(similarNamePages(n).map(x => x.slug))
    const linked = [...g.sameLetter, ...g.sameLength]
    assert.equal(new Set(linked.map(x => x.slug)).size, linked.length, `${n.name}: duplicate links`)
    assert.ok(linked.every(x => x !== n && !similar.has(x.slug)), n.name)
    assert.ok(g.sameLetter.every(x => x.name.replace(/[^א-ת]/g, '')[0] === g.facts.first), n.name)
  }
  // Two siblings with the same first letter still get different text.
  const [a, b] = NAME_PAGES.filter(n => n.letter === 'נ')
  assert.notEqual(nameColoringGuide(a).sheet, nameColoringGuide(b).sheet)
  assert.notDeepEqual(nameColoringGuide(a).sameLength.map(x => x.slug), nameColoringGuide(b).sameLength.map(x => x.slug))
})
