// Runtime puzzle supply for the /sudoku pages: puzzleFor(level, seed) is deterministic —
// the same level + seed is the same puzzle on every device (shared links, prints, the daily).
import { BANK } from './bank.js'
import { countSolutions, fromString, generate, hashString, randomTransform, rng } from './engine.js'

export const LEVEL_META = {
  easy: { id: 'easy', n: 9, name: 'קל', long: 'סודוקו קל', stars: '★', path: '/sudoku/easy' },
  medium: { id: 'medium', n: 9, name: 'בינוני', long: 'סודוקו בינוני', stars: '★★', path: '/sudoku/medium' },
  hard: { id: 'hard', n: 9, name: 'קשה', long: 'סודוקו קשה', stars: '★★★', path: '/sudoku/hard' },
  'very-hard': { id: 'very-hard', n: 9, name: 'קשה מאוד', long: 'סודוקו קשה מאוד', stars: '★★★★', path: '/sudoku/very-hard' },
  kids4: { id: 'kids4', n: 4, name: 'ילדים 4×4', long: 'סודוקו לילדים 4×4', stars: '🐣', path: '/sudoku/kids' },
  kids6: { id: 'kids6', n: 6, name: 'ילדים 6×6', long: 'סודוקו לילדים 6×6', stars: '🐥', path: '/sudoku/kids' },
}
export const ADULT_LEVELS = ['easy', 'medium', 'hard', 'very-hard']
export const ALL_LEVELS = [...ADULT_LEVELS, 'kids4', 'kids6']

const solvedBase = new Map()
function baseSolution(s) {
  if (!solvedBase.has(s)) solvedBase.set(s, countSolutions(fromString(s), 9, 1).solution)
  return solvedBase.get(s)
}

export function puzzleFor(level, seed) {
  const meta = LEVEL_META[level] || LEVEL_META.easy
  const s = Math.abs(Math.floor(Number(seed) || 1))
  const rand = rng((hashString(meta.id) ^ Math.imul(s, 2654435761)) | 0)
  if (meta.n !== 9) {
    const g = generate(meta.id, rand)
    return { level: meta.id, n: g.n, seed: s, puzzle: g.puzzle, solution: g.solution }
  }
  const list = BANK[meta.id]
  const base = list[Math.floor(rand() * list.length)]
  const t = randomTransform(9, rand)
  return { level: meta.id, n: 9, seed: s, puzzle: t(fromString(base)), solution: t(baseSolution(base)) }
}

export const randomSeed = () => 100000 + Math.floor(Math.random() * 900000)

// Today's date in Israel, as YYYY-MM-DD — the daily puzzle changes at midnight Israel time.
export function israelDate(now = new Date()) {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
  } catch {
    return now.toISOString().slice(0, 10)
  }
}
export const dailySeed = dateKey => Number(String(dateKey).replace(/-/g, '')) // 2026-10-11 -> 20261011
export const dailyPuzzle = (level, dateKey) => puzzleFor(level, dailySeed(dateKey))

export function hebrewDate(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number)
  return `${d}.${m}.${y}`
}
