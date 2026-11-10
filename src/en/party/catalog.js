// English pages of this area (party, card, board and dice games, treasure hunts): pure data
// (path, title, counterpart, emoji, description). Read by englishRoutes.js, the sitemap scripts and tests;
// the pages themselves read their text straight from content/*.js.
import { PARTY_GAMES } from './games.js'
import { PARTY_1 } from './content/party1.js'
import { PARTY_2 } from './content/party2.js'
import { PARTY_3 } from './content/party3.js'
import { PARTY_4 } from './content/party4.js'
import { PARTY_ROOT, PARTY_HUBS, PARTY_AGES } from './content/hubs.js'
import { CARD_HUB, CARD_GAMES_EN } from './content/cards.js'
import { DICE_HUB, DICE_GAMES_EN } from './content/dice.js'
import { BOARD_HUB, BOARD_GAMES_EN } from './content/boards.js'
import { HUNT_HUB, HUNTS_EN } from './content/hunts.js'
import { SHABBAT_EN } from './content/shabbat.js'
import { PARTY_ROOT_PATH, HUB_KEYS, GRADE_KEYS, AGES, SHABBAT_PATH, partyGamePath, partyHubPath, partyAgePath } from './paths.js'

const TEXT = { ...PARTY_1, ...PARTY_2, ...PARTY_3, ...PARTY_4 }
// Hebrew games that now 301 to a tool page (public/_redirects): pair with where Hebrew visitors land.
const MOVED = { 'buga-bingo': '/tools/bingo-maker', 'eretz-ir-buga': '/tools/eretz-ir', 'buga-trivia': '/tools/trivia-quiz', 'emet-o-buga': '/tools/truth-or-buga' }
const page = (path, t, emoji, counterpart) => counterpart ? ({ path, title: t.title, emoji, counterpart, description: t.description }) : ({ path, title: t.title, emoji, unpairedReason: 'Its Hebrew game now redirects to a tool page, which pairs with the English tool.', description: t.description })

export const PARTY_PAGES = [
  page(PARTY_ROOT_PATH, PARTY_ROOT, '🎉', '/games'),
  ...Object.entries({ ...HUB_KEYS, ...GRADE_KEYS }).map(([k, [he]]) => page(partyHubPath(k), PARTY_HUBS[k], '🎉', `/games/${he}`)),
  ...AGES.map(a => page(partyAgePath(a), PARTY_AGES[a], '🎂', `/games/age/${a}`)),
  page(SHABBAT_PATH, SHABBAT_EN, '🕯️', '/games/shabbat'),
  ...PARTY_GAMES.map(g => page(partyGamePath(g.slug), TEXT[g.slug], g.emoji, MOVED[g.he] ? null : `/games/${g.he}`)),
  page('/en/card-games', CARD_HUB, '🃏', '/card-games'),
  ...CARD_GAMES_EN.map(g => page(`/en/card-games/${g.slug}`, g, g.emoji, `/card-games/${g.he}`)),
  page('/en/dice-games', DICE_HUB, '🎲', '/dice-games'),
  ...DICE_GAMES_EN.map(g => page(`/en/dice-games/${g.slug}`, g, g.emoji, `/dice-games/${g.he}`)),
  page('/en/board-games', BOARD_HUB, '♟️', '/board-games'),
  ...BOARD_GAMES_EN.map(g => page(`/en/board-games/${g.slug}`, g, g.emoji, `/board-games/${g.he}`)),
  page('/en/treasure-hunt', HUNT_HUB, '🗺️', '/treasure-hunt/ready'),
  ...HUNTS_EN.map(h => page(`/en/treasure-hunt/${h.slug}`, h, h.emoji, `/treasure-hunt/${h.he}`)),
]

// Hebrew pages of this area with no English page of their own, and why.
export const PARTY_SKIPPED = {
  ...Object.fromEntries(Object.entries(MOVED).map(([he, tool]) => [`/games/${he}`, `Redirects to ${tool}, which pairs with its English tool page; the English game page stands alone.`])),
  '/games/all': 'Redirect to /games.',
  '/games/bingo': 'Alias of /games/buga-bingo (paired with /en/party-games/people-bingo).',
  '/games/truth-or-buga': 'Alias of /games/emet-o-buga (paired with /en/party-games/fact-or-fib).',
  '/games/buga-town': 'An interactive Hebrew property-and-questions board game app; its question bank and UI are Hebrew-only.',
  '/games/riddles': 'A Hebrew riddle collection: belongs to the riddles area, not the party games.',
  '/games/escape-room': 'Interactive escape-room tool with Hebrew puzzles (tools area).',
  '/games/escape-rooms': 'Alias of /games/escape-room.',
  '/board-games/checkers': 'Already paired with /en/checkers.',
  '/board-games/backgammon': 'Already paired with /en/backgammon.',
  '/board-games/snakes-and-ladders/multiplication': 'A Hebrew printable math board (grades 3–4 times-table practice); the English area has the plain board game.',
  '/treasure-hunt': 'The treasure-hunt maker tool (Hebrew clue generator), not a ready-made hunt.',
  '/treasure-hunt/qr': 'QR treasure-hunt tool (tools area).',
  '/treasure-hunt/qr/play': 'Player screen of the QR treasure-hunt tool.',
}
