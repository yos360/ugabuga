// English chess, checkers and backgammon pages (pure data, read by the English hub, the sitemap and tests).
import { BOARD_EN } from './boards/boardData.js'

export const BOARD_PAGES = Object.values(BOARD_EN).map(b => ({
  path: b.path, title: b.title, description: b.description, emoji: b.emoji, counterpart: b.counterpart,
  hub: { name: b.name, tagline: b.tagline, ages: b.ages, color: b.color },
}))
