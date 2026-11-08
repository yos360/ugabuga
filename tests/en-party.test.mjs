import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { PARTY_PAGES, PARTY_SKIPPED } from '../src/en/party/catalog.js'
import { PARTY_GAMES } from '../src/en/party/games.js'
import { PARTY_1 } from '../src/en/party/content/party1.js'
import { PARTY_2 } from '../src/en/party/content/party2.js'
import { PARTY_3 } from '../src/en/party/content/party3.js'
import { PARTY_4 } from '../src/en/party/content/party4.js'
import { PARTY_HUBS, PARTY_AGES } from '../src/en/party/content/hubs.js'
import { CARD_GAMES_EN } from '../src/en/party/content/cards.js'
import { DICE_GAMES_EN } from '../src/en/party/content/dice.js'
import { BOARD_GAMES_EN } from '../src/en/party/content/boards.js'
import { HUNTS_EN } from '../src/en/party/content/hunts.js'
import { HUB_KEYS, GRADE_KEYS, CARD_SLUGS, HUNT_SLUGS, DICE_SLUGS, BOARD_SLUGS, fitsAge } from '../src/en/party/paths.js'
import { games as LOCAL_GAMES } from '../src/data/games.js'
import { CARD_GAMES } from '../src/data/cardGames.js'
import { DICE_GAMES } from '../src/data/diceGames.js'
import { HUNT_PAGES } from '../src/data/content/hunts.js'

const read = p => readFileSync(new URL(p, import.meta.url), 'utf8')
const HEBREW = /[֐-׿]/
const PARTS = { 1: PARTY_1, 2: PARTY_2, 3: PARTY_3, 4: PARTY_4 }
const counterparts = new Set(PARTY_PAGES.map(p => p.counterpart))
const covered = he => counterparts.has(he) || he in PARTY_SKIPPED

