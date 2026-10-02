// Lightweight search helpers (matching, suggestions). The heavy static catalog
// lives in ./searchStatic.js and is loaded on demand.
import { gameHref } from './gameHref'

export const KINDS = {
  game: { label: 'משחקים', order: 1 },
  tool: { label: 'כלים ומחוללים', order: 2 },
  printable: { label: 'דפים להדפסה', order: 3 },
  page: { label: 'אזורים ועמודים', order: 4 },
  idea: { label: 'רעיונות, מדריכים ומתנות', order: 5 },
}


export const gameItem = g => ({
  to: gameHref(g.slug), title: g.name, emoji: '🎮', kind: 'game', desc: g.short_description || '',
  keys: [g.category, ...(g.tags || []), ...(g.goals || []), ...(g.contexts || [])].filter(Boolean).join(' '),
})

// --- matching -------------------------------------------------------------
const norm = s => String(s || '').toLowerCase().replace(/[֑-ׇ]/g, '').replace(/[׳'"״`’”“\-–—_.,!?():;]/g, ' ').replace(/\s+/g, ' ').trim()
const FINALS = { ך: 'כ', ם: 'מ', ן: 'נ', ף: 'פ', ץ: 'צ' }
const unfinal = s => s.replace(/[ךםןףץ]/g, c => FINALS[c])

// Hebrew variants of one search word: with/without a one-letter prefix (ה ו ב ל מ ש כ) and a plural/feminine ending.
function variants(word) {
  const v = new Set([word])
  if (word.includes(' ')) return [word, unfinal(word)]
  if (word.length > 3 && 'הובלמשכ'.includes(word[0])) v.add(word.slice(1))
  for (const w of [...v]) {
    const u = unfinal(w)
    v.add(u)
    for (const suf of ['ים', 'ות', 'ה', 'ת', 'י']) if (u.length > suf.length + 2 && u.endsWith(suf)) v.add(u.slice(0, -suf.length))
  }
  return [...v].filter(x => x.length >= 2)
}

export function searchItems(items, query) {
  // one-letter words ("כיתה א") stay glued to the word before them
  const words = norm(query).split(' ').filter(Boolean).reduce((acc, w) => { if (w.length < 2 && acc.length) acc[acc.length - 1] += ' ' + w; else if (w.length >= 2) acc.push(w); return acc }, [])
  if (!words.length) return []
  const vs = words.map(variants)
  const scored = []
  for (const it of items) {
    const title = unfinal(norm(it.title)), rest = unfinal(norm(`${it.desc || ''} ${it.keys || ''}`))
    let score = 0, all = true
    for (const vw of vs) {
      const inTitle = vw.some(v => title.includes(v)), inRest = vw.some(v => rest.includes(v))
      if (!inTitle && !inRest) { all = false; break }
      score += inTitle ? (vw.some(v => title.startsWith(v) || title.includes(' ' + v)) ? 12 : 8) : 3
    }
    if (!all) continue
    if (title === unfinal(norm(query))) score += 20
    score += it.kind === 'tool' ? 2 : it.kind === 'game' ? 1 : 0
    if (it.low) score -= 6 // 366 date pages shouldn't crowd out games and tools
    scored.push({ ...it, score })
  }
  return scored.sort((a, b) => b.score - a.score || (a.low && b.low ? a.to.localeCompare(b.to) : a.title.length - b.title.length))
}

// Autocomplete: phrases that really appear on the site (titles, 1–4 words; keywords, single words) that
// continue what's being typed, plus the best direct hits.
let vocab = null, vocabFor = null
const STOP = new Set(['של', 'או', 'את', 'עם', 'לפי', 'על', 'עד', 'גם', 'כל', 'זה', 'לא', 'בלי', 'אל', 'מן', 'כמו', 'יותר', 'הכי', 'איך', 'מה', 'ל', 'ב', 'ו', 'ה'])
function buildVocab(items) {
  const count = new Map()
  const add = w => { if (w.length >= 2 && !/^\d+$/.test(w)) count.set(w, (count.get(w) || 0) + 1) }
  for (const it of items) {
    if (it.low) continue
    // phrases never cross a dash/colon/comma ("מנהרת הזמן של בוגה – משחק יומי" ≠ "בוגה משחק")
    for (const seg of String(it.title).split(/\s[–—-]\s|[:,|?!()]/)) {
      const t = norm(seg).split(' ').filter(Boolean)
      for (let i = 0; i < t.length; i++) for (let n = 1; n <= 4 && i + n <= t.length; n++) {
        const ph = t.slice(i, i + n)
        if (STOP.has(ph[0]) || STOP.has(ph[ph.length - 1])) continue // no "צבעו לפי", "של בוגה"
        add(ph.join(' '))
      }
    }
    for (const w of norm(it.keys || '').split(' ')) if (!STOP.has(w)) add(w)
  }
  return [...count].sort((a, b) => b[1] - a[1] || a[0].length - b[0].length).map(([w]) => ({ w, u: unfinal(w) }))
}
export function suggest(items, input, { words = 6, hits = 6 } = {}) {
  const raw = String(input || '')
  const n = unfinal(norm(raw))
  if (!n) return { words: [], hits: [] }
  if (vocabFor !== items) { vocab = buildVocab(items); vocabFor = items }
  const seen = new Set()
  const completions = raw.endsWith(' ') && !n.includes(' ') ? [] : vocab
    .filter(({ u }) => u.startsWith(n) && u !== n)
    .filter(({ u }) => !seen.has(u) && seen.add(u))
    .slice(0, words).map(({ w }) => w)
  return { words: completions, hits: n.length >= 2 ? searchItems(items, raw).slice(0, hits) : [] }
}
