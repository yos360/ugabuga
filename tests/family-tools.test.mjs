// /family content: stories render for both genders, links point to real routes
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const { STORIES, STORY_ANIMALS, ACTIVITIES, CAR_GAMES, BINGO_WORDS, MOVES, ROUTINE_TASKS } = await import('../src/family/familyData.js')
const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')

test('every story renders for a boy and a girl with every animal', () => {
  for (const s of STORIES) for (const gender of ['m', 'f']) for (const a of STORY_ANIMALS) {
    const g = (m, f) => (gender === 'm' ? m : f)
    const text = [s.title('דנה'), ...s.body('דנה', g, a)].join(' ')
    assert.doesNotMatch(text, /undefined|\$\{|  /, `${s.id}/${gender}`)
    assert.ok(text.includes('דנה') && text.includes(a[2]), s.id)
    if (gender === 'f') assert.doesNotMatch(text, /דנה (הלך|אמר|שאל|נרדם|ישן)\b/, s.id)
  }
})
test('internal links point to routes that exist', () => {
  for (const x of [...ACTIVITIES, ...CAR_GAMES]) if (x.to) assert.ok(app.includes(`path="${x.to}"`) || app.includes(`path="${x.to.replace(/\/[^/]+$/, '/:slug')}"`), x.to)
})
test('content sizes', () => {
  assert.ok(ACTIVITIES.length >= 40 && CAR_GAMES.length >= 12 && MOVES.length >= 30)
  assert.ok(new Set(BINGO_WORDS).size === BINGO_WORDS.length && BINGO_WORDS.length >= 16)
  for (const k of ['morning', 'evening']) assert.ok(ROUTINE_TASKS[k].every(t => t.length === 4 && t[3] > 0))
})
