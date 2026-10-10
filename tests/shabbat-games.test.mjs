// Shabbat games hub (/games/shabbat): no-electricity, no-writing games.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const { SHABBAT_GAMES, SHABBAT_KINDS, SHABBAT_FAQ, gamesByKind, kindOf } = await import('../src/data/shabbatGames.js')

test('at least 25 complete games with unique slugs', () => {
  assert.ok(SHABBAT_GAMES.length >= 25, String(SHABBAT_GAMES.length))
  assert.equal(new Set(SHABBAT_GAMES.map(g => g.slug)).size, SHABBAT_GAMES.length)
  for (const g of SHABBAT_GAMES) {
    assert.match(g.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/)
    assert.ok(kindOf(g.kind), `${g.slug} kind`)
    assert.ok(g.title && g.emoji && g.ages && g.players, g.slug)
    assert.ok(g.rules.length >= 3, `${g.slug} rules`)
  }
})

test('every kind is used and filtering works', () => {
  for (const k of SHABBAT_KINDS) assert.ok(gamesByKind(k.id).length >= 3, k.id)
  assert.equal(gamesByKind('all').length, SHABBAT_GAMES.length)
  assert.ok(gamesByKind('printed').every(g => g.link), 'printed games link to a printable page')
})

test('rules never call for electricity or writing during the game', () => {
  for (const g of SHABBAT_GAMES) {
    const text = g.rules.join(' ')
    assert.ok(!/כותבים|רושמים|טלפון נייד|מסך|טיימר|מדליקים/.test(text), g.slug)
  }
})

test('internal links point to existing routes', () => {
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
  const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
  for (const g of SHABBAT_GAMES.filter(x => x.link)) {
    const href = g.link.href
    assert.ok(app.includes(`path="${href}"`) || sitemap.includes(`ugabuga.co.il${href}<`), href)
  }
})

test('FAQ is non-halachic and points to family custom', () => {
  assert.ok(SHABBAT_FAQ.length >= 4)
  assert.ok(SHABBAT_FAQ.some(f => f.a.includes('לא פוסק הלכה') && f.a.includes('הרב')))
})
