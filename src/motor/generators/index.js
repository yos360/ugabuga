import { generateMaze } from './maze'
import { generateTracing } from './tracing'
import { generatePattern } from './pattern'
import { levelOf } from '../rng'
import { themeOf } from '../themes'

// Registry: every generator takes {age, difficulty, theme, seed, options} and returns ActivityData,
// which a separate renderer turns into SVG (for print) or an on-screen activity.
export const GENERATORS = [
  { id: 'maze', label: 'מבוכים', emoji: '🌀', desc: 'מבוך חדש בכל לחיצה', generate: generateMaze },
  { id: 'tracing', label: 'עקיבה אחרי קווים', emoji: '〰️', desc: 'גלים, זיגזג, לולאות ועוד', generate: generateTracing },
  { id: 'pattern', label: 'המשך הדפוס', emoji: '🔁', desc: 'מה מגיע אחר כך?', generate: generatePattern },
]
export const generatorOf = id => GENERATORS.find(g => g.id === id) || GENERATORS[0]

export function createActivity({ type, age, difficulty, theme, seed, options = {} }) {
  const level = levelOf(age, difficulty)
  const data = generatorOf(type).generate({ level, seed, theme: themeOf(theme), options })
  return { ...data, type, age, difficulty, theme, seed, level }
}
