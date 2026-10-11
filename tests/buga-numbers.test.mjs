// בוגה מספרים (/games/buga-numbers): the estimation-question deck in public/data/game-content
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const deck = JSON.parse(readFileSync(new URL('../public/data/game-content/buga-numbers.json', import.meta.url), 'utf8'))
const games = JSON.parse(readFileSync(new URL('../public/data/games.json', import.meta.url), 'utf8'))

test('the game exists and has at least 200 number questions', () => {
  assert.ok(games.some(g => g.slug === 'buga-numbers' && g.status === 'active'))
  assert.ok(deck.length >= 200, `only ${deck.length} questions`)
})

test('questions and ids are unique', () => {
  const norm = s => s.replace(/[\s?״"׳'.,()]/g, '')
  assert.equal(new Set(deck.map(c => norm(c.content_text))).size, deck.length)
  assert.equal(new Set(deck.map(c => c.id)).size, deck.length)
})

test('every item has the fields the player needs and a finite numeric answer', () => {
  for (const c of deck) {
    const where = c.content_text
    assert.equal(c.game_slug, 'buga-numbers', where)
    assert.equal(c.content_type, 'question', where)
    assert.ok(c.pack_name && /[א-ת]/.test(c.pack_name), where)
    assert.match(c.content_text, /[א-ת].*\?$/, where)
    assert.ok(c.answer && /\d/.test(c.answer), where)
    assert.ok(c.answer_explanation && c.answer_explanation.length > 10, where)
    const m = c.metadata
    assert.ok(Number.isFinite(m.value), where)
    assert.equal(typeof m.unit, 'string', where)
    assert.equal(typeof m.approx, 'boolean', where)
    assert.ok(['easy', 'medium', 'hard'].includes(m.level), where)
    assert.ok(m.src && m.src.includes(';'), `${where}: needs at least two sources`)
    if (m.approx) assert.match(c.answer, /בערך|יותר מ/, where)
  }
})

test('answers never trip the player\'s true/false (אמת או בוגה) detection', () => {
  for (const c of deck) assert.doesNotMatch(c.answer.toLowerCase(), /buga|בוגה|שקר|נכון|אמת/, c.content_text)
})

test('several categories and all three levels are represented', () => {
  const packs = new Set(deck.map(c => c.pack_name))
  assert.ok(packs.size >= 8, `${packs.size} categories`)
  for (const level of ['easy', 'medium', 'hard']) assert.ok(deck.filter(c => c.metadata.level === level).length >= 30, level)
})
