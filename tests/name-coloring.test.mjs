// Name colouring sheet (/printables/name-coloring): letter grids, fitting, name pages and sitemap.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const M = await import('../src/pages/printables/nameColoringData.js')
const { BABY_NAMES } = await import('../src/data/babyNames.js')

test('letters: niqqud, spaces and geresh are dropped; final letters stay', () => {
  assert.deepEqual(M.nameLetters('נוֹעָה'), ['נ', 'ו', 'ע', 'ה'])
  assert.deepEqual(M.nameLetters("ג׳ורג׳ אדם"), ['ג', 'ו', 'ר', 'ג', 'א', 'ד', 'ם'])
  assert.equal(M.plainName('  נוֹעָה  רוז '), 'נועה רוז')
  assert.equal(M.cleanName('נועה123!'), 'נועה')
})

test('letter grid: every name letter appears, distractors never use a letter or its final twin', () => {
  for (const level of ['gan', 'alef']) for (const n of [...BABY_NAMES.map(b => b.name), 'Daniel', 'שמחת תורה', 'גל']) {
    const letters = M.nameLetters(n)
    const { cells, cols } = M.letterGrid(n, level)
    assert.equal(cells.length, cols * 2)
    assert.ok(cells.length >= (level === 'alef' ? 18 : 12))
    for (const c of new Set(letters)) assert.ok(cells.some(x => x.c === c), `${n}: ${c} missing`)
    const twins = { ך: 'כ', ם: 'מ', ן: 'נ', ף: 'פ', ץ: 'צ', כ: 'ך', מ: 'ם', נ: 'ן', פ: 'ף', צ: 'ץ' }
    for (const x of cells.filter(x => !x.inName)) assert.ok(!letters.includes(twins[x.c]) && !letters.map(c => c.toLowerCase()).includes(x.c.toLowerCase()), `${n}: ${x.c}`)
    const others = cells.filter(x => !x.inName).length
    assert.ok(others >= 3, `${n}: only ${others} distractors`)
    assert.deepEqual(M.letterGrid(n, level), { cells, cols }, 'reproducible')
  }
  assert.ok(!M.letterGrid('אדם', 'alef').cells.some(x => x.c === 'מ'))
})

test('first-letter choices hold the first letter and two others', () => {
  for (const b of BABY_NAMES) {
    const ch = M.firstLetterChoices(b.name)
    assert.equal(ch.length, 3)
    assert.equal(new Set(ch).size, 3)
    assert.ok(ch.includes(M.nameLetters(b.name)[0]))
  }
})

test('the bubble name fits its box; long multi-word names split in two lines', () => {
  for (const n of [...BABY_NAMES.map(b => b.name), 'Maximilian', 'Alexandra Rose']) {
    const { lines, size, spacing } = M.fitName(n, 115, 45, 56)
    for (const l of lines) assert.ok(size * (M.textEm(l) + [...l].length * spacing) <= 115, n)
    assert.ok(size >= 18 && size <= 56, `${n}: ${size}`)
  }
  assert.equal(M.fitName('נועה רוז', 115, 45).lines.length, 2)
  assert.equal(M.fitName('גל', 115, 45).lines.length, 1)
})

test('name pages: slug or any word resolves; unique titles; 120–165 char descriptions', () => {
  assert.equal(M.resolveNameParam('noa').entry.name, 'נועה')
  assert.equal(M.resolveNameParam(encodeURIComponent('נועה')).entry.slug, 'noa')
  assert.deepEqual(M.resolveNameParam(encodeURIComponent('שוקו')), { name: 'שוקו', entry: null })
  assert.doesNotThrow(() => M.resolveNameParam('%E0%A4%A'))
  assert.equal(M.resolveNameParam('%21%21').name, '')
  const titles = new Set()
  for (const n of M.NAME_PAGES) {
    const d = M.namePageDescription(n)
    assert.ok(d.length >= 100 && d.length <= 165 && d.includes(n.name), `${n.name}: ${d.length}`)
    titles.add(M.namePageTitle(n))
    assert.ok(M.namePageIntro(n).includes(n.name))
  }
  assert.equal(titles.size, M.NAME_PAGES.length)
  assert.ok(M.NAME_PAGES.length >= 200 && M.NAME_PAGES.length <= 400)
  assert.ok(M.namePageIntro(M.resolveNameParam('adam').entry).includes('מ״ם סופית'))
})

test('routes, sitemap, search and menu', () => {
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
  const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
  assert.ok(app.includes('path="/printables/name-coloring"') && app.includes('path="/printables/name-coloring/:name"'))
  assert.ok(sitemap.includes('<loc>https://ugabuga.co.il/printables/name-coloring</loc>'))
  const listed = [...sitemap.matchAll(/<loc>https:\/\/ugabuga\.co\.il\/printables\/name-coloring\/([^<]+)<\/loc>/g)].map(m => m[1])
  assert.deepEqual(listed, M.NAME_PAGES.map(n => n.slug), 'run node scripts/generate-name-coloring.mjs')
  assert.match(readFileSync(new URL('../src/data/searchStatic.js', import.meta.url), 'utf8'), /to: '\/printables\/name-coloring'/)
  assert.match(readFileSync(new URL('../src/data/siteMenu.js', import.meta.url), 'utf8'), /to: '\/printables\/name-coloring'/)
})
