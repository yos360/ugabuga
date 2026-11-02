import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { HOW_TO_DRAW, findHowToDraw, howToDrawPath, howToDrawTitle, howToDrawDescription } from '../src/data/howToDraw.js'
import { COLORING_SUBJECTS } from '../src/data/coloringSubjects.js'

const xml = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
const paths = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]).pathname)
const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')

test('every how-to-draw sheet has its image, six steps and one sitemap entry', () => {
  const slugs = new Set(), titles = new Set()
  for (const d of HOW_TO_DRAW) {
    assert.match(d.slug, /^[a-z]+(?:-[a-z]+)*$/)
    assert.ok(!slugs.has(d.slug), d.slug); slugs.add(d.slug)
    assert.equal(d.steps.length, 6, d.slug)
    assert.equal(new Set(d.steps).size, 6, d.slug)
    assert.match(d.ages, /^\d+–\d+$/)
    assert.ok(d.tip.length > 20, d.slug)
    for (const file of [`${d.slug}.webp`, `${d.slug}-thumb.webp`]) assert.ok(existsSync(new URL(`../public/how-to-draw/${file}`, import.meta.url)), file)
    if (d.coloring) assert.ok(COLORING_SUBJECTS.some(s => s.slug === d.coloring), d.coloring)
    const title = howToDrawTitle(d)
    assert.ok(title.length <= 70 && howToDrawDescription(d).length <= 165, d.slug)
    assert.ok(!titles.has(title)); titles.add(title)
    assert.equal(findHowToDraw(d.slug), d)
    assert.equal(paths.filter(p => p === howToDrawPath(d.slug)).length, 1, d.slug)
  }
  assert.equal(paths.filter(p => p === '/how-to-draw').length, 1)
  assert.equal(paths.filter(p => /^\/how-to-draw\/[^/]+$/.test(p)).length, HOW_TO_DRAW.length)
})

test('unknown sheets are not found and both routes exist', () => {
  for (const slug of ['missing', '__proto__', 'CAT', '']) assert.equal(findHowToDraw(slug), null)
  assert.ok(app.includes('path="/how-to-draw"') && app.includes('path="/how-to-draw/:slug"'))
})
