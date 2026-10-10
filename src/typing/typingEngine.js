// Touch-typing engine: key resolution, lesson text generation, speed/accuracy math.
// No React here so the logic is unit-tested in tests/typing.test.mjs.
import { LAYOUTS } from './typingData.js'

export const FINALS = new Set(['ך', 'ם', 'ן', 'ף', 'ץ'])

export function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)]
export function shuffled(arr, rng = Math.random) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}

// Characters a lesson may use: everything introduced up to and including it, plus space.
// Word/sentence lessons may only appear after every letter they use was introduced.
export function allowedChars(lessons, index) {
  const set = new Set([' '])
  for (let i = 0; i <= index && i < lessons.length; i++) for (const k of lessons[i].keys) set.add(k)
  return set
}

// Which character did the learner mean? Layout-independent:
// 1. a letter of the track's own script (OS keyboard already set right) → take it as is;
// 2. otherwise read the PHYSICAL key (event.code) through the track's layout, so a child
//    whose computer is set to English still learns the Hebrew positions (and vice versa);
// 3. anything else (digits on any layout, mobile input) → event.key.
export function resolveTyped(e, layout) {
  const key = e.key
  if (typeof key === 'string' && key.length === 1 && layout.letterRe.test(key)) return key
  const k = e.code && layout.byCode[e.code]
  if (k) {
    if (e.shiftKey) return k.shift ?? (key && key.length === 1 ? key : null)
    return k.base
  }
  if (e.code === 'Space') return ' '
  return typeof key === 'string' && key.length === 1 ? key : null
}

// A drill "group" from the given letters, Hebrew final letters only in last position.
function group(pool, len, rng) {
  const nonFinal = pool.filter(c => !FINALS.has(c))
  const out = []
  for (let i = 0; i < len; i++) {
    const last = i === len - 1
    const from = last || nonFinal.length === 0 ? pool : nonFinal
    out.push(pick(from, rng))
    if (FINALS.has(out[out.length - 1])) break
  }
  return out.join('')
}

const lettersOf = (set, layout) => [...set].filter(c => layout.letterRe.test(c))

// One practice line for a lesson (~50–90 characters).
export function lessonText(lessons, index, words, layout, rng = Math.random) {
  const lesson = lessons[index]
  if (lesson.kind === 'words') return shuffled(lesson.words.split(' '), rng).slice(0, 12).join(' ')
  if (lesson.kind === 'lines') return shuffled(lesson.lines, rng).slice(0, 2).join(' ')
  const allowed = allowedChars(lessons, index)
  const known = lettersOf(allowed, layout)
  const fresh = lesson.keys.filter(k => layout.letterRe.test(k))
  const fits = w => [...w].every(c => allowed.has(c))
  const pool = words.filter(fits)
  const withNew = fresh.length ? pool.filter(w => fresh.some(k => w.includes(k))) : pool
  const items = []
  if (fresh.length) {
    const nonFinalKnown = known.filter(c => !FINALS.has(c))
    for (const k of fresh) items.push(FINALS.has(k) ? pick(nonFinalKnown, rng) + k : k + k)
    for (let i = 0; i < 3; i++) items.push(group(fresh, 2 + Math.floor(rng() * 2), rng))
    for (let i = 0; i < 3; i++) items.push(group([...fresh, ...known], 3 + Math.floor(rng() * 2), rng))
  }
  const wordCount = fresh.length ? 5 : 11
  const chosen = shuffled(withNew.length >= 3 ? withNew : pool, rng).slice(0, wordCount)
  items.push(...chosen)
  while (items.length < 9) items.push(group(fresh.length ? [...fresh, ...known] : known, 3, rng))
  return (fresh.length ? items : shuffled(items, rng)).join(' ')
}

// Net words per minute: every 5 correctly typed characters (spaces included) count as one word.
export function wpm(correctChars, ms) {
  if (!ms || ms <= 0) return 0
  return Math.round((correctChars / 5) / (ms / 60000))
}
// Accuracy: share of keystrokes that were right on the first go.
export function accuracy(correctKeys, totalKeys) {
  if (!totalKeys) return 100
  return Math.round((correctKeys / totalKeys) * 100)
}
export function starsFor(speed, acc, target) {
  if (acc >= 96 && speed >= target) return 3
  if (acc >= 90) return 2
  return 1
}
export function speedLabel(speed) {
  if (speed >= 60) return 'מקלדן מקצוען'
  if (speed >= 40) return 'מהיר מאוד'
  if (speed >= 25) return 'קצב טוב'
  if (speed >= 12) return 'בדרך הנכונה'
  return 'מתחילים'
}

// Every character of a text can be typed on the layout.
export const typeable = (text, layout = LAYOUTS.he) => [...text].every(c => c in layout.byChar)
