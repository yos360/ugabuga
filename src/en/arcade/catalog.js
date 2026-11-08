// English pages of this area: pure data (path, title, counterpart or unpairedReason, emoji, description).
// Read by englishRoutes.js, the sitemap scripts and the English hubs.
import { ARCADE_EN } from './gamesEn.js'
import { BOARD_PAGES } from './boardPages.js'
import { SUDOKU_PAGES } from './sudokuPages.js'

const GAME_PAGES = Object.entries(ARCADE_EN).map(([slug, g]) => ({
  path: `/en/online-games/${slug}`, title: g.title, description: g.description, emoji: g.emoji, counterpart: `/online-games/${slug}`,
}))
export const ARCADE_PAGES = [
  { path: '/en/online-games', title: 'Free online games for kids - puzzles, cards and board games', description: 'Free online games for kids and families: puzzles, card games, chess, checkers and more. No download and no sign-up.', emoji: '🕹️', counterpart: '/online-games' },
  ...GAME_PAGES, ...BOARD_PAGES, ...SUDOKU_PAGES,
]
