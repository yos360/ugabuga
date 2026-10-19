import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { setupBattle } from '../src/arcade/logic/battleshipSetup.js'
import { thumbnailPaths } from '../src/data/cbnThumbnail.js'
import { CBN_PICTURES, cbnGrid } from '../src/data/colorByNumber.js'

test('daily battleship fixes both fleets and AI randomness, including replays', () => {
  for (const seed of [101, 164271837, 999991]) {
    const a = setupBattle({ seed }), b = setupBattle({ seed })
    assert.deepEqual(a.mine, b.mine)
    assert.deepEqual(a.enemy, b.enemy)
    assert.notDeepEqual(a.mine.ships, a.enemy.ships)
    assert.deepEqual(Array.from({ length: 20 }, () => a.aiRand()), Array.from({ length: 20 }, () => b.aiRand()))
  }
  assert.notDeepEqual(setupBattle({ seed: 101 }).mine.ships, setupBattle({ seed: 102 }).mine.ships)
})

test('compact thumbnails preserve every colored cell of every picture', () => {
  for (const picture of CBN_PICTURES) {
    const grid = cbnGrid(picture)
    const restored = grid.map(row => row.map(() => 0))
    const paths = thumbnailPaths(grid, 1)
    for (const { color, d } of paths) {
      for (const match of d.matchAll(/M(\d+),(\d+)h(\d+)v1h-\d+z/g)) {
        const [, x, y, width] = match.map(Number)
        for (let column = x; column < x + width; column++) {
          assert.equal(restored[y][column], 0, 'no overlapping cells')
          restored[y][column] = color
        }
      }
    }
    assert.deepEqual(restored, grid, picture.slug)
    assert.ok(paths.length <= picture.colors.length)
  }
})

test('unknown arcade and math paths return real uncached 404 while known paths stay available', async t => {
  const prior = globalThis.HTMLRewriter
  globalThis.HTMLRewriter = class { on() { return this } transform(response) { return response } }
  t.after(() => { globalThis.HTMLRewriter = prior })
  const xml = await readFile(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
  const paths = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]).pathname)
  const { onRequest } = await import('../functions/_middleware.js')
  const env = { ASSETS: { fetch: async url => Response.json(new URL(url).pathname === '/routes.json' ? ['^/online-games/[^/]+$', '^/math/.+$'] : paths) } }
  const valid = paths.filter(p => /^\/(online-games|math)\//.test(p))
  assert.ok(valid.length > 27)
  for (const [path, status] of [...valid.map(path => [path, 200]), ['/online-games/not-a-real-game', 404], ['/math/not-a-real-topic', 404], ['/math/grade-1/not-a-real-topic', 404]]) {
    const response = await onRequest({ request: new Request('https://ugabuga.co.il' + path), env,
      next: async () => new Response('<link rel="canonical" href="https://ugabuga.co.il/">', { headers: { 'Content-Type': 'text/html' } }) })
    assert.equal(response.status, status, path)
    if (status === 404) { assert.equal(response.headers.get('X-Robots-Tag'), 'noindex'); assert.equal(response.headers.get('Cache-Control'), 'no-store') }
  }
})
