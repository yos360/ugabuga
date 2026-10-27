import { HEBREW } from './letterLearning.js'
import { NIKUD_WORDS } from './letterSkills.js'

// "איפה שומעים את הצליל?" (/printables/sound-position): a letter, a picture, and three boxes — at the
// start, in the middle or at the end of the word. Built from the site's pointed picture words; each word is
// split into the consonant sounds a child actually hears, so a card never asks about a silent letter.
// Rules:
// - א, ע and ה are never asked about (in spoken Hebrew they're silent or just carry the vowel).
// - וֹ / וּ are vowels, and a bare י after an i/e vowel (בֵּיצָה, סְנָאִי) is silent.
// - A word is used for a letter only if that sound appears once in it — no other letter that sounds the
//   same (ט/ת, כּ/ק, ח/כ, ס/שׂ, ב/ו), and the letter itself written only once (not כּוֹכָב) — so the answer is
//   never in doubt.
// - Position goes by where the letter is written: the first letter is the start, the last letter is the end
//   (only when it ends the word with no vowel after it, as in דָּג or יָרֵחַ), and anything between is the middle.
const FINAL = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' }
const DAGESH = 'ּ', SHIN = 'ׁ', SIN = 'ׂ', HIRIQ = 'ִ', TSERE = 'ֵ', SEGOL = 'ֶ', HOLAM = 'ֹ', PATACH = 'ַ', SHVA = 'ְ'
const isLetter = ch => /[א-ת]/.test(ch)
const isMark = ch => /[֑-ׇ]/.test(ch)
const VOWELS = /[ְ-ֻ]/

function soundKey(base, marks) {
  const has = m => marks.includes(m)
  if ('אעה'.includes(base)) return null
  if (base === 'ב') return has(DAGESH) ? 'b' : 'v'
  if (base === 'ו') return 'v'
  if (base === 'כ') return has(DAGESH) ? 'k' : 'kh'
  if (base === 'ק') return 'k'
  if (base === 'ח') return 'kh'
  if (base === 'פ') return has(DAGESH) ? 'p' : 'f'
  if (base === 'ט' || base === 'ת') return 't'
  if (base === 'ס') return 's'
  if (base === 'ש') return has(SIN) ? 's' : 'sh'
  return base
}

// The letters of a pointed word, each with its sound (null when silent) and where it's written.
export function soundUnits(word) {
  const chars = [...word.normalize('NFC')], letters = []
  for (let i = 0; i < chars.length; i++) {
    if (!isLetter(chars[i])) continue
    const marks = []
    while (i + 1 < chars.length && isMark(chars[i + 1])) marks.push(chars[++i])
    letters.push({ ch: chars[i - marks.length], marks })
  }
  return letters.map(({ ch, marks }, i) => {
    const base = FINAL[ch] || ch, prev = letters[i - 1]
    let key = soundKey(base, marks)
    if (base === 'ו' && marks.length === 1 && (marks[0] === HOLAM || marks[0] === DAGESH)) key = null // וֹ / וּ
    if (base === 'י' && !marks.length && prev && prev.marks.some(m => m === HIRIQ || m === TSERE || m === SEGOL)) key = null
    const last = i === letters.length - 1
    // the last letter "ends" the word only when no vowel follows it (patach under a final ח/ע is said before it)
    const closed = !marks.some(m => VOWELS.test(m) && m !== SHVA && !(m === PATACH && 'חע'.includes(base)))
    const pos = i === 0 ? 'start' : last ? (closed ? 'end' : null) : 'middle'
    const show = base + ('בכפ'.includes(base) && marks.includes(DAGESH) ? DAGESH : '') + (base === 'ש' ? (marks.includes(SIN) ? SIN : SHIN) : '')
    return { letter: base, show, key, pos }
  })
}

export const POSITIONS = [
  { id: 'start', label: 'בהתחלה' },
  { id: 'middle', label: 'באמצע' },
  { id: 'end', label: 'בסוף' },
]

// Every picture word the site has, pointed (one entry per emoji). Left out: pictures a child would name
// differently (🛝 is "מגלשה" before it's "גן", 🎉 "מסיבה", 🌴 "דקל").
const UNCLEAR = new Set(['🛝', '🎉', '🌴'])
export const SOUND_WORDS = (() => {
  const seen = new Set(UNCLEAR), out = []
  for (const [word, emoji] of [...HEBREW.flatMap(x => x.words.map(w => [w[2], w[1]])), ...NIKUD_WORDS]) {
    if (seen.has(emoji)) continue
    seen.add(emoji); out.push({ word: word.normalize('NFC'), emoji })
  }
  return out
})()

// Every (word, letter, position) question with a single clear answer.
export const SOUND_QUESTIONS = SOUND_WORDS.flatMap(w => {
  const units = soundUnits(w.word)
  return units.filter(u => u.key && u.pos && units.filter(v => v.key === u.key).length === 1 && units.filter(v => v.letter === u.letter).length === 1)
    .map(u => ({ ...w, letter: u.letter, show: u.show, pos: u.pos }))
})

export const SOUND_LETTERS = [...new Set(SOUND_QUESTIONS.map(q => q.letter))].sort((a, b) => a.localeCompare(b, 'he'))

// A page of `count` questions: positions spread evenly, each word at most once, as many different letters as possible.
// `rng` is a makeRng instance; `letters` limits the target letters; `positions` the answers asked about.
export function pickSoundQuestions(rng, { count = 12, letters = SOUND_LETTERS, positions = ['start', 'middle', 'end'], used = new Set() } = {}) {
  const pool = rng.shuffle(SOUND_QUESTIONS.filter(q => letters.includes(q.letter) && positions.includes(q.pos) && !used.has(q.emoji)))
  const plan = rng.shuffle(Array.from({ length: count }, (_, i) => positions[i % positions.length]))
  const out = [], words = new Set(), seen = new Set()
  const take = (pos, fresh) => { const q = pool.find(x => (!pos || x.pos === pos) && !words.has(x.emoji) && !(fresh && seen.has(x.letter))); if (q) { out.push(q); words.add(q.emoji); seen.add(q.letter) } return q }
  for (const pos of plan) if (!take(pos, true) && !take(pos, false)) take(null, false)
  return out
}
