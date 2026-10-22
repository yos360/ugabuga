// Adults' leisure area: every generated crossword is a full, symmetric grid whose answers match its
// letters, every page is in the sitemap, and the mandala generator is deterministic.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const { CROSSWORDS } = await import('../src/adults/crosswordsData.js')
const { makeMandala, MANDALA_LEVELS } = await import('../src/adults/mandala.js')
const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
const FINAL = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' }
const norm = w => [...w].map(c => FINAL[c] || c).join('')

test('crosswords: enough of each size, unique ids and grids', () => {
  assert.ok(CROSSWORDS.filter(p => p.size === 9).length >= 10)
  assert.ok(CROSSWORDS.filter(p => p.size === 11).length >= 3)
  assert.equal(new Set(CROSSWORDS.map(p => p.id)).size, CROSSWORDS.length)
  assert.equal(new Set(CROSSWORDS.map(p => p.grid.join(''))).size, CROSSWORDS.length)
})

for (const p of CROSSWORDS) test(`crossword ${p.id}: full grid, answers match the letters`, () => {
  const n = p.size, g = p.grid
  assert.equal(g.length, n); for (const row of g) assert.equal([...row].length, n)
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) assert.equal(g[y][x] === '#', g[n - 1 - y][n - 1 - x] === '#', `${p.id}: symmetric at ${y},${x}`)
  // Walk every word (across = along the row string, down = along the column) and compare with the clue list.
  const black = (y, x) => y < 0 || x < 0 || y >= n || x >= n || g[y][x] === '#'
  let k = 0; const found = { across: [], down: [] }
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (black(y, x)) continue
    const a = black(y, x - 1) && !black(y, x + 1), d = black(y - 1, x) && !black(y + 1, x)
    if (!a && !d) continue
    k++
    if (a) { let w = '', xx = x; while (!black(y, xx)) w += g[y][xx++]; found.across.push([k, w]) }
    if (d) { let w = '', yy = y; while (!black(yy, x)) w += g[yy++][x]; found.down.push([k, w]) }
  }
  for (const dir of ['across', 'down']) {
    assert.deepEqual(found[dir].map(([num]) => num), p[dir].map(c => c.n), `${p.id} ${dir} numbering`)
    found[dir].forEach(([, w], i) => { const c = p[dir][i]; assert.equal(norm(c.answer), w, `${p.id} ${dir} ${c.n}`); assert.ok(c.clue.length > 1 && c.len === w.length) })
  }
  const all = [...p.across, ...p.down].map(c => norm(c.answer))
  assert.equal(new Set(all).size, all.length, `${p.id}: a word repeats`)
  assert.ok(sitemap.includes(`<loc>https://ugabuga.co.il/adults/crosswords/${p.id}</loc>`), `sitemap ${p.id}`)
})

test('adults pages are in the sitemap', () => {
  for (const path of ['/adults', '/adults/crosswords', '/adults/mandalas', '/adults/memory', '/adults/grandparents', '/adults/grandparents/interview'])
    assert.ok(sitemap.includes(`<loc>https://ugabuga.co.il${path}</loc>`), path)
})

test('mandala generator: same number gives the same mandala, every level draws', () => {
  for (const l of MANDALA_LEVELS) {
    const a = makeMandala(4821, l.id), b = makeMandala(4821, l.id)
    assert.deepEqual(a, b)
    assert.ok(a.shapes.length > 4 && a.shapes.every(s => s.items.length))
    assert.notDeepEqual(makeMandala(4822, l.id), a)
  }
})
