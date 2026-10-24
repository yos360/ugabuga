// Meaning and pronunciation of a word a reader taps. English: the built-in dictionary (src/data/dictionary,
// loaded on the first tap) through enLemma; anything it lacks — and the other site languages — goes to
// the word-meaning Edge Function, which answers for the word in its sentence and caches the answer.
import { lemmaCandidates } from './enLemma'
import { speak } from './speak'

const URL = import.meta.env?.VITE_PARTY_DB_URL || 'https://efhgyispuwxcplvzipcy.supabase.co'
const KEY = import.meta.env?.VITE_PARTY_DB_KEY || 'sb_publishable_xX1CVQ0baMf_k3EDXAUs0A_-O0Kaql7'
const parts = import.meta.glob('../data/dictionary/en-he-*.js')
let dictPromise = null
export function loadEnglishDictionary() {
  dictPromise ||= Promise.all([...Object.values(parts).map(load => load()), import('../data/dictionary/en-irregular.js')])
    .then(mods => { const irregular = mods.pop().default; return { words: Object.assign({}, ...mods.map(m => m.default)), irregular } })
  return dictPromise
}
export async function builtinMeaning(word) {
  const { words, irregular } = await loadEnglishDictionary()
  for (const c of lemmaCandidates(word, irregular)) if (words[c]) return { meaning: words[c], lemma: c, source: 'dictionary' }
  return null
}
// Hebrew → English from the same built-in dictionary: every Hebrew sense points back to its headwords.
let reverse = null
const heKey = w => String(w).replace(/[\u0591-\u05C7]/g, '').replace(/\([^)]*\)/g, '').trim()
export async function builtinEnglishFor(heWord) {
  if (!reverse) {
    const { words } = await loadEnglishDictionary()
    reverse = new Map()
    for (const [en, he] of Object.entries(words)) for (const sense of he.split(/[,;]/)) { const k = heKey(sense); if (k) reverse.set(k, [...(reverse.get(k) || []), en]) }
  }
  const w = heKey(heWord)
  const hits = reverse.get(w) || (w.length > 3 && /^[והבלמשכ]/.test(w) ? reverse.get(w.slice(1)) : null)
  return hits?.length ? { meaning: hits.slice(0, 3).join(', '), lemma: w, source: 'dictionary' } : null
}
const remote = new Map()
export async function remoteMeaning(word, sentence = '', lang = 'en', to = 'he') {
  const key = `${lang}>${to}|${word.toLowerCase()}|${sentence}`
  if (!remote.has(key)) remote.set(key, fetch(`${URL}/functions/v1/word-meaning`, {
    method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ word, sentence, lang, to }), signal: AbortSignal.timeout(20000),
  }).then(r => (r.ok ? r.json() : null)).then(d => (d?.meaning ? { ...d, source: 'ai' } : null)).catch(() => null))
  return remote.get(key)
}
// lang → to: English→Hebrew and Hebrew→English try the built-in dictionary first; everything else
// (other languages, rare words, Hebrew→simple Hebrew) goes to the function.
export async function meaningOf(word, sentence = '', lang = 'en', to = 'he') {
  if (lang === 'en' && to === 'he') { const hit = await builtinMeaning(word); if (hit) return hit }
  // Hebrew → English: one Hebrew word matches many headwords ("חבר": friend, buddy, member…), and the
  // function knows which is the usual one; the built-in matches are the fallback and the extras.
  if (lang === 'he' && to === 'en') {
    const [ai, local] = await Promise.all([remoteMeaning(word, sentence, lang, to), builtinEnglishFor(word)])
    if (ai) return { ...ai, other: [...new Set([...(ai.other || []), ...(local ? local.meaning.split(', ') : [])])].filter(x => x !== ai.meaning).slice(0, 4) }
    return local
  }
  return remoteMeaning(word, sentence, lang, to)
}

// Pronunciation: a recorded human voice from the free dictionary API when it has one (English only),
// otherwise the device's own voice.
const audioCache = new Map()
async function recordedUrl(word) {
  if (!audioCache.has(word)) audioCache.set(word, fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, { signal: AbortSignal.timeout(6000) })
    .then(r => (r.ok ? r.json() : [])).then(list => {
      const urls = (Array.isArray(list) ? list : []).flatMap(e => (e.phonetics || []).map(p => p.audio)).filter(Boolean)
      return urls.find(u => /-us\.mp3$/.test(u)) || urls[0] || null
    }).catch(() => null))
  return audioCache.get(word)
}
const VOICE = { en: 'en-US', es: 'es-ES', fr: 'fr-FR', ru: 'ru-RU', ar: 'ar-SA', he: 'he-IL' }
export async function pronounce(word, lang = 'en') {
  if (lang === 'en') {
    const url = await recordedUrl(word.toLowerCase())
    if (url) { try { await new Audio(url).play(); return true } catch { /* fall through to the device voice */ } }
  }
  return speak(word, VOICE[lang] || 'en-US', { rate: 0.85 })
}
