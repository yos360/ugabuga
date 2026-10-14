export const TONES = ['', '🏻', '🏼', '🏽', '🏾', '🏿', 'all']
const modifiers = /[\u{1F3FB}-\u{1F3FF}]/gu
export const emojiBase = text => text.replace(modifiers, '').replaceAll('\uFE0F', '')
export const searchText = text => String(text).normalize('NFKD').replace(/[\u0591-\u05C7]/g, '').replace(/[׳״'"’]/g, '').toLowerCase().trim()
// Words people search for that CLDR doesn't use (search only — names stay as CLDR has them).
const SYNONYMS = { 'סמיילי': 'פרצוף', 'סמיילים': 'פרצוף', 'סמייל': 'פרצוף', 'סמיילי׳': 'פרצוף', 'פרצופים': 'פרצוף', 'לבבות': 'לב', 'דגלים': 'דגל', 'אימוגי': '', 'אימוגים': '' }
export function filterEmoji(entries, query = '', category = '', tone = '') {
  const terms = searchText(query).split(/\s+/).filter(Boolean).map(t => SYNONYMS[t] ?? t).filter(Boolean)
  let matches = entries.filter(e => (!category || e.category === category) && terms.every(t => searchText([e.emoji, e.name, ...e.keywords].join(' ')).includes(t)))
  // Best matches first: the whole name or a keyword, then a word that starts with the term, then anywhere.
  if (terms.length) {
    const score = e => terms.reduce((sum, t) => {
      const name = searchText(e.name), words = name.split(/[\s:—-]+/), keys = e.keywords.map(searchText)
      return sum + (name === t || keys.includes(t) ? 0 : words.includes(t) ? 1 : words.some(w => w.startsWith(t)) || keys.some(k => k.startsWith(t)) ? 2 : 3)
    }, 0)
    matches = matches.map((e, i) => [score(e), i, e]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(x => x[2])
  }
  if (tone === 'all') return matches
  if (!tone) return matches.filter(e => e.component || !e.emoji.match(modifiers))
  const variants = new Set(entries.filter(e => { const m = e.emoji.match(modifiers); return m?.length && m.every(v => v === tone) }).map(e => emojiBase(e.emoji)))
  return matches.filter(e => { const m = e.emoji.match(modifiers); return e.component || (m ? m.every(v => v === tone) : !variants.has(emojiBase(e.emoji))) })
}
export function readRecent(value, entries) {
  try { const list = JSON.parse(value); const known = new Set(entries.map(e => e.emoji)); return Array.isArray(list) ? [...new Set(list.filter(x => typeof x === 'string' && known.has(x)))].slice(0, 16) : [] } catch { return [] }
}
export const addRecent = (list, emoji) => [emoji, ...list.filter(x => x !== emoji)].slice(0, 16)
