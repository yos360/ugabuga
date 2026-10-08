import { generateMaze } from '../../motor/generators/maze.js'
import { THEMES } from '../../motor/themes.js'

// 30 ready mazes (5 levels × 6 themes) from fixed seeds: the same maze prints every time and the page is indexable.
export const MAZE_LEVELS = [
  { id: 'gan', label: 'קל מאוד', age: 'גן (4–5)', motor: 1, stars: '⭐' },
  { id: 'a', label: 'קל', age: 'כיתה א׳', motor: 2, stars: '⭐⭐' },
  { id: 'b', label: 'בינוני', age: 'כיתות ב׳–ג׳', motor: 3, stars: '⭐⭐⭐' },
  { id: 'c', label: 'קשה', age: 'כיתות ד׳–ו׳', motor: 5, stars: '⭐⭐⭐⭐' },
  { id: 'd', label: 'קשה מאוד', age: 'נוער ומבוגרים', motor: 6, stars: '⭐⭐⭐⭐⭐' },
]
export const MAZE_THEMES = THEMES.filter(t => t.id !== 'shapes')
export const readyMaze = (li, ti) => generateMaze({ level: MAZE_LEVELS[li].motor, seed: 7001 + li * 100 + ti * 13, theme: MAZE_THEMES[ti] })
export const freshMaze = (li, seed) => generateMaze({ level: MAZE_LEVELS[li].motor, seed, theme: MAZE_THEMES[seed % MAZE_THEMES.length] })
