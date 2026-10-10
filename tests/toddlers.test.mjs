// Toddler activities and birthday pages (/toddlers, /toddlers/age-N, /toddlers/birthday-age-N).
import { test } from 'node:test'
import assert from 'node:assert/strict'
const {
  DEVELOPS, TODDLER_AGES, TODDLER_ACTIVITIES, TODDLER_BIRTHDAYS, TODDLER_SAFETY, SCREEN_NOTE, HUB_FAQ,
  activitiesForAge, toddlerAge, toddlerBirthday, TODDLER_SLUGS, filterActivities, ageFaq,
} = await import('../src/data/toddlers.js')

test('ages 1–3 each have at least 20 activities', () => {
  assert.deepEqual(TODDLER_AGES.map(a => a.n), [1, 2, 3])
  for (const a of TODDLER_AGES) assert.ok(activitiesForAge(a.n).length >= 20, `${a.slug}: ${activitiesForAge(a.n).length}`)
})

test('activities are complete, unique and use known development areas', () => {
  const slugs = TODDLER_ACTIVITIES.map(a => a.slug)
  assert.equal(new Set(slugs).size, slugs.length)
  for (const a of TODDLER_ACTIVITIES) {
    assert.match(a.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/)
    assert.ok(a.title && a.emoji && a.time && a.how.length > 40, a.slug)
    assert.ok(a.materials.length >= 1, a.slug)
    assert.ok(a.ages.length && a.ages.every(n => [1, 2, 3].includes(n)), a.slug)
    assert.ok(a.develops.length && a.develops.every(d => DEVELOPS[d]), a.slug)
  }
})

test('water and threading activities always carry a safety note', () => {
  for (const a of TODDLER_ACTIVITIES) {
    if (/(^|[\s,])מים|גיגית|שרוך/.test(a.materials.join(' '))) assert.ok(a.safety, `${a.slug} needs safety`)
  }
})

test('birthday pages: short party, nap timing, cake, balloon safety, FAQ', () => {
  assert.equal(TODDLER_BIRTHDAYS.length, 3)
  for (const b of TODDLER_BIRTHDAYS) {
    assert.match(b.length, /שעה/)
    assert.ok(b.nap.includes('שינה'), b.slug)
    assert.ok(/סמאש|עוגה/.test(b.cake), b.slug)
    assert.ok(b.safety.some(s => s.includes('בלונ')), `${b.slug} balloons`)
    assert.ok(b.games.length >= 5 && b.schedule.length >= 3, b.slug)
    assert.ok(b.faq.length >= 4, b.slug)
    assert.ok(b.description.length >= 120 && b.description.length <= 160, `${b.slug} desc ${b.description.length}`)
  }
  assert.ok(TODDLER_BIRTHDAYS[0].cake.includes('דבש'), 'no honey under 1 is mentioned')
})

test('age page descriptions are SEO-length and titles unique', () => {
  for (const a of TODDLER_AGES) assert.ok(a.description.length >= 120 && a.description.length <= 160, `${a.slug} ${a.description.length}`)
  const titles = [...TODDLER_AGES.map(a => a.seoTitle), ...TODDLER_BIRTHDAYS.map(b => b.seoTitle)]
  assert.equal(new Set(titles).size, titles.length)
})

test('slug lookup and filter helpers', () => {
  assert.deepEqual(TODDLER_SLUGS, ['age-1', 'age-2', 'age-3', 'birthday-age-1', 'birthday-age-2', 'birthday-age-3'])
  assert.equal(toddlerAge('age-2').n, 2)
  assert.equal(toddlerBirthday('birthday-age-3').n, 3)
  assert.equal(toddlerAge('age-4'), null)
  assert.equal(toddlerBirthday('nope'), null)
  const all = activitiesForAge(1)
  assert.equal(filterActivities(all, 'all'), all)
  assert.ok(filterActivities(all, 'gross').every(a => a.develops.includes('gross')))
})

test('safety, screen and FAQ copy present', () => {
  assert.ok(TODDLER_SAFETY.some(s => s.text.includes('3.2')), 'small-parts cylinder size')
  assert.ok(SCREEN_NOTE.text.join(' ').includes('AAP') && SCREEN_NOTE.text.join(' ').includes('WHO'))
  assert.ok(HUB_FAQ.length >= 4)
  for (const a of TODDLER_AGES) {
    const f = ageFaq(a)
    assert.ok(f.length >= 4 && f.every(x => x.q && x.a && !/undefined/.test(x.a)), a.slug)
  }
})
