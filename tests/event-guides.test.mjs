import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { EVENT_GUIDES } from '../src/data/eventGuides.js'
import { SUPPLIER_CATEGORIES } from '../src/data/supplierOptions.js'

const sitemap = fs.readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
const app = fs.readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')

test('four event guides with unique paths, sitemap entries and routes', () => {
  assert.equal(EVENT_GUIDES.length, 4)
  assert.equal(new Set(EVENT_GUIDES.map(g => g.path)).size, 4)
  for (const g of EVENT_GUIDES) {
    assert.ok(sitemap.includes(`https://ugabuga.co.il${g.path}</loc>`), g.path)
    assert.ok(app.includes(`path="${g.path}" element={<EventGuide id="${g.id}"`), g.path)
  }
})

test('every guide has sections, a checklist, 2+ FAQ and a CTA', () => {
  for (const g of EVENT_GUIDES) {
    assert.ok(g.sections.length >= 4, g.id)
    assert.ok(g.checklist.groups.every(x => x.items.length), g.id)
    assert.ok(g.faq.length >= 2 && g.faq.every(f => f.q && f.a), g.id)
    assert.ok(g.cta.to.startsWith('/'), g.id)
    assert.ok(g.description.length >= 80, g.id)
  }
})

test('bachelorette has a quiz, the venue guide has questions and the venues category exists', () => {
  assert.ok(EVENT_GUIDES.find(g => g.id === 'bachelorette').quiz.questions.length >= 10)
  assert.ok(EVENT_GUIDES.find(g => g.id === 'venue').questions.groups.length >= 4)
  assert.ok(SUPPLIER_CATEGORIES.some(([id, label]) => id === 'venues' && label.includes('מקומות לאירוע')))
})

test('guides link to the RSVP pages that exist', () => {
  assert.equal(EVENT_GUIDES.find(g => g.id === 'henna').cta.to, '/rsvp/henna')
  assert.equal(EVENT_GUIDES.find(g => g.id === 'bachelorette').cta.to, '/rsvp')
})
