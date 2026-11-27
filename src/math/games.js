// Questions for the /math/games pages: the same generators as the practice pages, turned into
// four-option questions a child can answer with one tap. Pure ESM so tests can import it.
import { topicsFor, gradeInfo, makeExercise } from './registry.js'
import { createRng } from './rng.js'
import { mixSeed, nearNumbers } from './gen.js'

export const GAME_GRADES = [1, 2, 3, 4, 5, 6]
export const gamesPath = n => `/math/games/grade-${n}`

export function parseGamesGrade(slug) {
  const m = /^grade-([1-6])$/.exec(slug || '')
  return m ? Number(m[1]) : null
}

// Topics whose answers can be offered as buttons (fractions typed as "3/4" are left to the practice pages).
export function gameTopics(grade) {
  return topicsFor(grade).filter(t => {
    for (let s = 1; s <= 12; s++) {
      const ex = makeExercise(t, 1, s * 97)
      if (ex.type === 'number' || ex.type === 'choice') return true
    }
    return false
  })
}

const spreadFor = a => (Math.abs(a) < 20 ? [1, 2, 3] : Math.abs(a) < 200 ? [1, 2, 10] : Math.abs(a) < 5000 ? [1, 10, 100] : [10, 100, 1000])

function numberOptions(r, answer) {
  const a = Number(answer)
  const pool = nearNumbers(a, spreadFor(a)).filter(x => Number.isInteger(a) ? Number.isInteger(x) : true)
  for (let d = 4; pool.length < 6; d++) pool.push(a + d)
  const others = r.shuffle([...new Set(pool.map(String))].filter(x => x !== String(a))).slice(0, 3)
  return r.shuffle([String(a), ...others])
}

// One question: { q, expr, svg, options, answer, explain, topic }. `slugs` limits the topics.
export function makeGameQuestion(grade, { level = 1, seed = 1, slugs = null } = {}) {
  const all = gameTopics(grade)
  const topics = slugs?.length ? all.filter(t => slugs.includes(t.slug)) : all
  const pick = topics.length ? topics : all
  const r = createRng(mixSeed(seed))
  for (let i = 0; i < 40; i++) {
    const t = pick[Math.floor(r.next() * pick.length)]
    const ex = makeExercise(t, level, Math.floor(r.next() * 2 ** 31) + 1)
    if (ex.type === 'choice' && ex.choices?.length >= 2) {
      return { q: ex.q, expr: ex.expr || '', svg: ex.svg || '', options: ex.choices.map(String), answer: String(ex.answer), explain: ex.explain || '', topic: t.slug }
    }
    if (ex.type === 'number' && Number.isFinite(Number(ex.answer))) {
      return { q: ex.q, expr: ex.expr || '', svg: ex.svg || '', options: numberOptions(r, ex.answer), answer: String(Number(ex.answer)), explain: ex.explain || '', topic: t.slug }
    }
  }
  return null
}

export const gradeLabel = n => gradeInfo(n)?.label || ''
