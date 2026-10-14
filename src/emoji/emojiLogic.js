export const TONES = ['', '🏻', '🏼', '🏽', '🏾', '🏿', 'all']
const modifiers = /[\u{1F3FB}-\u{1F3FF}]/gu
export const emojiBase = text => text.replace(modifiers, '').replaceAll('\uFE0F', '')
export const searchText = text => String(text).normalize('NFKD').replace(/[\u0591-\u05C7]/g, '').replace(/[׳״'"’]/g, '').toLowerCase().trim()
export function filterEmoji(entries, query = '', category = '', tone = '') {
  const terms = searchText(query).split(/\s+/).filter(Boolean)
  let matches = entries.filter(e => (!category || e.category === category) && terms.every(t => searchText([e.emoji, e.name, ...e.keywords].join(' ')).includes(t)))
  if (tone === 'all') return matches
  if (!tone) return matches.filter(e => e.component || !e.emoji.match(modifiers))
  const variants = new Set(entries.filter(e => { const m = e.emoji.match(modifiers); return m?.length && m.every(v => v === tone) }).map(e => emojiBase(e.emoji)))
  return matches.filter(e => { const m = e.emoji.match(modifiers); return e.component || (m ? m.every(v => v === tone) : !variants.has(emojiBase(e.emoji))) })
}
export function readRecent(value, entries) {
  try { const list = JSON.parse(value); const known = new Set(entries.map(e => e.emoji)); return Array.isArray(list) ? [...new Set(list.filter(x => typeof x === 'string' && known.has(x)))].slice(0, 16) : [] } catch { return [] }
}
export const addRecent = (list, emoji) => [emoji, ...list.filter(x => x !== emoji)].slice(0, 16)
