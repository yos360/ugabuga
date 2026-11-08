import test from 'node:test'
import assert from 'node:assert/strict'
import { COLORING_SUBJECTS } from '../src/data/coloringSubjects.js'
import { EN_DRAWING_NAMES } from '../src/en/coloring/drawingNames.js'
import { EN_COLORING_DRAWINGS, EN_COLORING_DRAWING_PAGES, findEnColoringDrawing } from '../src/en/coloring/drawingCatalog.js'
import { enDrawingLink } from '../src/en/coloring/drawingHref.js'
import { EN_ACTIVITY_PAGES, EN_COLORING } from '../src/en/activityCatalog.js'
import { HOLIDAY_DRAWINGS, HOLIDAY_COLORING_PAGES } from '../src/en/holidayColoringData.js'

test('every Hebrew coloring subject has an English hub with native editorial text', () => {
  assert.deepEqual(EN_COLORING.map(s => s.slug), COLORING_SUBJECTS.map(s => s.slug))
  for (const s of EN_COLORING) {
    assert.ok(s.name && s.tip, s.slug)
    assert.ok(EN_ACTIVITY_PAGES.some(p => p.path === s.path && p.counterpart === `/printables/coloring/${s.slug}`), s.slug)
  }
})

test('every Hebrew drawing page has exactly one English page', () => {
  const holidayByCounterpart = new Map(HOLIDAY_COLORING_PAGES.filter(p => p.counterpart).map(p => [p.counterpart, p]))
  const ownByCounterpart = new Map(EN_COLORING_DRAWING_PAGES.map(p => [p.counterpart, p]))
  for (const s of COLORING_SUBJECTS) {
    assert.equal(EN_DRAWING_NAMES[s.slug]?.length, s.items.length, `${s.slug}: one English name per drawing`)
    s.items.forEach((_, i) => {
      const he = `/printables/coloring/${s.slug}/${i + 1}`
      const own = ownByCounterpart.get(he), holiday = holidayByCounterpart.get(he)
      assert.ok(own || holiday, `${he} has no English page`)
      assert.ok(!(own && holiday), `${he} is paired twice`)
      if (own) assert.equal(own.path, `/en/coloring-pages/${s.slug}/${i + 1}`)
      // Names left null are exactly the drawings already published among the holiday drawings.
      assert.equal(EN_DRAWING_NAMES[s.slug][i] === null, Boolean(holiday), he)
      const link = enDrawingLink(s.slug, i + 1)
      assert.equal(link.href, (own || holiday).path, he)
    })
  }
  assert.equal(HOLIDAY_DRAWINGS.filter(d => d.subject).length, holidayByCounterpart.size)
})

test('English drawing pages are listed once, with unique paths, titles and descriptions', () => {
  const all = [...EN_ACTIVITY_PAGES, ...HOLIDAY_COLORING_PAGES]
  for (const key of ['path', 'title', 'counterpart']) {
    const values = all.map(p => p[key]).filter(Boolean).map(v => v.toLowerCase())
    assert.equal(new Set(values).size, values.length, `duplicate ${key}`)
  }
  for (const p of EN_COLORING_DRAWING_PAGES) assert.ok(EN_ACTIVITY_PAGES.includes(p), p.path)
  const descriptions = new Set()
  for (const d of EN_COLORING_DRAWINGS) {
    assert.ok(d.title.length <= 70, d.title)
    assert.match(d.title, / coloring page$/)
    assert.ok(d.description.length >= 115 && d.description.length <= 165, `${d.path}: ${d.description.length}`)
    assert.doesNotMatch(d.name + d.title + d.description, /[֐-׿]|undefined|null/, d.path)
    assert.ok(!descriptions.has(d.description), d.path)
    descriptions.add(d.description)
    assert.equal(findEnColoringDrawing(d.slug, String(d.n)), d)
  }
  assert.equal(findEnColoringDrawing('unicorn', '0'), null)
  assert.equal(findEnColoringDrawing('unicorn', '1.5'), null)
  assert.equal(findEnColoringDrawing('unicorn', '999'), null)
  assert.equal(findEnColoringDrawing('sufganiyah', '1'), null)
})
