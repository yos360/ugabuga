import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { RANKING, QUESTIONS, solveQuestion, validateAcademy } from '../src/arcade/logic/pokerAcademy.js'

test('Poker Academy ranking is complete, ordered and verified by the evaluator', () => {
  assert.equal(RANKING.length, 9); assert.equal(validateAcademy(), true)
  assert.deepEqual(RANKING.map(item => item.name), ['רצף צבע', 'רביעייה', 'פול האוס', 'צבע', 'רצף', 'שלישייה', 'שני זוגות', 'זוג', 'קלף גבוה'])
})
test('every academy puzzle has one verified answer and a Hebrew explanation', () => {
  assert.ok(QUESTIONS.length >= 6); assert.deepEqual(new Set(QUESTIONS.map(question => question.level)), new Set(['beginner', 'intermediate', 'expert']))
  for (const question of QUESTIONS) { assert.equal(solveQuestion(question), question.answer); assert.ok(question.explanation.length > 25) }
})
test('Poker Academy has a lazy, indexable Hebrew page', () => {
  const registry = readFileSync(new URL('../src/arcade/registry.js', import.meta.url), 'utf8'), sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
  assert.match(registry, /slug: 'poker-academy'[\s\S]*faq:[\s\S]*import\('\.\/games\/PokerAcademy'\)/); assert.match(sitemap, /online-games\/poker-academy/)
})
