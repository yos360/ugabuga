import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { COLORING_SUBJECTS } from '../src/data/coloringSubjects.js'
import { COLORING_DRAWINGS, findColoringDrawing, coloringDrawingPath, coloringDrawingTitle, coloringDrawingDescription, moreColoringDrawings, relatedColoringSubjects } from '../src/data/coloringDrawings.js'

const xml = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
const paths = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]).pathname)

test('every original drawing has one detailed, unique, indexable page', () => {
  const titles = new Set(), descriptions = new Set(), scenes = new Set(), tips = new Set(), activities = new Set()
  let count = 0
  for (const s of COLORING_SUBJECTS) {
    const drawings = COLORING_DRAWINGS[s.slug]
    assert.equal(drawings.length, s.items.length, s.slug)
    const files = readdirSync(new URL(`../public/coloring/${s.slug}/`, import.meta.url)).filter(f => /\.(svg|png)$/.test(f))
    assert.equal(drawings.length, files.length, `all source drawings: ${s.slug}`)
    for (const drawing of drawings) {
      count++
      assert.equal(findColoringDrawing(s.slug, String(drawing.n)), drawing)
      assert.equal(drawing.name, s.items[drawing.n - 1])
      const title = coloringDrawingTitle(drawing), description = coloringDrawingDescription(drawing)
      assert.ok(title.length <= 70 && description.length <= 165, drawing.name)
      assert.ok(!titles.has(title) && !descriptions.has(description), drawing.name)
      assert.ok(!scenes.has(drawing.description) && !tips.has(drawing.tip) && !activities.has(drawing.activity), drawing.name)
      for (const field of ['description', 'tip', 'activity']) assert.ok(drawing[field].length > 20, `${drawing.name}: ${field}`)
      assert.match(drawing.ages, /^\d+(?:–\d+| ומעלה)$/)
      titles.add(title); descriptions.add(description); scenes.add(drawing.description); tips.add(drawing.tip); activities.add(drawing.activity)
      const path = coloringDrawingPath(s.slug, drawing.n)
      assert.equal(paths.filter(p => p === path).length, 1, path)
    }
  }
  assert.equal(count, 287)
  assert.equal(paths.filter(p => /^\/printables\/coloring\/[^/]+\/[^/]+$/.test(p)).length, count)
})

test('invalid subjects and noncanonical drawing numbers cannot produce a page', () => {
  for (const slug of ['missing', '__proto__', 'constructor', 'toString', 'CAT']) assert.equal(findColoringDrawing(slug, '1'), null)
  for (const n of ['0', '-1', '01', '1.0', '1e0', '1abc', '99999999', '', ' 1', undefined, null]) assert.equal(findColoringDrawing('cat', n), null, String(n))
})

test('each page links to bounded siblings and exactly three real related subjects', () => {
  for (const s of COLORING_SUBJECTS) {
    const related = relatedColoringSubjects(s.slug)
    assert.equal(related.length, 3)
    assert.equal(new Set(related.map(item => item.slug)).size, 3)
    assert.ok(related.every(item => item.slug !== s.slug && paths.includes(`/printables/coloring/${item.slug}`)))
    for (const d of COLORING_DRAWINGS[s.slug]) {
      const more = moreColoringDrawings(s.slug, d.n)
      assert.equal(more.length, Math.min(8, s.items.length - 1))
      assert.equal(new Set(more.map(item => item.n)).size, more.length)
      assert.ok(more.every(item => item.n !== d.n && findColoringDrawing(s.slug, item.n)))
    }
  }
})

test('edge middleware accepts real drawing pages and rejects made-up ones', async t => {
  // Only emulate the platform HTMLRewriter; exercise the actual middleware policy.
  const previous = globalThis.HTMLRewriter
  globalThis.HTMLRewriter = class { on() { return this } transform(response) { return response } }
  t.after(() => { globalThis.HTMLRewriter = previous })
  const { onRequest } = await import('../functions/_middleware.js')
  const env = { ASSETS: { fetch: async url => {
    const data = new URL(url).pathname === '/routes.json'
      ? ['^/printables/coloring/[^/]+(?:/[^/]+)?/?$'] : paths
    return Response.json(data)
  } } }
  for (const [path, status] of [
    ['/printables/coloring/cat/1', 200], ['/printables/coloring/mandala-adults/11', 200],
    ['/printables/coloring/cat', 200], ['/printables/coloring/cat/1/', 200],
    ['/printables/coloring/cat/999', 404], ['/printables/coloring/cat/01', 404],
    ['/printables/coloring/missing/1', 404], ['/printables/coloring/missing', 404],
  ]) {
    const res = await onRequest({ request: new Request('https://ugabuga.co.il' + path), env,
      next: async () => new Response('<link rel="canonical" href="https://ugabuga.co.il/">', { headers: { 'Content-Type': 'text/html' } }),
    })
    assert.equal(res.status, status, path)
    if (status === 404) assert.equal(res.headers.get('X-Robots-Tag'), 'noindex')
  }
})

