// Site search: real queries against the real catalog (static pages + games.json).
// The source uses Vite-style imports (no extensions, a few .jsx files), so a tiny loader resolves
// extensionless paths and compiles JSX with rolldown (already installed with Vite).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { register, createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { readFileSync } from 'node:fs'

const rolldown = pathToFileURL(createRequire(import.meta.url).resolve('rolldown/experimental')).href
const hooks = `
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
export async function resolve(spec, ctx, next) {
  if ((spec.startsWith('.') || spec.startsWith('/')) && !/\\.(m?js|jsx|json)$/.test(spec)) {
    for (const ext of ['.js', '.jsx', '/index.js']) {
      if (existsSync(fileURLToPath(new URL(spec + ext, ctx.parentURL)))) return next(spec + ext, ctx)
    }
  }
  return next(spec, ctx)
}
export async function load(url, ctx, next) {
  if (!url.endsWith('.jsx')) return next(url, ctx)
  const { transformSync } = await import(${JSON.stringify(rolldown)})
  const file = fileURLToPath(url)
  return { format: 'module', source: transformSync(file, readFileSync(file, 'utf8'), { jsx: { runtime: 'automatic' } }).code, shortCircuit: true }
}`
register('data:text/javascript,' + encodeURIComponent(hooks), import.meta.url)

const { STATIC_ITEMS } = await import('../src/data/searchStatic.js')
const { searchItems, gameItem, parseQuery } = await import('../src/data/searchIndex.js')
const { games: builtIn } = await import('../src/data/games.js')
const json = JSON.parse(readFileSync(new URL('../public/data/games.json', import.meta.url), 'utf8'))
const games = [...json, ...builtIn].filter((g, i, l) => l.findIndex(x => x.slug === g.slug) === i)
const items = [...STATIC_ITEMS, ...games.map(gameItem)]

const search = q => searchItems(items, q)
const top = (q, n) => search(q).slice(0, n).map(r => r.to)
const has = (q, to, n) => assert.ok(top(q, n).includes(to), `"${q}": expected ${to} in top ${n}, got ${JSON.stringify(top(q, n))}`)

test('numbers are separate tokens and ages are recognised', () => {
  const t = parseQuery('משחק לגיל 7')
  assert.deepEqual(t.map(x => [x.kind, x.text, !!x.stop]), [['word', 'משחק', true], ['num', '7', false]])
  assert.equal(t[1].age, true)
  assert.equal(parseQuery('כיתה א')[0].kind, 'phrase')
})

test('multiplication and division worksheets', () => {
  assert.equal(top('לוח הכפל', 1)[0], '/printables/math-worksheets/multiplication')
  assert.equal(top('כפל', 1)[0], '/printables/math-worksheets/multiplication')
  has('חילוק', '/printables/math-worksheets/division', 1)
  const r = top('דפי עבודה כיתה ב', 3)
  assert.ok(r.every(to => to.startsWith('/printables/math-worksheets/')), JSON.stringify(r))
})

test('ages', () => {
  assert.ok(search('משחק לגיל 7').length > 10)
  has('משחק לגיל 7', '/games/age/7', 1)
  has('גיל 5', '/games/age/5', 3)
  has('גיל 5', '/gifts/age-5', 3)
  assert.equal(top('ברכה לבת 6', 1)[0], '/greetings/age-6')
  assert.ok(!top('ברכה לבת 6', 5).includes('/greetings/age-60'))
  // a game for 4+ is found by its age range
  assert.ok(search('משחק לגיל 7').some(r => r.kind === 'game'))
})

test('car and boredom', () => {
  assert.equal(top('משחק לנסיעה באוטו', 1)[0], '/questions/road-trip')
  has('משחק לנסיעה באוטו', '/games/quiet', 3)
  has('אוטו', '/questions/road-trip', 3)
  has('נסיעה', '/questions/road-trip', 3)
  for (const q of ['משועמם', 'משחק לבד']) {
    const r = top(q, 5)
    for (const to of ['/letters/game', '/board-games', '/tools/riddles', '/tools/trivia-quiz', '/tools/escape-rooms']) assert.ok(r.includes(to), `${q}: ${to} not in ${JSON.stringify(r)}`)
  }
})

test('words match from their start, Hebrew prefixes allowed', () => {
  const r = search('פורים')
  assert.ok(r.length >= 4)
  assert.ok(!r.some(x => /ציפור/.test(x.title)), 'פורים must not match ציפורים')
  has('פורים', '/holidays/purim', 1)
})

test('queries that already worked still work', () => {
  has('יום הולדת בבית', '/ideas/at-home', 3)
  assert.equal(top('דפי צביעה', 1)[0], '/printables/coloring')
  has('חנוכה', '/holidays/hanukkah', 3)
  has('שלטים', '/printables/birthday-signs', 1)
  has('מי מביא מה', '/tools/bring-list', 1)
  has('כמה פיצות', '/calculator/how-many-pizzas', 1)
  has('ערב משפחה', '/blog/family-game-night', 3)
  has('ערב משפחה', '/games/family', 3)
  has('כיתה א', '/classroom/first-grade', 3)
  has('מה קרה ב-14 במרץ', '/time-tunnel/03-14', 1)
})

test('a long query falls back to the best partial matches', () => {
  assert.ok(search('דפי צביעה דינוזאורים חלליים').length > 0)
})
