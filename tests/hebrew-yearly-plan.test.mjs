import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { GRADES, MONTHS, SKILLS, FAQ, TEMPLATE_HREF } from '../src/data/hebrewYearlyPlan.js'

const routes = readFileSync(new URL('../src/data/searchStatic.js', import.meta.url), 'utf8')
const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const exists = href => routes.includes(`'${href}'`) || routes.includes(`"${href}"`) || app.includes(`path="${href}"`)

test('six grades, ten months each, five skills filled in every month', () => {
  assert.deepEqual(GRADES.map(g => g.label), ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳'])
  assert.equal(MONTHS.length, 10)
  for (const g of GRADES) {
    assert.equal(g.months.length, MONTHS.length, g.id)
    assert.ok(g.official.length >= 2 && g.milestones, g.id)
    for (const mo of g.months) {
      assert.ok(mo.topic, g.id)
      for (const sk of SKILLS) {
        assert.ok(mo[sk.key] && mo[sk.key].length >= 8, `${g.id}/${mo.topic}/${sk.key}`)
        assert.ok(mo[sk.key].length <= 80, `too long for a printed A4 cell: ${g.id}/${mo.topic}/${sk.key}`)
      }
    }
  }
})

test('every link points to a route that exists on the site', () => {
  for (const g of GRADES) for (const mo of g.months) {
    assert.ok(mo.links.length >= 1, `${g.id}/${mo.topic} has no link`)
    for (const [label, href] of mo.links) {
      assert.ok(label, href)
      assert.ok(exists(href), `missing route ${href} (${g.id}/${mo.topic})`)
    }
  }
  assert.ok(exists(TEMPLATE_HREF) || routes.includes(TEMPLATE_HREF), TEMPLATE_HREF)
})

test('the plan is presented as a suggestion, not as an official requirement', () => {
  const text = JSON.stringify(FAQ)
  assert.match(text, /לא\. זו הצעה/)
  for (const g of GRADES.filter(x => ['gimel', 'dalet', 'he'].includes(x.id))) {
    assert.match(g.official.join(' '), /אין חלוקה רשמית/, g.id)
  }
})
