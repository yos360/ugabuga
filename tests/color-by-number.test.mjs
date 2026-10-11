// Color by number: well-formed pictures (at least 50), legends that match the drawing, and math versions in
// which every exercise's answer points to exactly one legend color (the cell's own color).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const { CBN_PICTURES, CBN_COLORS, CBN_LEVELS, CBN_THEMES, CBN_MATH_KINDS, CBN_LETTER_LEVELS, cbnLegend, cbnGrid, cbnAnswers, cbnMathGrid, cbnEval, cbnSize, cbnFitsKind, cbnLetters, cbnLetterGrid, cbnLetterTags, cbnLetterOwner, cbnHolidayPictures } = await import('../src/data/colorByNumber.js')

test('50+ pictures with unique slugs and names, in every level', () => {
  const n = CBN_PICTURES.length
  assert.ok(n >= 50, `only ${n} pictures`)
  assert.equal(new Set(CBN_PICTURES.map(p => p.slug)).size, n)
  assert.equal(new Set(CBN_PICTURES.map(p => p.name)).size, n)
  for (const p of CBN_PICTURES) assert.ok(p.blurb && p.emoji && p.colors.length >= 3, p.slug)
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

test('themes and holidays are known values, and every holiday hub has pictures', () => {
  const holidays = ['rosh-hashana', 'sukkot', 'hanukkah', 'purim', 'pesach', 'shavuot', 'yom-haatzmaut', 'tu-bishvat']
  for (const p of CBN_PICTURES) {
    if (p.theme) assert.ok(CBN_THEMES.some(t => t.id === p.theme && t.id !== 'holidays'), `${p.slug} theme ${p.theme}`)
    if (p.holiday) assert.ok(holidays.includes(p.holiday), `${p.slug} holiday ${p.holiday}`)
  }
  for (const h of holidays) assert.ok(cbnHolidayPictures(h).length >= 1, h)
  for (const t of CBN_THEMES) assert.ok(CBN_PICTURES.some(p => (t.id === 'holidays' ? p.holiday : p.theme === t.id)), t.id)
})

test('every legend is non-empty and every numbered cell has a legend entry', () => {
  for (const p of CBN_PICTURES) {
    const legend = cbnLegend(p)
    assert.ok(legend.length >= 3, p.slug)
    for (const l of legend) assert.ok(l.hex && l.name, `${p.slug} ${l.ch}`)
    const nums = new Set(legend.map(l => l.num))
    const cells = cbnGrid(p).flat().filter(n => n !== 0)
    assert.ok(cells.length > 0, p.slug)
    for (const n of cells) assert.ok(nums.has(n), `${p.slug} cell number ${n} not in legend`)
  }
})

const RANGE = {
  add10: ex => ex.op === '+' && ex.a >= 1 && ex.b >= 1 && ex.a + ex.b <= 10,
  sub10: ex => ex.op === '−' && ex.a <= 10 && ex.b >= 1 && ex.a - ex.b >= 0,
  add20: ex => ex.op === '+' && ex.a >= 1 && ex.b >= 1 && ex.a + ex.b <= 20,
  sub20: ex => ex.op === '−' && ex.a >= 11 && ex.a <= 20 && ex.b >= 1 && ex.a - ex.b >= 0,
  mult: ex => ex.op === '×' && ex.a >= 2 && ex.a <= 10 && ex.b >= 2 && ex.b <= 10,
  div: ex => ex.op === '÷' && ex.b >= 2 && ex.b <= 10 && ex.a % ex.b === 0 && ex.a / ex.b <= 10,
}

test('color by answer: in every kind each answer maps to exactly one color, and exercises fit the kind', () => {
  assert.deepEqual(CBN_MATH_KINDS.map(k => k.id).sort(), Object.keys(RANGE).sort())
  assert.equal(new Set(CBN_MATH_KINDS.map(k => k.slug)).size, CBN_MATH_KINDS.length)
  for (const k of CBN_MATH_KINDS) {
    const fits = CBN_PICTURES.filter(p => cbnFitsKind(p, k.id))
    assert.ok(fits.length >= 40, `${k.id}: only ${fits.length} pictures`)
    for (const p of fits) {
      const answers = cbnAnswers(p, k.id), values = Object.values(answers)
      assert.equal(values.length, p.colors.length, `${k.id} ${p.slug}`)
      assert.equal(new Set(values).size, values.length, `${k.id} ${p.slug}: two colors share an answer`)
      const grid = cbnGrid(p), math = cbnMathGrid(p, k.id)
      grid.forEach((row, r) => row.forEach((n, c) => {
        const ex = math[r][c]
        if (!n) return assert.equal(ex, null)
        const owners = Object.entries(answers).filter(([, a]) => a === cbnEval(ex))
        assert.equal(owners.length, 1, `${k.id} ${p.slug} ${ex.text}`)
        assert.equal(Number(owners[0][0]), n, `${k.id} ${p.slug} ${ex.text} → wrong color`)
        assert.ok(RANGE[k.id](ex), `${k.id} ${p.slug} ${ex.text}`)
      }))
    }
  }
  // the default kind of a picture gives exactly the sheet of its own page
  for (const p of CBN_PICTURES) {
    const kind = CBN_LEVELS.find(l => l.id === p.level).math
    assert.deepEqual(cbnMathGrid(p, kind), cbnMathGrid(p), p.slug)
  }
})

test('color by letter: every cell letter belongs to exactly one legend letter — its own color', () => {
  for (const lv of CBN_LETTER_LEVELS) {
    assert.equal(new Set(lv.pool).size, lv.pool.length, lv.id)
    for (const p of CBN_PICTURES) {
      assert.ok(lv.pool.length >= p.colors.length, `${lv.id} ${p.slug}`)
      const letters = cbnLetters(p, lv.id), tags = cbnLetterTags(p, lv.id)
      assert.equal(Object.keys(letters).length, p.colors.length)
      assert.equal(new Set(Object.values(letters)).size, p.colors.length, `${lv.id} ${p.slug}: repeated letter`)
      for (const t of Object.values(tags)) assert.ok(t, `${lv.id} ${p.slug} empty tag`)
      const grid = cbnGrid(p), cells = cbnLetterGrid(p, lv.id)
      grid.forEach((row, r) => row.forEach((n, c) => {
        const sym = cells[r][c]
        if (!n) return assert.equal(sym, null)
        const owners = cbnLetterOwner(lv.id, sym).filter(l => Object.values(letters).includes(l))
        assert.equal(owners.length, 1, `${lv.id} ${p.slug} ${sym}`)
        assert.equal(owners[0], letters[n], `${lv.id} ${p.slug} ${sym} → wrong color`)
      }))
    }
  }
  // levels really differ: the same picture gets different cells in each level
  const p = CBN_PICTURES[0]
  for (const lang of ['he', 'en']) {
    const ids = CBN_LETTER_LEVELS.filter(l => l.lang === lang).map(l => l.id)
    assert.equal(ids.length, 3, lang)
    assert.equal(new Set(ids.map(id => cbnLetterGrid(p, id).flat().filter(Boolean).join(''))).size, 3, lang)
  }
})

test('new pages are routed and in the sitemap', () => {
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
  const xml = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
  for (const path of ['/printables/color-by-answer', '/printables/color-by-answer/:op', '/printables/color-by-letter', '/printables/color-by-letter/english']) assert.ok(app.includes(`path="${path}"`), path)
  const pages = ['/printables/color-by-answer', ...CBN_MATH_KINDS.map(k => `/printables/color-by-answer/${k.slug}`), '/printables/color-by-letter', '/printables/color-by-letter/english']
  for (const path of pages) assert.ok(xml.includes(`<loc>https://ugabuga.co.il${path}</loc>`), path)
})
