// "5 אותיות" — the five-letter word-guessing mode of /online-games/word-guess.
// Six tries to find a five-letter Hebrew word; each guess colours its letters:
// hit = right letter in the right place, near = in the word but elsewhere, miss = not in the word.
// Final letters count as their regular letter (ם = מ), and the last letter is shown in final form.

import { WORD_TOPICS } from './fiveWordsData.js'

export const WORD_LEN = 5
export const MAX_TRIES = 6
const FINAL = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' }
const TO_FINAL = { 'כ': 'ך', 'מ': 'ם', 'נ': 'ן', 'פ': 'ף', 'צ': 'ץ' }
export const norm = ch => FINAL[ch] || ch
export const BASE_LETTERS = 'אבגדהוזחטיכלמנסעפצקרשת'
export const isBase = ch => BASE_LETTERS.includes(norm(ch))
export const normWord = w => [...w].map(norm).join('')
// Show the letter at `i` as it is written: final form at the end of the word.
export const shown = (ch, i) => (i === WORD_LEN - 1 && TO_FINAL[ch]) || ch

// ~1,000 answer words grouped by topic (fiveWordsData.js). The topic doubles as the first hint.
export const TOPICS = Object.keys(WORD_TOPICS)
const TOPIC_OF = {}
for (const t of TOPICS) for (const w of WORD_TOPICS[t].split(' ')) TOPIC_OF[w] = t
export const FIVE_WORDS = Object.keys(TOPIC_OF)
export const topicOf = word => TOPIC_OF[word] || ''
export const wordsIn = topic => topic && WORD_TOPICS[topic] ? WORD_TOPICS[topic].split(' ') : FIVE_WORDS

// Same order for everyone: a fixed shuffle of the list, one word per Israeli calendar day.
function shuffled(list, seed) {
  const a = [...list]
  let s = seed >>> 0
  const rnd = () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}
const DAILY_ORDER = shuffled(FIVE_WORDS, 20261014)
export const dailyWord = day => DAILY_ORDER[((day % DAILY_ORDER.length) + DAILY_ORDER.length) % DAILY_ORDER.length]
// A random word from `pool` that is not in `avoid` (a Set of words already played); when every word
// of the pool was played, any word but the last one.
export const randomWord = (rand = Math.random, avoid, pool = FIVE_WORDS) => {
  const seen = avoid instanceof Set ? avoid : new Set(avoid ? [avoid] : [])
  const fresh = pool.filter(w => !seen.has(w))
  const from = fresh.length ? fresh : pool
  return from[Math.floor(rand() * from.length)]
}

// Words accepted as guesses (~40,000 five-letter forms, incl. prefixes like ה/ו/ש/ל/ב). Stored without
// final forms, one letter per ASCII char, no separators: public/data/words5-he.txt. Built from the
// answer list plus the five-letter words of the FrequencyWords Hebrew list (Hermit Dave, CC BY-SA 4.0,
// github.com/hermitdave/FrequencyWords) that appear at least 20 times. Loaded only when the game opens.
const CODE = 'abcdefghijklmnopqrstuv'
let dict = null, dictPromise = null
export function parseDictionary(text) {
  const out = new Set()
  for (let i = 0; i + WORD_LEN <= text.length; i += WORD_LEN) out.add([...text.slice(i, i + WORD_LEN)].map(c => BASE_LETTERS[CODE.indexOf(c)]).join(''))
  return out
}
export function loadDictionary() {
  if (!dictPromise) dictPromise = fetch('/data/words5-he.txt').then(r => r.ok ? r.text() : '').then(t => { dict = t ? parseDictionary(t) : null; return dict }).catch(() => null)
  return dictPromise
}
// true / false once the list is loaded; true while it is loading or if it failed (never block a guess).
export const isKnownWord = word => !dict || dict.has(normWord(word))

// Colour a guess against the answer (both compared without final forms). Repeated letters are
// handled like the classic game: exact hits first, then each remaining answer letter can mark one "near".
export function scoreGuess(guess, answer) {
  const g = [...normWord(guess)], a = [...normWord(answer)]
  const res = Array(WORD_LEN).fill('miss')
  const left = {}
  for (let i = 0; i < WORD_LEN; i++) { if (g[i] === a[i]) res[i] = 'hit'; else left[a[i]] = (left[a[i]] || 0) + 1 }
  for (let i = 0; i < WORD_LEN; i++) if (res[i] !== 'hit' && left[g[i]] > 0) { res[i] = 'near'; left[g[i]]-- }
  return res
}
const RANK = { miss: 1, near: 2, hit: 3 }
// Best state of every letter used so far, for colouring the keyboard.
export function keyStates(rows, answer) {
  const out = {}
  for (const row of rows) scoreGuess(row, answer).forEach((st, i) => { const l = norm([...row][i]); if (!out[l] || RANK[st] > RANK[out[l]]) out[l] = st })
  return out
}
export const shareGrid = (rows, answer) => rows.map(r => scoreGuess(r, answer).map(s => s === 'hit' ? '🟩' : s === 'near' ? '🟨' : '⬜').join('')).join('\n')
