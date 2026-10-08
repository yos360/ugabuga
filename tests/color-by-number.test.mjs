// Color by number: 20 well-formed pictures, legends that match the drawing, and math versions in
// which every exercise's answer points to exactly one legend color (the cell's own color).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const { CBN_PICTURES, CBN_COLORS, CBN_LEVELS, cbnLegend, cbnGrid, cbnAnswers, cbnMathGrid, cbnEval, cbnSize } = await import('../src/data/colorByNumber.js')

test('20 pictures with unique slugs and names, in every level', () => {
  assert.equal(CBN_PICTURES.length, 20)
  assert.equal(new Set(CBN_PICTURES.map(p => p.slug)).size, 20)
  assert.equal(new Set(CBN_PICTURES.map(p => p.name)).size, 20)
  for (const p of CBN_PICTURES) assert.match(p.slug, /^[a-z0-9-]+$/)
  for (const l of CBN_LEVELS) assert.ok(CBN_PICTURES.filter(p => p.level === l.id).length >= 5, l.id)
  for (const p of CBN_PICTURES) assert.ok(CBN_LEVELS.some(l => l.id === p.level), p.slug)
})

test('rows have equal length and sizes stay printable', () => {
  for (const p of CBN_PICTURES) {
    const w = p.rows[0].length
    p.rows.forEach((row, i) => assert.equal(row.length, w, `${p.slug} row ${i}`))
    const { cols, rows } = cbnSize(p)
    assert.ok(cols >= 12 && cols <= 24 && rows >= 9 && rows <= 24, `${p.slug} ${cols}x${rows}`)
  }
})

test('every cell color is in the legend and every legend color is used', () => {
  for (const p of CBN_PICTURES) {
    assert.equal(new Set(p.colors).size, p.colors.length, `${p.slug} duplicate legend color`)
    for (const ch of p.colors) assert.ok(CBN_COLORS[ch], `${p.slug} unknown color ${ch}`)
    const used = new Set(p.rows.join('').replace(/\./g, ''))
    for (const ch of used) assert.ok(p.colors.includes(ch), `${p.slug}: '${ch}' missing from legend`)
    for (const ch of p.colors) assert.ok(used.has(ch), `${p.slug}: legend color '${ch}' never used`)
    const legendNums = new Set(cbnLegend(p).map(l => l.num))
    for (const n of cbnGrid(p).flat()) assert.ok(n === 0 || legendNums.has(n), `${p.slug} number ${n}`)
  }
})

test('math versions: each answer belongs to exactly one color, and exercises fit the level', () => {
  for (const p of CBN_PICTURES) {
    const answers = cbnAnswers(p), kind = CBN_LEVELS.find(l => l.id === p.level).math
    const values = Object.values(answers)
    assert.equal(new Set(values).size, values.length, `${p.slug} two colors share an answer`)
    const grid = cbnGrid(p), math = cbnMathGrid(p)
    grid.forEach((row, r) => row.forEach((n, c) => {
      const ex = math[r][c]
      if (!n) return assert.equal(ex, null)
      const v = cbnEval(ex)
      const owners = Object.entries(answers).filter(([, a]) => a === v)
      assert.equal(owners.length, 1, `${p.slug} ${r},${c}: ${ex.text}`)
      assert.equal(Number(owners[0][0]), n, `${p.slug} ${r},${c}: ${ex.text} → wrong color`)
      if (kind === 'mult') assert.ok(ex.op === '×' && ex.a >= 2 && ex.a <= 10 && ex.b >= 2 && ex.b <= 10, ex.text)
      else assert.ok(ex.op === '+' && ex.a >= 1 && ex.b >= 1 && v <= (kind === 'add10' ? 10 : 20), ex.text)
    }))
  }
})

test('exercises are deterministic (print = screen)', () => {
  for (const p of CBN_PICTURES) assert.deepEqual(cbnMathGrid(p), cbnMathGrid(p))
})

test('every picture page is in the static sitemap', () => {
  const xml = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
  assert.ok(xml.includes('<loc>https://ugabuga.co.il/printables/color-by-number</loc>'))
  for (const p of CBN_PICTURES) assert.ok(xml.includes(`<loc>https://ugabuga.co.il/printables/color-by-number/${p.slug}</loc>`), p.slug)
})
