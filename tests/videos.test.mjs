import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { VIDEOS, VIDEO_CATEGORIES, VIDEO_PAGE_LABELS, videosForPath, videoSchema } from '../src/data/videos.js'

const read = p => readFileSync(new URL(p, import.meta.url), 'utf8')
const app = read('../src/App.jsx')
const sitemap = read('../public/sitemap-static.xml')
const routes = new Set([...app.matchAll(/<Route\s+path="([^"]+)"/g)].map(m => m[1]))
const inSitemap = p => sitemap.includes(`<loc>https://ugabuga.co.il${p}</loc>`)

test('video ids are unique 11-character YouTube ids, newest first', () => {
  assert.ok(VIDEOS.length >= 8)
  assert.equal(new Set(VIDEOS.map(v => v.id)).size, VIDEOS.length)
  for (const v of VIDEOS) assert.match(v.id, /^[A-Za-z0-9_-]{11}$/, v.id)
  const dates = VIDEOS.map(v => v.date)
  assert.deepEqual(dates, [...dates].sort().reverse(), 'keep VIDEOS newest first')
})

test('every video has valid fields', () => {
  const cats = new Set(VIDEO_CATEGORIES.map(c => c.id))
  assert.deepEqual([...cats].sort(), ['classroom', 'holidays', 'learning', 'party', 'tools', 'travel'])
  for (const v of VIDEOS) {
    assert.ok(['short', 'tutorial'].includes(v.kind), `${v.id}: kind`)
    assert.ok(cats.has(v.category), `${v.id}: category ${v.category}`)
    assert.match(v.date, /^\d{4}-\d{2}-\d{2}$/, `${v.id}: date`)
    assert.ok(!Number.isNaN(Date.parse(v.date)), `${v.id}: date`)
    assert.ok(v.title?.trim() && v.desc?.trim(), `${v.id}: title/desc`)
    assert.ok(Array.isArray(v.paths) && v.paths.length, `${v.id}: paths`)
  }
})

test('every video path is a real page (route in App.jsx or the sitemap), never the home page', () => {
  for (const v of VIDEOS) for (const p of v.paths) {
    assert.notEqual(p, '/', `${v.id}: no videos on the home page`)
    assert.match(p, /^\/[^?#]*[^/]$/, `${v.id}: ${p} must be a clean path`)
    assert.ok(routes.has(p) || inSitemap(p), `${v.id}: ${p} is not a route`)
    assert.ok(VIDEO_PAGE_LABELS[p], `${p}: add a link label in VIDEO_PAGE_LABELS`)
  }
})

test('videosForPath matches exactly and ignores a trailing slash', () => {
  assert.deepEqual(videosForPath('/travel').map(v => v.id), ['6HazN0BZLJY'])
  assert.deepEqual(videosForPath('/travel/').map(v => v.id), ['6HazN0BZLJY'])
  assert.deepEqual(videosForPath('/travel/play'), [])
  assert.deepEqual(videosForPath('/'), [])
  assert.deepEqual(videosForPath(''), [])
  assert.deepEqual(videosForPath('/no-such-page'), [])
  for (const p of ['/rsvp', '/tools/bring-list', '/secret-friend']) assert.deepEqual(videosForPath(p).map(v => v.id), ['-4RMMZdPBVc'])
})

test('VideoObject structured data has what Google requires', () => {
  for (const v of VIDEOS) {
    const s = videoSchema(v)
    assert.equal(s['@type'], 'VideoObject')
    for (const k of ['name', 'description', 'thumbnailUrl', 'uploadDate', 'embedUrl', 'contentUrl']) assert.ok(s[k], `${v.id}: ${k}`)
    assert.ok(!Number.isNaN(Date.parse(s.uploadDate)), s.uploadDate)
    assert.equal(s.thumbnailUrl[0], `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`)
    assert.equal(s.embedUrl, `https://www.youtube-nocookie.com/embed/${v.id}`)
    assert.equal(s.contentUrl, v.kind === 'short' ? `https://www.youtube.com/shorts/${v.id}` : `https://www.youtube.com/watch?v=${v.id}`)
  }
  assert.equal(videoSchema(VIDEOS[0], false)['@context'], undefined)
})

test('/videos is routed, in the sitemap, in site search and in the footer', async () => {
  assert.ok(routes.has('/videos'))
  assert.ok(inSitemap('/videos'))
  // searchStatic.js imports extensionless modules, so Node can't load it: check its source.
  assert.match(read('../src/data/searchStatic.js'), /\{ to: '\/videos', title: '[^']+'/, 'search entry for /videos')
  const { FOOTER_COLUMNS } = await import('../src/data/siteMenu.js')
  assert.ok(FOOTER_COLUMNS.some(c => c.links.some(([to]) => to === '/videos')))
})

test('the player stays out of the main entry (lazy in Layout)', () => {
  const layout = read('../src/components/layout/Layout.jsx')
  assert.match(layout, /lazy\(\(\) => import\('\.\/ToolVideos'\)\)/)
  assert.doesNotMatch(layout, /import\s+\w+\s+from\s+'\.\.\/ui\/VideoFacade'/)
  assert.doesNotMatch(layout, /from\s+'\.\.\/\.\.\/data\/videos'/, 'videos.js grows daily: keep it out of the entry')
  assert.match(app, /const Videos = lazy\(\(\) => import\('\.\/pages\/Videos'\)\)/)
})
