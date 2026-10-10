// Pure quiz logic for /flags/quiz (tested in tests/flags.test.mjs).
import { WORLD_COUNTRIES, FAMOUS_FLAGS, COUNTRY_BY_CODE } from './flagsData.js'

export const LEVELS = [
  { id: 'easy', name: 'קל', desc: 'דגלים מוכרים, תשובות שונות מאוד זו מזו' },
  { id: 'medium', name: 'בינוני', desc: 'כל הדגלים, תשובות מכל העולם' },
  { id: 'hard', name: 'קשה', desc: 'התשובות מאותה יבשת — דגלים דומים!' },
]

export function shuffle(list, rnd = Math.random) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

// The countries a round asks about.
export function questionPool(level, continent = 'all') {
  const inCont = continent === 'all' ? WORLD_COUNTRIES : WORLD_COUNTRIES.filter(c => c.continent === continent)
  if (level !== 'easy') return inCont
  const famous = inCont.filter(c => FAMOUS_FLAGS.includes(c.code))
  // continents with only a few famous flags: top up with the rest of the continent
  return famous.length >= 10 ? famous : [...famous, ...inCont.filter(c => !FAMOUS_FLAGS.includes(c.code))].slice(0, 10)
}

// Four unique choices (country codes) that include the answer.
export function makeChoices(answerCode, level, rnd = Math.random) {
  const answer = COUNTRY_BY_CODE[answerCode]
  let pool
  if (level === 'hard') {
    pool = WORLD_COUNTRIES.filter(c => c.continent === answer.continent && c.code !== answerCode)
    if (pool.length < 3) pool = WORLD_COUNTRIES.filter(c => c.code !== answerCode)
  } else if (level === 'easy') {
    pool = WORLD_COUNTRIES.filter(c => c.continent !== answer.continent && FAMOUS_FLAGS.includes(c.code))
  } else {
    pool = WORLD_COUNTRIES.filter(c => c.code !== answerCode)
  }
  const wrong = shuffle(pool, rnd).slice(0, 3).map(c => c.code)
  return shuffle([answerCode, ...wrong], rnd)
}

export function buildRound({ level = 'medium', continent = 'all', count = 10, rnd = Math.random } = {}) {
  const pool = questionPool(level, continent)
  return shuffle(pool, rnd).slice(0, Math.min(count, pool.length)).map(c => ({ answer: c.code, choices: makeChoices(c.code, level, rnd) }))
}

// WhatsApp share text for a finished round.
export function resultText({ score, total, bestStreak, levelName, continentName }) {
  const stars = score === total ? '🏆' : score >= total * 0.7 ? '🌟' : '🏳️'
  return `${stars} זיהיתי ${score} מתוך ${total} דגלים בחידון הדגלים של עוגה בוגה (${levelName}${continentName ? ` · ${continentName}` : ''}). רצף הכי ארוך: ${bestStreak}.\nמי מזהה יותר? 👇`
}
