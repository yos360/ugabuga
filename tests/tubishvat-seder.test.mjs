import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  SEDER_PATH, CUPS, FRUIT_GROUPS, SEDER_SPECIES, BLESSINGS, ROLES, RIDDLES, STEPS, CRAFTS, SEDER_FAQ, FAMILY_RIDDLES, buildSeder,
} from '../src/data/tubishvatSeder.js'
import { SEVEN_SPECIES } from '../src/data/tubishvat.js'

const read = p => readFileSync(new URL(p, import.meta.url), 'utf8')

test('seven species match the area list (Deuteronomy 8:8 order)', () => {
  assert.deepEqual(SEDER_SPECIES.map(s => s.id), SEVEN_SPECIES.map(s => s.id))
  assert.deepEqual(SEDER_SPECIES.map(s => s.name), ['חיטה', 'שעורה', 'גפן', 'תאנה', 'רימון', 'זית', 'תמר'])
})

test('four cups go from white to red, and every cup and fruit group appears once in the order', () => {
  assert.deepEqual(CUPS.map(c => c.name), ['לבן', 'לבן עם מעט אדום', 'אדום עם מעט לבן', 'אדום'])
  assert.deepEqual(STEPS.filter(s => s.kind === 'cup').map(s => s.cup), [0, 1, 2, 3])
  assert.deepEqual(STEPS.filter(s => s.kind === 'fruit').map(s => s.group), FRUIT_GROUPS.map(g => g.id))
  for (const g of FRUIT_GROUPS) assert.ok(g.examples.length >= 4, g.id)
})

test('blessings use only the standard endings', () => {
  const endings = Object.values(BLESSINGS).map(b => b.text.replace(/[֑-ׇ]/g, ''))
  for (const e of endings) assert.match(e, /^ברוך אתה ה׳ אלהינו מלך העולם, /)
  assert.ok(endings.some(e => e.endsWith('בורא פרי הגפן.')))
  assert.ok(endings.some(e => e.endsWith('בורא פרי העץ.')))
  assert.ok(endings.some(e => e.endsWith('שהחינו וקימנו והגיענו לזמן הזה.')))
  for (const s of STEPS) if (s.blessing) assert.ok(BLESSINGS[s.blessing], s.id)
})

test('family version is shorter; class version has a known role on every step and all riddles', () => {
  const fam = buildSeder('family'), cls = buildSeder('class')
  const words = st => st.flatMap(s => s.lines).join(' ').split(/\s+/).length
  assert.ok(words(fam) < words(cls))
  assert.ok(fam.every(s => !s.roleName))
  const roleIds = new Set(ROLES.map(r => r.id))
  for (const s of STEPS) assert.ok(roleIds.has(s.role), s.id)
  assert.ok(cls.every(s => s.roleName))
  assert.equal(fam.find(s => s.riddles).riddles.length, FAMILY_RIDDLES)
  assert.equal(cls.find(s => s.riddles).riddles.length, RIDDLES.length)
  assert.equal(new Set(STEPS.map(s => s.id)).size, STEPS.length)
})

test('4–6 crafts, each with materials and at least 3 steps; FAQ present', () => {
  assert.ok(CRAFTS.length >= 4 && CRAFTS.length <= 6)
  for (const c of CRAFTS) { assert.ok(c.materials.length >= 2, c.id); assert.ok(c.steps.length >= 3, c.id) }
  assert.equal(CRAFTS.filter(c => c.template).length, 1)
  assert.ok(SEDER_FAQ.length >= 3)
})

test('page is wired: route before /holidays/:slug/:kind, area tab, sitemap and search', () => {
  const app = read('../src/App.jsx')
  const route = app.indexOf(`path="${SEDER_PATH}"`)
  assert.ok(route > 0 && route < app.indexOf('path="/holidays/:slug/:kind"'))
  assert.match(read('../src/holidays/tubishvat.jsx'), /base \+ '\/seder'/)
  assert.ok(read('../public/sitemap-static.xml').includes(`https://ugabuga.co.il${SEDER_PATH}<`))
  assert.ok(read('../src/data/searchStatic.js').includes(`to: '${SEDER_PATH}'`))
  assert.ok(read('../src/data/tubishvat.js').includes(`to: '${SEDER_PATH}'`))
})
