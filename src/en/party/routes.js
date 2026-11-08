// { path, Component: lazy(() => import('./Page')), props? } for each English page of this area,
// rendered by src/en/EnglishExtra.jsx (the component receives the route params as "params").
// Every path is listed explicitly, so a mistyped slug falls through to the English 404.
import { lazy } from 'react'
import { PARTY_GAMES } from './games.js'
import { PARTY_ROOT_PATH, HUB_KEYS, GRADE_KEYS, AGES, SHABBAT_PATH, CARD_SLUGS, HUNT_SLUGS, DICE_SLUGS, BOARD_SLUGS, partyGamePath, partyHubPath, partyAgePath } from './paths.js'

const named = (load, name) => lazy(() => load().then(m => ({ default: m[name] })))
const hubs = () => import('./PartyHubs')
const PartyHome = named(hubs, 'PartyHome'), PartyHub = named(hubs, 'PartyHub'), PartyAge = named(hubs, 'PartyAge')
const GAME = { 1: lazy(() => import('./game1')), 2: lazy(() => import('./game2')), 3: lazy(() => import('./game3')), 4: lazy(() => import('./game4')) }
const cards = () => import('./CardGames'), dice = () => import('./DiceGames'), boards = () => import('./BoardGames'), hunts = () => import('./TreasureHunts')
const CardHub = named(cards, 'CardGamesHub'), CardPage = named(cards, 'CardGamePage')
const DiceHub = named(dice, 'DiceGamesHub'), DicePage = named(dice, 'DiceGamePage')
const BoardHub = named(boards, 'BoardGamesHub'), BoardPage = named(boards, 'BoardGamePage')
const HuntHub = named(hunts, 'TreasureHuntsHub'), HuntPage = named(hunts, 'TreasureHuntPage')

export const PARTY_ROUTES = [
  { path: PARTY_ROOT_PATH, Component: PartyHome },
  ...[...Object.keys(HUB_KEYS), ...Object.keys(GRADE_KEYS)].map(hub => ({ path: partyHubPath(hub), Component: PartyHub, props: { hub } })),
  ...AGES.map(age => ({ path: partyAgePath(age), Component: PartyAge, props: { age } })),
  { path: SHABBAT_PATH, Component: lazy(() => import('./ShabbatGames')) },
  ...PARTY_GAMES.map(g => ({ path: partyGamePath(g.slug), Component: GAME[g.part], props: { slug: g.slug } })),
  { path: '/en/card-games', Component: CardHub },
  ...CARD_SLUGS.map(([slug]) => ({ path: `/en/card-games/${slug}`, Component: CardPage, props: { slug } })),
  { path: '/en/dice-games', Component: DiceHub },
  ...DICE_SLUGS.map(slug => ({ path: `/en/dice-games/${slug}`, Component: DicePage, props: { slug } })),
  { path: '/en/board-games', Component: BoardHub },
  ...BOARD_SLUGS.map(slug => ({ path: `/en/board-games/${slug}`, Component: BoardPage, props: { slug } })),
  { path: '/en/treasure-hunt', Component: HuntHub },
  ...HUNT_SLUGS.map(([slug]) => ({ path: `/en/treasure-hunt/${slug}`, Component: HuntPage, props: { slug } })),
]
