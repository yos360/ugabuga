// BugaPedia on this device: the questions asked here (history) and the ones starred (favorites).
// Stored only in localStorage — nothing leaves the browser.
const HISTORY = 'buga-bp-history', FAVORITES = 'buga-bp-favorites', MAX = 50
const read = key => { try { const v = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(v) ? v : [] } catch { return [] } }
const write = (key, list) => { try { localStorage.setItem(key, JSON.stringify(list.slice(0, MAX))) } catch { /* private mode */ } }
const same = (a, b) => a.q === b.q && (a.subject || '') === (b.subject || '')

export const readHistory = () => read(HISTORY)
export const readFavorites = () => read(FAVORITES)
export function rememberQuestion(q, subject) {
  const item = { q, subject: subject || '' }
  write(HISTORY, [item, ...read(HISTORY).filter(x => !same(x, item))])
}
export function toggleFavorite(q, subject) {
  const item = { q, subject: subject || '' }, list = read(FAVORITES)
  const on = !list.some(x => same(x, item))
  write(FAVORITES, on ? [item, ...list] : list.filter(x => !same(x, item)))
  return on
}
export const isFavorite = (q, subject) => read(FAVORITES).some(x => same(x, { q, subject: subject || '' }))
export const clearHistory = () => write(HISTORY, [])

// Pages on this site that fit a question: words of the question (and the answer's first lines)
// matched against the site-search index. Title hits count most; at least one real word must hit.
const STOP = new Set(['מה', 'מי', 'למה', 'איך', 'איפה', 'מתי', 'כמה', 'של', 'את', 'על', 'עם', 'זה', 'הוא', 'היא', 'הם', 'יש', 'אין', 'לא', 'גם', 'כל', 'או', 'אם', 'כי', 'אבל', 'היה', 'היו', 'הכי', 'עושים', 'קורה', 'נקרא', 'קוראים', 'אומרים', 'אפשר', 'צריך', 'יותר', 'פחות', 'כמו', 'בין', 'אחרי', 'לפני', 'ילדים', 'לילדים'])
const PREFIX = /^(וה|שה|כש|מה|לה|בה|ה|ו|ב|ל|מ|ש|כ)(?=[א-ת]{3,})/
// Light stemming so plurals meet singulars: עכבישים → עכביש, שברים → שבר.
const stem = w => (w.length >= 5 ? w.replace(/(ים|ות)$/, '') : w)
const words = text => [...new Set((text.match(/[א-ת]{2,}|[a-zA-Z]{3,}/g) || []).map(w => w.replace(PREFIX, '')).filter(w => w.length >= 3 && !STOP.has(w)).map(stem))]
export async function siteLinksFor(question, answer = '') {
  const { STATIC_ITEMS } = await import('../data/searchStatic.js')
  const q = words(question), a = new Set(words(answer.slice(0, 300)))
  if (!q.length) return []
  const scored = []
  for (const item of STATIC_ITEMS) {
    if (!item.to || item.to.startsWith('/bugapedia')) continue
    const title = new Set(words(item.title || '')), keys = new Set(words(`${item.keys || ''} ${item.desc || ''}`))
    let s = 0, hits = 0, inTitle = 0
    for (const w of q) { if (title.has(w)) { s += 3; hits++; inTitle++ } else if (keys.has(w)) { s += 1; hits++ } }
    // A title hit is a must; with two or more real words in the question, one shared word is not
    // enough (שמיים alone would bring the compass page for "why is the sky blue").
    if (!inTitle || (q.length >= 2 && hits < 2)) continue
    for (const w of title) if (a.has(w)) s += 1
    scored.push([s, item])
  }
  return scored.sort((x, y) => y[0] - x[0]).slice(0, 3).map(([, item]) => item)
}
