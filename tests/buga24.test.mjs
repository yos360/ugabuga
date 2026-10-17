import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { puzzle, solve24, evaluateExpression, hintFor, cleanSolution } from '../src/arcade/logic/buga24.js'

test('Buga 24 generates deterministic, verified puzzles at every level', () => {
  for (const level of ['young', 'classic', 'expert']) {
    for (let seed = 1; seed <= 80; seed++) {
      const a = puzzle(seed, level), b = puzzle(seed, level)
      assert.deepEqual(a, b)
      assert.equal(a.numbers.length, 4)
      assert.ok(a.numbers.every(number => number >= 1 && number <= (level === 'expert' ? 13 : level === 'young' ? 9 : 10)))
      assert.equal(evaluateExpression(a.solution, a.numbers).ok, true, `${level} seed ${seed}: ${a.solution}`)
      if (level === 'young') assert.doesNotMatch(a.solution, /÷/)
    }
  }
})

test('Buga 24 solver handles known puzzles and exact fractions', () => {
  assert.ok(solve24([1, 3, 4, 6]))
  assert.equal(evaluateExpression('6÷(1-3÷4)', [1, 3, 4, 6]).ok, true)
  assert.equal(evaluateExpression('(8-2)×(7-3)', [8, 2, 7, 3]).ok, true)
  assert.equal(evaluateExpression('8-2×7-3', [8, 2, 7, 3]).value, -9)
})

test('Buga 24 parser requires each offered number exactly once', () => {
  assert.match(evaluateExpression('6×4', [6, 4, 1, 1]).error, /ארבעת המספרים/)
  assert.match(evaluateExpression('6×4+1-2', [6, 4, 1, 1]).error, /ארבעת המספרים/)
  assert.match(evaluateExpression('6÷0+4+1', [6, 0, 4, 1]).error, /אינו שלם/)
  assert.match(evaluateExpression('alert(24)', [2, 2, 2, 2]).error, /סימן/)
  assert.equal(evaluateExpression('(8−2)×(7–3)', [8, 2, 7, 3]).ok, true)
  assert.equal(evaluateExpression('4×4+4+4', [4, 4, 4, 4]).ok, true)
})

test('Buga 24 hints reveal a verified solution gradually', () => {
  const game = puzzle(24, 'classic')
  assert.doesNotMatch(hintFor(game.solution, 0), /פתרון אפשרי/)
  assert.doesNotMatch(hintFor(game.solution, 1), /פתרון אפשרי/)
  assert.match(hintFor(game.solution, 2), /פתרון אפשרי/)
  assert.equal(evaluateExpression(cleanSolution(game.solution), game.numbers).ok, true)
})

test('Buga 24 has its own indexable Hebrew page and lazy game bundle', () => {
  const registry = readFileSync(new URL('../src/arcade/registry.js', import.meta.url), 'utf8')
  const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
  assert.match(registry, /slug: 'buga-24'[\s\S]*faq:[\s\S]*import\('\.\/games\/Buga24'\)/)
  assert.match(sitemap, /https:\/\/ugabuga\.co\.il\/online-games\/buga-24/)
})