test('every Hebrew game page of the area has an English page or a reason in PARTY_SKIPPED', () => {
  const json = JSON.parse(read('../public/data/games.json')).filter(g => g.status === 'active')
  const missing = []
  for (const g of [...json, ...LOCAL_GAMES]) if (!covered(`/games/${g.slug}`)) missing.push(`/games/${g.slug}`)
  // Hubs: /games/<category or grade>, /games/age/<n> and the fixed /games/... routes in App.jsx
  const app = read('../src/App.jsx')
  for (const [, path] of app.matchAll(/path="(\/(?:games|card-games|board-games|dice-games|treasure-hunt)(?:\/[a-z0-9-]+)*)"/g)) if (!covered(path)) missing.push(path)
  for (const key of [...read('../src/data/gameCategories.js').matchAll(/^\s+'([a-z0-9-]+)': \{ title/gm)].map(m => m[1])) if (!covered(`/games/${key}`)) missing.push(`/games/${key}`)
  for (const age of [...read('../src/data/gameHubs.js').matchAll(/^\s{2}(\d+): \{$/gm)].map(m => m[1])) if (!covered(`/games/age/${age}`)) missing.push(`/games/age/${age}`)
  for (const g of CARD_GAMES) if (!covered(`/card-games/${g.slug}`)) missing.push(`/card-games/${g.slug}`)
  for (const g of DICE_GAMES) if (!covered(`/dice-games/${g.slug}`)) missing.push(`/dice-games/${g.slug}`)
  for (const [, slug] of read('../src/boardgames/registry.js').matchAll(/^\s{4}slug: '([a-z0-9-]+)'/gm)) if (!covered(`/board-games/${slug}`)) missing.push(`/board-games/${slug}`)
  for (const h of HUNT_PAGES) if (!covered(`/treasure-hunt/${h.slug}`)) missing.push(`/treasure-hunt/${h.slug}`)
  assert.deepEqual([...new Set(missing)], [])
  for (const he of Object.keys(PARTY_SKIPPED)) assert.ok(!counterparts.has(he), `${he} is both paired and skipped`)
})

test('paths, titles and counterparts are unique; metadata is English and sized for search', () => {
  const unique = key => assert.equal(new Set(PARTY_PAGES.map(p => p[key])).size, PARTY_PAGES.length, key)
  unique('path'); unique('title')
  const paired = PARTY_PAGES.filter(p => p.counterpart)
  assert.equal(new Set(paired.map(p => p.counterpart)).size, paired.length, 'counterpart')
  for (const p of PARTY_PAGES) assert.ok(p.counterpart || p.unpairedReason, p.path)
  for (const p of PARTY_PAGES) {
    assert.match(p.path, /^\/en\/(party-games|card-games|board-games|dice-games|treasure-hunt)(\/|$)/, p.path)
    assert.ok(!p.path.startsWith('/en/games'), p.path)
    assert.ok(p.title && p.title.length <= 70, `${p.path}: title`)
    assert.ok(p.description && p.description.length >= 100 && p.description.length <= 165, `${p.path}: description ${p.description?.length}`)
    assert.ok(p.emoji, p.path)
    assert.doesNotMatch(p.title + p.description, HEBREW, p.path)
  }
})

test('every game has its English text and the text has no Hebrew', () => {
  for (const g of PARTY_GAMES) {
    const t = PARTS[g.part]?.[g.slug]
    assert.ok(t, g.slug)
    assert.ok(t.intro && t.setup && t.steps.length >= 3, g.slug)
    if (t.cards) assert.ok(t.cards.items.length >= (t.cards.layout === 'bingo' ? 16 : 8), `${g.slug}: cards`)
  }
  for (const n of [1, 2, 3, 4]) assert.equal(Object.keys(PARTS[n]).length, PARTY_GAMES.filter(g => g.part === n).length, `part ${n}`)
  for (const f of ['party1', 'party2', 'party3', 'party4', 'hubs', 'cards', 'dice', 'boards', 'hunts', 'shabbat', '../games', '../paths']) {
    assert.doesNotMatch(read(`../src/en/party/content/${f}.js`), HEBREW, f)
  }
})

test('hubs list real games and the section slug lists match their content', () => {
  for (const k of [...Object.keys(HUB_KEYS), ...Object.keys(GRADE_KEYS)]) {
    assert.ok(PARTY_HUBS[k], k)
    assert.ok(PARTY_GAMES.some(g => g.hubs.includes(k)), `${k} has no games`)
    for (const [slug] of PARTY_HUBS[k].picks || []) assert.ok(PARTY_GAMES.find(g => g.slug === slug)?.hubs.includes(k), `${k}: ${slug}`)
  }
  for (const [age, h] of Object.entries(PARTY_AGES)) for (const [slug] of h.picks || []) assert.ok(fitsAge(PARTY_GAMES.find(g => g.slug === slug), Number(age)), `age ${age}: ${slug}`)
  for (const g of PARTY_GAMES) for (const k of g.hubs) assert.ok(HUB_KEYS[k] || GRADE_KEYS[k], `${g.slug}: ${k}`)
  assert.deepEqual(CARD_GAMES_EN.map(g => [g.slug, g.he]), CARD_SLUGS)
  assert.deepEqual(HUNTS_EN.map(g => [g.slug, g.he]), HUNT_SLUGS)
  assert.deepEqual(DICE_GAMES_EN.map(g => g.slug), DICE_SLUGS)
  assert.deepEqual(BOARD_GAMES_EN.map(g => g.slug), BOARD_SLUGS)
  for (const h of HUNTS_EN) assert.equal(h.clues.length, HUNT_PAGES.find(x => x.slug === h.he).clues.length, h.slug)
})

test('every catalog page is routed', async () => {
  const { PARTY_ROUTES } = await import('../src/en/party/routes.js')
  assert.deepEqual(PARTY_ROUTES.map(r => r.path).sort(), PARTY_PAGES.map(p => p.path).sort())
})
