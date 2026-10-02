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
  keys: [g.category, ...(g.tags || []), ...(g.goals || []), ...(g.contexts || []), ...(g.locations || []),
    !g.equipment_needed && 'בלי ציוד', g.noise_level === 'low' && 'שקט'].filter(Boolean).join(' '),
  ages: g.min_age ? [Number(g.min_age), g.max_age ? Number(g.max_age) : 120] : undefined,
})

// --- matching -------------------------------------------------------------
const norm = s => String(s || '').toLowerCase().replace(/[֑-ׇ]/g, '').replace(/[׳'"״`’”“\-–—_.,!?():;+/]/g, ' ').replace(/\s+/g, ' ').trim()
const FINALS = { ך: 'כ', ם: 'מ', ן: 'נ', ף: 'פ', ץ: 'צ' }
const unfinal = s => s.replace(/[ךםןףץ]/g, c => FINALS[c])

const PREFIX = 'והבלמשכ' // one-letter Hebrew prefixes; up to two may be stacked ("וה", "של", "מה")
const SUFFIXES = ['ימ', 'ות', 'יות', 'ית', 'ה', 'ת', 'י', 'תי', 'תית', 'תיימ'] // in unfinal form ("ים" → "ימ"); "משפחה" → "משפחתי"
const isNum = w => /^\d+$/.test(w)
// Words that say little about what is searched ("משחק לגיל 7"): they never decide whether an item
// matches, they only add a small bonus when they appear.
const QUERY_STOP = new Set(['משחק', 'משחקים', 'משחקי', 'ל', 'של', 'עם', 'לילדים', 'ילדים', 'לילד', 'דף', 'דפי', 'דפים', 'את', 'על', 'או', 'גם', 'רוצה', 'מחפש', 'מחפשת', 'צריך', 'איזה', 'משהו', 'בשביל', 'עבור'].map(unfinal))
// "גיל 7", "לגיל 7", "בן 7", "לבת 6" — the number is an age.
const AGE_WORDS = new Set(['גיל', 'לגיל', 'בגיל', 'גילאי', 'לגילאי', 'בגילאי', 'בן', 'בת', 'לבן', 'לבת', 'בני', 'בנות', 'לבני', 'לבנות'])
// Words people type that the site writes differently. Each group is one meaning.
const SYNONYMS = [
  ['אוטו', 'רכב', 'מכונית', 'נסיעה', 'נסיעות', 'בדרכים'],
  ['משועמם', 'משועממת', 'משועממים', 'משעמם', 'שעמום', 'לבד', 'סולו'],
  ['חשבון', 'מתמטיקה'],
  ['יומולדת', 'יומהולדת'],
].map(g => g.map(unfinal))

// Does one search word match one word of the item? 3 = same word, 2.5 = same word + ending, 2 = word start.
function wordScore(word, tok, allowStart) {
  if (word === tok) return 3
  if (SUFFIXES.some(s => word === tok + s)) return 2.5
  if (allowStart && tok.length >= 3 && word.startsWith(tok)) return 2
  return 0
}
function matchWord(word, tok, allowStart) {
  let best = wordScore(word, tok, allowStart)
  // the item's word with a 1–2 letter prefix stripped: "לפורים", "והחנוכייה", "שלהולדת"
  for (let p = 1; p <= 2 && best < 3; p++) {
    if (word.length - p < 2 || !PREFIX.includes(word[p - 1])) break
    best = Math.max(best, wordScore(word.slice(p), tok, allowStart))
  }
  return best
}

// Ways to read one search word: as typed (weight 1), without a plural/feminine ending, without a prefix, and synonyms.
function variants(word) {
  const u = unfinal(word)
  const out = [{ t: u, w: 1, start: true }]
  const add = (t, w, start) => { if (t.length >= 2 && !out.some(v => v.t === t)) out.push({ t, w, start }) }
  for (const s of SUFFIXES) if (u.length - s.length >= 3 && u.endsWith(s)) add(u.slice(0, -s.length), 0.9, false)
  for (let p = 1; p <= 2; p++) {
    if (u.length - p < 3 || !PREFIX.includes(u[p - 1])) break
    const r = u.slice(p)
    add(r, 0.85, true)
    for (const s of SUFFIXES) if (r.length - s.length >= 4 && r.endsWith(s)) add(r.slice(0, -s.length), 0.8, false)
  }
  for (const g of SYNONYMS) if (out.some(v => g.includes(v.t))) for (const s of g) add(s, 0.6, false)
  return out
}

// Query → tokens. A Hebrew one-letter word stays glued to the word before it ("כיתה א"); digits never do.
export function parseQuery(query) {
  const raw = norm(query).split(' ').filter(Boolean)
  const tokens = []
  for (let i = 0; i < raw.length; i++) {
    const w = raw[i]
    if (isNum(w)) {
      const prev = tokens[tokens.length - 1]
      if (prev && prev.kind === 'word' && AGE_WORDS.has(prev.text)) tokens.pop() // "לגיל 7" → age 7
      tokens.push({ kind: 'num', text: w, n: Number(w), age: !!prev && prev.kind === 'word' && AGE_WORDS.has(prev.text) })
      continue
    }
    if (w.length < 2) { const prev = tokens[tokens.length - 1]; if (prev && prev.kind !== 'num') { prev.kind = 'phrase'; prev.text += ' ' + w } continue }
    tokens.push({ kind: 'word', text: w })
  }
  for (const t of tokens) {
    t.stop = t.kind === 'word' && QUERY_STOP.has(unfinal(t.text))
    if (t.kind === 'word') t.vs = variants(t.text)
    if (t.kind === 'phrase') t.parts = t.text.split(' ').map(unfinal)
  }
  // only stopwords ("משחקים")? then they are what's searched
  if (tokens.length && tokens.every(t => t.stop)) tokens.forEach(t => { t.stop = false })
  return tokens
}

const prepared = new WeakMap()
function prep(it) {
  let p = prepared.get(it)
  if (!p) {
    p = { title: unfinal(norm(it.title)).split(' ').filter(Boolean), best: unfinal(norm(it.best)).split(' ').filter(Boolean), rest: unfinal(norm(`${it.desc || ''} ${it.keys || ''}`)).split(' ').filter(Boolean) }
    prepared.set(it, p)
  }
  return p
}

// best match quality of a token inside a list of words → { q (0–3, weighted), first (matched the first word) }
function tokenIn(words, t) {
  let best = 0, first = false
  for (let i = 0; i < words.length; i++) {
    let q = 0
    if (t.kind === 'num') q = words[i] === t.text ? 3 : 0
    else if (t.kind === 'phrase') {
      if (i + t.parts.length <= words.length && matchWord(words[i], t.parts[0], false) >= 2.5 && t.parts.slice(1).every((p, k) => words[i + 1 + k] === p)) q = 3
    } else for (const v of t.vs) q = Math.max(q, matchWord(words[i], v.t, v.start) * v.w)
    if (q > best) { best = q; first = i === 0 }
  }
  return { q: best, first }
}

function scoreToken(p, it, t) {
  if (t.kind === 'num' && t.age) {
    // an age ("לגיל 7"): pages made for exactly that age, then games whose age range covers it.
    // A plain number in a title ("7 טעויות נפוצות") is only a weak hint.
    const a = it.ages
    if (a && t.n >= a[0] && t.n <= a[1]) return a[0] === a[1] ? 12 : 5
    if (it.low) return 0 // "מה קרה ב-12 ב..." is a date, not an age
    return tokenIn(p.title, t).q ? 4 : tokenIn(p.rest, t).q ? 2 : 0
  }
  const inTitle = tokenIn(p.title, t)
  if (p.best.length && tokenIn(p.best, t).q >= 2.5) return Math.max(12, inTitle.q * 4) + 3 + (inTitle.q ? 1 : 0) // a "best bet" word of this page
  if (inTitle.q) return inTitle.q * 4 + (inTitle.first ? 2 : 0) // 8–14
  const inRest = tokenIn(p.rest, t)
  if (inRest.q) return inRest.q * 1.2 // 2.4–3.6
  if (t.kind === 'num' && it.ages && t.n >= it.ages[0] && t.n <= it.ages[1]) return 2.5 // a bare number may still be an age
  return 0
}

export function searchItems(items, query) {
  const tokens = parseQuery(query)
  const req = tokens.filter(t => !t.stop), stops = tokens.filter(t => t.stop)
  if (!req.length) return []
  const whole = unfinal(norm(query))
  const scored = []
  let maxHit = 0
  for (const it of items) {
    const p = prep(it)
    let score = 0, hits = 0
    for (const t of req) { const s = scoreToken(p, it, t); if (s) { hits++; score += s } }
    if (!hits) continue
    for (const t of stops) { const s = scoreToken(p, it, t); if (s) score += s >= 8 ? 2 : 1 }
    if (p.title.join(' ') === whole) score += 20
    score += it.kind === 'tool' ? 2 : it.kind === 'game' ? 1 : 0
    if (it.low) score -= 6 // 366 date pages shouldn't crowd out games and tools
    maxHit = Math.max(maxHit, hits)
    scored.push({ ...it, score: Math.round(score * 10) / 10, hits })
  }
  // Items with every searched word first. If none has them all, the items that have the most of them
  // (and the next tier too when that leaves very few), so a long query never ends in "no results".
  const tiers = maxHit === req.length ? [maxHit] : [maxHit, maxHit - 1]
  let out = scored.filter(x => x.hits === tiers[0])
  if (tiers.length > 1 && out.length < 6 && tiers[1] > 0) out = out.concat(scored.filter(x => x.hits === tiers[1]))
  return out.sort((a, b) => b.hits - a.hits || b.score - a.score || (a.low && b.low ? a.to.localeCompare(b.to) : a.title.length - b.title.length))
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
