import test from 'node:test'
import assert from 'node:assert/strict'
import { subjectCopy, drawingCopy, parseAges, relatedSubjects } from '../src/en/coloringInsights.js'
import { EN_COLORING } from '../src/en/activityCatalog.js'
import { HOLIDAY_DRAWINGS, drawingPath } from '../src/en/holidayColoringData.js'

const words = s => s.split(/\s+/).filter(Boolean).length

test('every English coloring subject page gets its own age guide, FAQ and related subjects', () => {
  const seen = new Set()
  for (const t of EN_COLORING) {
    const c = subjectCopy(t)
    const body = [...c.paragraphs, ...c.faq.flatMap(f => [f.q, f.a])].join(' ')
    assert.ok(words(body) >= 45, `${t.slug}: ${words(body)} words`)
    assert.ok(c.related.length >= 2, t.slug)
    for (const r of c.related) assert.notEqual(r.slug, t.slug)
    const key = body.replaceAll(t.name.toLowerCase(), '#').replaceAll(t.name, '#')
    assert.ok(!seen.has(key), `${t.slug} repeats another subject`)
    seen.add(key)
    assert.ok(!/\d+ ומעלה/.test(body), 'no untranslated Hebrew age labels')
  }
  assert.deepEqual(parseAges('4–7'), [4, 7])
  assert.deepEqual(parseAges('12 ומעלה'), [12, null])
  assert.ok(relatedSubjects('dolphin').some(t => t.slug === 'fish'))
})

test('single holiday drawings link to nearby drawings and differ from their siblings', () => {
  const seen = new Set()
  for (const d of HOLIDAY_DRAWINGS) {
    const c = drawingCopy(d)
    assert.ok(c.related.length >= 5, drawingPath(d))
    assert.ok(!c.related.some(r => r.href === drawingPath(d)))
    const body = [...c.paragraphs, ...c.faq.flatMap(f => [f.q, f.a])].join(' ')
    assert.ok(words(body) >= 90, `${drawingPath(d)}: ${words(body)} words`)
    assert.match(body, new RegExp(`number ${d.n}\\b`))
    assert.ok(!seen.has(body), drawingPath(d))
    seen.add(body)
  }
  // Two neighbours in the same holiday get a different fact paragraph and word.
  const [a, b] = HOLIDAY_DRAWINGS.filter(d => d.holiday === 'purim')
  assert.notEqual(drawingCopy(a).paragraphs[1], drawingCopy(b).paragraphs[1])
  assert.notEqual(drawingCopy(a).paragraphs[2], drawingCopy(b).paragraphs[2])
})
