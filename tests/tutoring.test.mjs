// Tutoring plans (/tutoring): every step leads to something real, and a plan is sane for every choice a parent can make.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const { AREAS, SKILLS, skillById, skillsFor } = await import('../src/data/tutoring/skills.js')
const { DAYS_OPTIONS, MINUTES_OPTIONS, buildPlan, decodePlan, encodePlan, exerciseCount, ladderFor, sessionParts, withMarks } = await import('../src/data/tutoring/plan.js')
const { grammarBySlug } = await import('../src/data/englishGrammar.js')
const { DICTATION } = await import('../src/learn/learnData.js')

const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
const routes = [...app.matchAll(/<Route\s[^>]*path="([^"]+)"/g)].map(m => m[1])
const lashon = (await Promise.all(['lashon', 'lashon-more', 'lashon-gaps'].map(f => import(`../src/learn/subjects/data/${f}.js`)))).flatMap(m => m.TOPICS)
const booklets = readFileSync(new URL('../src/booklets/registry.js', import.meta.url), 'utf8')
const mathSlugs = {}
for (let g = 1; g <= 8; g++) mathSlugs[g] = Object.values(await import(`../src/math/topics/grade${g}.js`)).find(Array.isArray).map(t => t.slug)

test('tutoring: every skill is complete and its ids are unique', () => {
  assert.equal(new Set(SKILLS.map(s => s.id)).size, SKILLS.length)
  for (const s of SKILLS) {
    assert.ok(AREAS.some(a => a.id === s.area), s.id)
    assert.ok(s.title && s.short && s.tip && s.signs.length >= 3, s.id)
    assert.ok(s.steps.length >= 3, s.id)
    assert.ok(s.grades[0] >= 1 && s.grades[1] >= s.grades[0], s.id)
    for (const x of s.steps) assert.ok(x.title && x.how.length > 20, `${s.id}: ${x.title}`)
  }
})

test('tutoring: every step links to something that exists', () => {
  for (const s of SKILLS) for (const x of s.steps) {
    const l = x.link, where = `${s.id}: ${x.title}`
    if (l.type === 'math-topic') assert.ok(mathSlugs[l.grade].includes(l.slug), where)
    else if (l.type === 'lesson') assert.ok(lashon.some(t => `lashon/${t.slug}` === l.slug), where)
    else if (l.type === 'grammar') assert.ok(grammarBySlug(l.slug), where)
    else if (l.type === 'dictation') assert.ok(DICTATION.some(d => d.id === l.set), where)
    else if (l.type === 'booklet') assert.ok(booklets.includes(`slug: '${l.slug}'`), where)
    else if (l.type === 'page') assert.ok(routes.includes(l.slug), where)
    else assert.ok(['reading', 'vocab-auto', 'unseen-auto'].includes(l.type), where)
  }
})

test('tutoring: a grade only sees skills that have a ladder for it', () => {
  for (let g = 1; g <= 8; g++) {
    assert.ok(skillsFor(g).length >= 6, `grade ${g}`)
    for (const s of skillsFor(g)) for (const base of [true, false]) {
      const l = ladderFor(s, g, base)
      assert.ok(l.length >= 1, `${s.id} grade ${g}`)
      assert.ok(l.every(x => !x.grade || x.grade <= g), `${s.id} grade ${g}: above the child's grade`)
    }
  }
})

test('tutoring: every plan a parent can build has the right sessions and starts easy', () => {
  for (let grade = 1; grade <= 8; grade++) for (const skill of skillsFor(grade)) for (const weeks of [1, 4]) for (const days of DAYS_OPTIONS) for (const base of [true, false]) {
    const o = { grade, skills: [skill.id], weeks, days, minutes: 15, base, focus: false }
    const plan = buildPlan(o)
    assert.equal(plan.length, weeks * days)
    assert.equal(plan[0].stepIndex, 0, `${skill.id}: starts at the first step`)
    assert.equal(plan[0].review, false, `${skill.id}: doesn't open with a review`)
    for (let i = 1; i < plan.length; i++) if (!plan[i].review && !plan[i - 1].review) assert.ok(plan[i].stepIndex >= plan[i - 1].stepIndex, `${skill.id}: never goes backwards`)
    for (const x of plan) assert.ok(x.sources.length && x.sources.every(y => y.step), skill.id)
    if (weeks > 1) assert.equal(plan.at(-1).final, true)
  }
})

test('tutoring: three skills all get lessons, even in the shortest week', () => {
  const skills = skillsFor(5).slice(0, 3).map(s => s.id)
  for (const days of DAYS_OPTIONS) {
    const plan = buildPlan({ grade: 5, skills, weeks: 1, days, minutes: 15, base: true, focus: false })
    for (const id of skills) assert.ok(plan.some(x => x.skill.id === id && !x.review), `${id} in ${days} days`)
    // a review never looks back at a skill that hasn't been taught yet
    for (const x of plan) if (x.review) assert.ok(plan.slice(0, x.index).some(y => y.skill.id === x.skill.id), `${days} days`)
  }
})

test('tutoring: a hard session repeats the step, and the plan moves on again after an easy one', () => {
  const o = { grade: 5, skills: ['fractions'], weeks: 4, days: 5, minutes: 15, base: true, focus: false }
  const plan = buildPlan(o)
  assert.equal(withMarks(plan, {}).map(x => x.stepIndex).join(), plan.map(x => x.stepIndex).join())
  const later = plan.find(x => x.index > 1 && !x.review && x.stepIndex > plan[0].stepIndex)
  const held = withMarks(plan, { [later.index - 1]: 'hard' })
  assert.ok(held[later.index].stepIndex < later.stepIndex)
  assert.equal(held[later.index].title, held[later.index].ladder[held[later.index].stepIndex].title)
})

test('tutoring: a session\'s parts add up to its minutes', () => {
  for (const m of MINUTES_OPTIONS) for (const f of [true, false]) {
    const t = sessionParts(m, f)
    assert.equal(t.warm + t.learn + t.practice + t.end + t.brk, m)
    assert.ok(t.learn > 0 && t.practice > 0)
  }
  assert.ok(exerciseCount(10, 'easy') >= 4)
})

test('tutoring: the plan survives its link, and a broken link falls back', () => {
  const o = { grade: 6, skills: ['percent', 'writing'], weeks: 4, days: 3, minutes: 30, base: false, focus: true }
  assert.deepEqual(decodePlan(encodePlan(o)), o)
  const bad = decodePlan('g=99&s=nothing.fractions.letters&w=7&d=9&m=1')
  assert.deepEqual(bad.skills, [])
  assert.equal(bad.grade, 8)
  assert.equal(bad.weeks, 1)
  assert.ok(skillById('fractions').grades[1] < 8)
})

test('tutoring: the hub, the pages and the skill pages are in the sitemap', () => {
  assert.ok(sitemap.includes('https://ugabuga.co.il/tutoring<'))
  for (const s of SKILLS) assert.ok(sitemap.includes(`https://ugabuga.co.il/tutoring/${s.id}<`), s.id)
  assert.ok(!sitemap.includes('/tutoring/plan'), 'a personal plan is not a search page')
})
