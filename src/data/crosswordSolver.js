// Crossword helper: "I know the length and some letters — what fits?". Pure functions, no data imports,
// so the matcher is testable on its own. Final letters (ך ם ן ף ץ) count as their regular forms.
const FINAL = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' }
const HEB = /[א-ת]/
export const norm = s => [...String(s || '')].map(c => FINAL[c] || c).join('')
// Hebrew letters only (drops spaces, hyphens, geresh, quotes) so "בית-ספר" and "ד״ר" measure by their letters.
export const lettersOf = s => [...String(s || '')].filter(c => HEB.test(c)).join('')

// pattern: array of one-character strings ('' or any non-letter = unknown) or a string such as "ש_ל_ם".
export function toSlots(pattern) {
  const arr = typeof pattern === 'string' ? [...pattern] : [...pattern]
  return arr.map(c => (c && HEB.test(c) ? norm(c) : ''))
}

export function matchesPattern(word, slots) {
  const w = [...norm(lettersOf(word))]
  if (w.length !== slots.length) return false
  return slots.every((s, i) => !s || s === w[i])
}

// entries: [word, clue][]. Returns unique words (by letters), best first: clue hit, then alphabetical.
export function solve(entries, slots, clueText = '') {
  if (!slots.length) return []
  const q = String(clueText || '').trim()
  const seen = new Map()
  for (const [word, clue = ''] of entries) {
    if (!matchesPattern(word, slots)) continue
    const key = norm(lettersOf(word))
    const hit = q ? String(clue).includes(q) : false
    const cur = seen.get(key)
    if (!cur) seen.set(key, { word: lettersOf(word), clues: clue ? [clue] : [], hit })
    else { if (clue && !cur.clues.includes(clue)) cur.clues.push(clue); cur.hit = cur.hit || hit }
  }
  const out = [...seen.values()]
  out.sort((a, b) => (b.hit - a.hit) || a.word.localeCompare(b.word, 'he'))
  return out
}
