import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { COSTUME_FILTERS, PURIM_COSTUME_IDEAS as IDEAS, filterCostumes } from '../src/data/purimCostumes.js'

test('the costume bank has 50+ ideas with unique ids and names', () => {
  assert.ok(IDEAS.length >= 50, `only ${IDEAS.length}`)
  assert.equal(new Set(IDEAS.map(i => i.id)).size, IDEAS.length)
  assert.equal(new Set(IDEAS.map(i => i.name)).size, IDEAS.length)
})

test('every idea has all fields and valid filter values', () => {
  const allowed = Object.fromEntries(COSTUME_FILTERS.map(f => [f.key, new Set(f.options.map(o => o.id))]))
  for (const i of IDEAS) {
    for (const k of ['id', 'emoji', 'name', 'desc']) assert.ok(typeof i[k] === 'string' && i[k].trim(), `${i.id}: ${k}`)
    assert.match(i.id, /^[a-z0-9-]+$/)
    assert.ok(Array.isArray(i.ages) && i.ages.length, `${i.id}: ages`)
    for (const a of i.ages) assert.ok(allowed.ages.has(a), `${i.id}: age ${a}`)
    for (const k of ['time', 'budget', 'type']) assert.ok(allowed[k].has(i[k]), `${i.id}: ${k}=${i[k]}`)
    assert.ok(i.materials.length >= 2 && i.materials.every(m => m.trim()), `${i.id}: materials`)
    assert.ok(i.steps.length >= 3 && i.steps.length <= 5, `${i.id}: ${i.steps.length} steps`)
  }
})

test('every filter option returns ideas, and filters combine', () => {
  for (const f of COSTUME_FILTERS) for (const o of f.options) {
    assert.ok(filterCostumes({ [f.key]: o.id }).length >= 3, `${f.key}=${o.id}`)
  }
  assert.equal(filterCostumes({}).length, IDEAS.length)
  const quickHome = filterCostumes({ time: 'quick', budget: 'home' })
  assert.ok(quickHome.length >= 10 && quickHome.every(i => i.time === 'quick' && i.budget === 'home'))
  assert.ok(filterCostumes({ ages: 'toddler', time: 'quick' }).length > 0, 'last-minute ideas for toddlers')
  assert.ok(filterCostumes({ ages: 'kinder', type: 'group' }).length >= 3, 'kindergarten group themes')
})

test('the old 14 ideas are kept and the Purim hub blurb shows the real count', () => {
  const names = IDEAS.map(i => i.name).join('|')
  for (const n of ['רובוט', 'מלך', 'חתול', 'שף', 'רופא', 'פיראט', 'אסטרונאוט', 'צייר', 'תייר', 'פרפר', 'קופסת צבעים', 'שח־מט', 'מזג האוויר', 'סלט פירות']) assert.ok(names.includes(n), n)
  const purim = readFileSync(new URL('../src/holidays/purim.jsx', import.meta.url), 'utf8')
  assert.ok(purim.includes(`'${IDEAS.length} תחפושות`), 'update the costumes blurb in src/holidays/purim.jsx')
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
  assert.ok(app.indexOf('path="/holidays/purim/costumes"') < app.indexOf('path="/holidays/:slug/:kind"'), 'static route must precede the generic one')
})
